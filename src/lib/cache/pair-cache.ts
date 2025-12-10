interface PairCache {
  pairAddress: `0x${string}`
  token0: `0x${string}`
  decimalsIn: number
  decimalsOut: number
  timestamp: number
}

const cache = new Map<string, PairCache>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export function getCachedPair(tokenIn: string, tokenOut: string): PairCache | null {
  const key = `${tokenIn}-${tokenOut}`
  const cached = cache.get(key)
  
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  
  return cached
}

export function setCachedPair(
  tokenIn: string,
  tokenOut: string,
  data: Omit<PairCache, 'timestamp'>
) {
  const key = `${tokenIn}-${tokenOut}`
  cache.set(key, { ...data, timestamp: Date.now() })
}