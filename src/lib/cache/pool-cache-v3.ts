import { Hash } from "viem";

interface PoolMetadata {
  poolAddress: Hash;
  token0: Hash;
  decimalsIn: number;
  decimalsOut: number;
  tickSpacing: number;
  fee: number;
  timestamp: number;
}

const poolCache = new Map<string, PoolMetadata>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

export function getCachedPool(tokenIn: string, tokenOut: string, chainId: number, fee: number): PoolMetadata | null {
  const key = `${chainId}-${tokenIn}-${tokenOut}-${fee}`;
  const cached = poolCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    poolCache.delete(key);
    return null;
  }
  return cached;
}

export function setCachedPool(tokenIn: string, tokenOut: string, chainId: number, fee: number, data: Omit<PoolMetadata, 'timestamp'>) {
  const key = `${chainId}-${tokenIn}-${tokenOut}-${fee}`;
  poolCache.set(key, { ...data, timestamp: Date.now() });
}
