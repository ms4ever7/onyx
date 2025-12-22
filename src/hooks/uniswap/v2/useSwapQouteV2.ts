import { useEffect, useState, useCallback } from 'react';
import { ERC20_ABI, UNISWAP_V2_ADDRESSES, UNISWAP_V2_PAIR_ABI } from '@/lib/contracts/uniswap-v2';
import { formatUnits, parseUnits, getAddress, keccak256, encodePacked, getCreate2Address } from 'viem';
import { Token, toRouteAddress } from '@/lib/utils/token';
import { getCachedPair, setCachedPair } from '@/lib/cache/pair-cache-v2';
import { createPublicClientForChain } from '@/lib/viem/publicClient';
import { useChainId } from 'wagmi';

// Const Uniswap V2 Init Code Hash
const V2_INIT_CODE_HASH = '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f' as const;

export function useSwapQouteV2(amountIn: string, tokenIn: Token | null, tokenOut: Token | null) {
  const chainId = useChainId();
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuote = useCallback(async (isAutoRefresh = false, signal: { cancelled: boolean }) => {
    if (!amountIn || !tokenIn || !tokenOut || parseFloat(amountIn) <= 0) {
      setData(null);
      return;
    }

    if (!isAutoRefresh) setLoading(true);

    try {
      const publicClient = createPublicClientForChain(chainId);
      const addrA = getAddress(toRouteAddress(tokenIn));
      const addrB = getAddress(toRouteAddress(tokenOut));

      const [token0, token1] = addrA.toLowerCase() < addrB.toLowerCase() ? [addrA, addrB] : [addrB, addrA];
      const addresses = UNISWAP_V2_ADDRESSES[chainId];
      if (!addresses) throw new Error(`Chain ${chainId} not supported`);

      // Deterministi way of getting pair for uniswap
      const salt = keccak256(encodePacked(['address', 'address'], [token0, token1]));
      const pairAddress = getCreate2Address({
        from: getAddress(addresses.FACTORY),
        salt,
        bytecodeHash: V2_INIT_CODE_HASH,
      });

      const cached = getCachedPair(addrA, addrB);
      
      const contracts: any[] = [
        { address: pairAddress, abi: UNISWAP_V2_PAIR_ABI, functionName: 'getReserves' },
      ];

      const needsDecimals = !cached;
      if (needsDecimals) {
        contracts.push({ address: addrA, abi: ERC20_ABI, functionName: 'decimals' });
        contracts.push({ address: addrB, abi: ERC20_ABI, functionName: 'decimals' });
      }

      const results = await publicClient.multicall({ contracts });

      if (results[0].status === 'failure' || !results[0].result) {
        throw new Error("Pair does not exist or fetch failed");
      }

      const reserves = results[0].result as [bigint, bigint, number];

      let decIn: number, decOut: number;
      if (needsDecimals) {
        if (results[1].status === 'failure' || results[2].status === 'failure') {
          throw new Error("Failed to fetch decimals");
        }
        decIn = Number(results[1].result);
        decOut = Number(results[2].result);
        setCachedPair(addrA, addrB, { pairAddress, token0, decimalsIn: decIn, decimalsOut: decOut });
      } else {
        decIn = cached!.decimalsIn;
        decOut = cached!.decimalsOut;
      }

      const [reserve0, reserve1] = reserves;
      const [reserveIn, reserveOut] = addrA === token0 ? [reserve0, reserve1] : [reserve1, reserve0];
      
      const amountInParsed = parseUnits(amountIn, decIn);
      const amountInWithFee = amountInParsed * 997n;
      const numerator = amountInWithFee * reserveOut;
      const denominator = (reserveIn * 1000n) + amountInWithFee;
      
      if (denominator === 0n) throw new Error("Zero liquidity");
      
      const amountOutFormatted = formatUnits(numerator / denominator, decOut);

      if (!signal.cancelled) {
        setData(amountOutFormatted);
        setError(null);
      }
    } catch (err) {
      if (!signal.cancelled) {
        setError(err instanceof Error ? err : new Error('Swap quote failed'));
        setData(null);
      }
    } finally {
      if (!signal.cancelled && !isAutoRefresh) setLoading(false);
    }
  }, [amountIn, tokenIn, tokenOut, chainId]);

  useEffect(() => {
    const signal = { cancelled: false };
    fetchQuote(false, signal);

    const intervalId = setInterval(() => fetchQuote(true, signal), 10000);
    return () => {
      signal.cancelled = true;
      clearInterval(intervalId);
    };
  }, [fetchQuote]);

  return { data, loading, error };
}
