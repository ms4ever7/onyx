import { useEffect, useState } from 'react';
import { ERC20_ABI } from '@/lib/contracts/uniswap-v2';
import { Token, toRouteAddress } from '@/lib/utils/token';
import { createPublicClientForChain } from '@/lib/viem/publicClient';
import { useChainId } from 'wagmi';
import { UNISWAP_V3_ADDRESSES, UNISWAP_V3_POOL_ABI } from '@/lib/contracts/uniswap-v3';
import Decimal from 'decimal.js';
import { computePoolAddress as uniswapComputePoolAddress } from '@uniswap/v3-sdk';
import { Token as UniToken } from '@uniswap/sdk-core';
import { getCachedPool, setCachedPool } from '@/lib/cache/pool-cache-v3';
import { useDebounce } from '@/hooks/useDebouce';
import { Hash } from 'viem';

// --- LEARNING INTERFACES ---
interface TickData {
  liquidityNet: bigint;
}

interface PoolSnapshot {
  sqrtPriceX96: bigint;
  currentTick: number;
  globalLiquidity: bigint;
  bitmap: Record<number, bigint>;
  initializedTicks: Record<number, TickData>;
  tickSpacing: number;
  fee: number;
}

// Global cache to persist tick "guesses" across swaps
const lastTickCache: Record<string, number> = {};

Decimal.set({ precision: 40 });
const Q96 = new Decimal(2).pow(96);


// Bit manipulation helpers
function getMsb(n: bigint): number { return n.toString(2).length - 1; }
function getLsb(n: bigint): number {
  if (n === 0n) return 0;
  let s = n.toString(2);
  return s.length - s.lastIndexOf('1') - 1;
}

function findNextTickLocal(
  snapshot: PoolSnapshot,
  currentTick: number,
  tickSpacing: number,
  isTokenInToken0: boolean
): number {
  let compressed = Math.floor(currentTick / tickSpacing);
  if (currentTick < 0 && currentTick % tickSpacing !== 0) compressed--;

  let wordPos = isTokenInToken0 ? (compressed >> 8) : ((compressed + 1) >> 8);
  const bitmap = snapshot.bitmap[wordPos] || 0n;

  if (isTokenInToken0) {
    //Some Number between 0 to 255
    let bitPos = Math.abs(compressed % 256);

    if (compressed < 0 && bitPos !== 0) bitPos = 256 - bitPos;
    //We cover all not needed bits , leave only needed and mark them all with 1 (so right ones masked)
    const mask = (1n << BigInt(bitPos)) - 1n + (1n << BigInt(bitPos));

    //We leave only masked 1 that are in bitmap  (if its 1&0 = 0 so should be 1&1)
    const masked = bitmap & mask;

    // Finally here we just take the most significant bit - the biggest one
    if (masked !== 0n) return (compressed - (bitPos - getMsb(masked))) * tickSpacing;
    return (compressed - bitPos) * tickSpacing; 
  } else {
    let nextTickCompressed = compressed + 1;
    let bitPos = Math.abs(nextTickCompressed % 256);
    //Some Number between 0 to 255
    if (nextTickCompressed < 0 && bitPos !== 0) bitPos = 256 - bitPos;

    //We cover all not needed bits , leave only needed and mark them all with 1 (so left ones masked)
    const mask = ~((1n << BigInt(bitPos)) - 1n);
    const masked = bitmap & mask;

    // Finally here we just take the lowest significant bit - the lowest one
    if (masked !== 0n) return (nextTickCompressed + (getLsb(masked) - bitPos)) * tickSpacing;
    return (nextTickCompressed + (255 - bitPos)) * tickSpacing;
  }
}

export function useSwapQuoteV3(amountIn: string, tokenIn: Token | null, tokenOut: Token | null) {
  const chainId = useChainId();
  const [data, setData] = useState<string | null>(null);
  const [activeFee, setActiveFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedAmount = useDebounce(amountIn, 400);

  useEffect(() => {
    let cancelled = false;
    let bestFee = 500;

    async function updateQoute(isSilent = false) {
      if (!tokenIn || !tokenOut || !debouncedAmount || parseFloat(debouncedAmount) <= 0) return;
      if (!isSilent) setLoading(true);

      const startTime = performance.now();

      try {
        const publicClient = createPublicClientForChain(chainId);
        const routeTokenIn = toRouteAddress(tokenIn as Token) as Hash;
        const routeTokenOut = toRouteAddress(tokenOut as Token) as Hash;
        const addresses = UNISWAP_V3_ADDRESSES[chainId];

        // --- 1. (Dynamic Fee Discovery) ---
        const feeTiers = [3000, 500, 10000, 100];

        let poolAddress: Hash | null = null;
        const cached = getCachedPool(routeTokenIn, routeTokenOut, chainId, 0);
        
        if (cached) {
          poolAddress = cached.poolAddress;
          bestFee = cached.fee;
        } else {
          // If no liquidity then getting it with Multicall
          const t0 = new UniToken(chainId, routeTokenIn, 18, '', '');
          const t1 = new UniToken(chainId, routeTokenOut, 18, '', '');
          
          const poolAddresses = feeTiers.map(fee => uniswapComputePoolAddress({
            factoryAddress: addresses.FACTORY,
            tokenA: t0,
            tokenB: t1,
            fee,
          }) as Hash);

          const liquidityResults = await publicClient.multicall({
            contracts: poolAddresses.map(addr => ({
              address: addr,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'liquidity',
            }))
          });

          let maxLiq = -1n;
          liquidityResults.forEach((res, idx) => {
            const liq = (res.result as bigint) ?? 0n;
            if (liq > maxLiq) {
              maxLiq = liq;
              bestFee = feeTiers[idx];
              poolAddress = poolAddresses[idx];
            }
          });
        }

        if (!poolAddress) throw new Error("No pool found");

        // --- 2. FETCH POOL DATA ---
        let metadata = getCachedPool(routeTokenIn, routeTokenOut, chainId, bestFee);
        
        const lastKnownTick = lastTickCache[poolAddress] || 0;
        const tSpacing = metadata?.tickSpacing || 60; 
        const estimatedWordPos = Math.floor(lastKnownTick / tSpacing) >> 8;
        const RANGE = 5; 
        const wordPositions = Array.from({ length: RANGE * 2 + 1 }, (_, i) => estimatedWordPos - RANGE + i);

        // 2. Forming contract list for request
        const stateContracts = metadata 
          ? [
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'slot0' },
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'liquidity' },
            ]
          : [
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'slot0' },
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'liquidity' },
              { address: routeTokenIn, abi: ERC20_ABI, functionName: 'decimals' },
              { address: routeTokenOut, abi: ERC20_ABI, functionName: 'decimals' },
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'token0' },
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'tickSpacing' },
              { address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'fee' }
            ];

        const bitmapContracts = wordPositions.map(pos => ({
          address: poolAddress!, 
          abi: UNISWAP_V3_POOL_ABI, 
          functionName: 'tickBitmap', 
          args: [pos]
        }));

        const allResults = await publicClient.multicall({
          contracts: [...stateContracts, ...bitmapContracts]
        });

        const stateCount = stateContracts.length;
        const stateResults = allResults.slice(0, stateCount);
        const bitmapResults = allResults.slice(stateCount);

        const preData = stateResults.map(r => r.result);
        if (!preData[0]) throw new Error("Pool data not found");

        if (!metadata) {
          metadata = {
            poolAddress: poolAddress!,
            decimalsIn: preData[2] as number,
            decimalsOut: preData[3] as number,
            token0: preData[4] as Hash,
            tickSpacing: Number(preData[5]),
            fee: Number(preData[6]),
            timestamp: Date.now()
          };
          setCachedPool(routeTokenIn, routeTokenOut, chainId, bestFee, metadata);
        }

        const slot0 = preData[0] as [bigint, number, number, number, number, number, boolean];
        const currentLiquidity = preData[1] as bigint;
        lastTickCache[poolAddress!] = slot0[1];

        const snapshot: PoolSnapshot = {
          sqrtPriceX96: slot0[0],
          currentTick: slot0[1],
          globalLiquidity: currentLiquidity,
          tickSpacing: metadata.tickSpacing,
          fee: metadata.fee,
          bitmap: wordPositions.reduce((acc, pos, i) => ({ 
            ...acc, 
            [pos]: (bitmapResults[i]?.result as bigint) ?? 0n 
          }), {}),
          initializedTicks: {}
        };

        // --- 3. FETCH TICK LIQUIDITY & EXECUTION ---
        const isTokenInToken0 = routeTokenIn.toLowerCase() === metadata.token0.toLowerCase();
        const initializedIndices: number[] = [];
        Object.entries(snapshot.bitmap).forEach(([wPosStr, val]) => {
          const wPos = Number(wPosStr);
          const bm = BigInt(val);
          if (bm === 0n) return;
          for (let bit = 0; bit < 256; bit++) {
            if ((bm >> BigInt(bit)) & 1n) {
              initializedIndices.push(((wPos << 8) | bit) * snapshot.tickSpacing);
            }
          }
        });

        const relevantTicks = initializedIndices
          .filter(t => isTokenInToken0 ? t < snapshot.currentTick : t > snapshot.currentTick)
          .sort((a, b) => isTokenInToken0 ? b - a : a - b)
          .slice(0, 50);

        if (relevantTicks.length > 0) {
          const ticksResults = await publicClient.multicall({
            contracts: relevantTicks.map(t => ({
              address: poolAddress!, abi: UNISWAP_V3_POOL_ABI, functionName: 'ticks', args: [t]
            }))
          });
          relevantTicks.forEach((t, index) => {
            const res = ticksResults[index]?.result as any;
            if (res) snapshot.initializedTicks[t] = { liquidityNet: BigInt(res[1]) };
          });
        }

        const feeMult = new Decimal(1).minus(new Decimal(metadata.fee).div(1000000));
        let amountRem = new Decimal(debouncedAmount).mul(new Decimal(10).pow(metadata.decimalsIn)).mul(feeMult);
        let currSqrtP = new Decimal(snapshot.sqrtPriceX96.toString()).div(Q96);
        let currLiq = new Decimal(snapshot.globalLiquidity.toString());
        let totalOut = new Decimal(0);
        let activeTick = snapshot.currentTick;
        let iter = 0;

        while (amountRem.gt(0) && iter < 200) {
          iter++;
          const nextTick = findNextTickLocal(snapshot, activeTick, metadata.tickSpacing, isTokenInToken0);
          const sqrtPNext = new Decimal(1.0001).pow(nextTick).sqrt();
          
          let amountToNext = isTokenInToken0 
            ? currLiq.mul(currSqrtP.sub(sqrtPNext)).div(currSqrtP.mul(sqrtPNext))
            : currLiq.mul(sqrtPNext.sub(currSqrtP));

          if (amountRem.gte(amountToNext)) {
            let stepOut = isTokenInToken0 
              ? currLiq.mul(currSqrtP.sub(sqrtPNext))
              : currLiq.mul(sqrtPNext.sub(currSqrtP)).div(sqrtPNext.mul(currSqrtP));
            totalOut = totalOut.add(stepOut.abs());
            amountRem = amountRem.sub(amountToNext);
            currSqrtP = sqrtPNext;
            const tInfo = snapshot.initializedTicks[nextTick];
            if (tInfo) {
              const net = new Decimal(tInfo.liquidityNet.toString());
              currLiq = isTokenInToken0 ? currLiq.sub(net) : currLiq.add(net);
            }
            activeTick = isTokenInToken0 ? nextTick - 1 : nextTick;
          } else {
            let finalSqrtP = isTokenInToken0
              ? currLiq.mul(currSqrtP).div(currLiq.add(amountRem.mul(currSqrtP)))
              : currSqrtP.add(amountRem.div(currLiq));
            let finalOut = isTokenInToken0
              ? currLiq.mul(currSqrtP.sub(finalSqrtP))
              : currLiq.mul(currSqrtP.sub(finalSqrtP)).div(finalSqrtP.mul(currSqrtP));
            totalOut = totalOut.add(finalOut.abs());
            amountRem = new Decimal(0);
          }
        }

        if (!cancelled) {
          setData(totalOut.div(new Decimal(10).pow(metadata.decimalsOut)).toFixed(metadata.decimalsOut));
          setActiveFee(bestFee);
          console.log(`[Success] Best Fee: ${bestFee}, Time: ${(performance.now() - startTime).toFixed(2)}ms`);
        }
      } catch (err) {
        if (!cancelled) {
          setActiveFee(null);
          console.error("Quote error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    updateQoute();
    const interval = setInterval(() => updateQoute(true), 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [debouncedAmount, tokenIn, tokenOut, chainId]);

  return { data, loading, activeFee };
}
