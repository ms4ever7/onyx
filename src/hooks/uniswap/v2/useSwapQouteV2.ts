import { useEffect, useState } from 'react';
import { ERC20_ABI, UNISWAP_V2_ADDRESSES, UNISWAP_V2_FACTORY_ABI, UNISWAP_V2_PAIR_ABI } from '@/lib/contracts/uniswap-v2';
import { formatUnits, parseUnits } from 'viem';
import { Token, toRouteAddress } from '@/lib/utils/token';
import { getCachedPair, setCachedPair } from '@/lib/cache/pair-cache';
import { createPublicClientForChain } from '@/lib/viem/publicClient';
import { useChainId } from 'wagmi';

export function useSwapQouteV2(amountIn: string, tokenIn: Token | null, tokenOut: Token | null) {
  const chainId = useChainId();
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!tokenIn || !tokenOut) return;
    let cancelled = false

    async function fetchQoute() {
      if (!amountIn || !tokenIn || !tokenOut || parseFloat(amountIn) <= 0) {
        setData(null)
        return
      }

      try {
        const publicClient = createPublicClientForChain(chainId);
        const routeTokenIn = toRouteAddress(tokenIn)
        const routeTokenOut = toRouteAddress(tokenOut)
        const cached = getCachedPair(routeTokenIn, routeTokenOut)
        
        let pairAddress: `0x${string}`;
        let token0Address: `0x${string}`;
        let decimalsIn: number;
        let decimalsOut: number;

        const addresses = UNISWAP_V2_ADDRESSES[publicClient.chain.id]
        if (!addresses) {
          throw new Error(`Uniswap V2 not supported on chain ${publicClient.chain.id}`)
        }

        if (!cached) {
          pairAddress = await publicClient.readContract({
            address: addresses.FACTORY,
            abi: UNISWAP_V2_FACTORY_ABI,
            functionName: "getPair",
            args: [routeTokenIn, routeTokenOut],
          });

          if (pairAddress === "0x0000000000000000000000000000000000000000") {
            throw new Error("Pair does not exist");
          }

          token0Address = await publicClient.readContract({
            address: pairAddress,
            abi: UNISWAP_V2_PAIR_ABI,
            functionName: "token0",
          });

          const [decIn, decOut] = await Promise.all([
            publicClient.readContract({
              address: routeTokenIn,
              abi: ERC20_ABI,
              functionName: "decimals",
            }),
            publicClient.readContract({
              address: routeTokenOut,
              abi: ERC20_ABI,
              functionName: "decimals",
            }),
          ]);

          decimalsIn = decIn;
          decimalsOut = decOut;

          setCachedPair(routeTokenIn, routeTokenOut, {
            pairAddress,
            token0: token0Address,
            decimalsIn,
            decimalsOut,
          });
        } else {
          ({ pairAddress, token0: token0Address, decimalsIn, decimalsOut } = cached);
        }

        const [reserve0, reserve1] = await publicClient.readContract({
          address: pairAddress,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: 'getReserves',
          args: [],
        });

        const [reserveIn, reserveOut] = token0Address.toLowerCase() === routeTokenIn.toLowerCase()
          ? [reserve0, reserve1] 
          : [reserve1, reserve0]
        
        const amountInParsed = parseUnits(amountIn, decimalsIn)
        
        const amountInWithFee = amountInParsed * 997n;
        const numerator = amountInWithFee * reserveOut
        const denominator = (reserveIn * 1000n) + amountInWithFee
        const amountOutParsed = numerator / denominator

        const amountOutFormatted = formatUnits(amountOutParsed, decimalsOut)

        if (!cancelled) {
          setData(amountOutFormatted)
        }
    } catch (err) {
      if (!cancelled) {
          console.error('Error fetching quote:', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setData(null)
      }
    } finally {
        setLoading(false);
      }
    }

    fetchQoute();

    return () => {
      cancelled = true
    }
  }, [amountIn, tokenIn, tokenOut]);

  return { data, loading, error }
}
