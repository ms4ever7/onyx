import { useQuery } from '@tanstack/react-query'
import { fetchCoinData, fetchCoinChart, fetchCoinListFromCoinGecko } from '@/lib/api/coingecko'

/**
 * Hook to fetch current price data for a coin
 */
export function useCoinPrice(coinId: string) {
  return useQuery({
    queryKey: ['coin-price', coinId],
    queryFn: () => fetchCoinData(coinId),
    refetchInterval: 60000, // Refetch every 60 seconds
    enabled: !!coinId,
  })
}

/**
 * Hook to fetch historical chart data
 */
export function useCoinChart(coinId: string, days: number | 'max' = 7) {
  return useQuery({
    queryKey: ['coin-chart', coinId, days],
    queryFn: () => fetchCoinChart(coinId, days),
    refetchInterval: 120000, // Refetch every 2 minutes
    enabled: !!coinId,
  })
}

/**
 * Hook to fetch top coins by market cap
 */
export function useTopCoins(limit = 100) {
  return useQuery({
    queryKey: ['top-coins', limit],
    queryFn: () => fetchCoinListFromCoinGecko(),
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  })
}