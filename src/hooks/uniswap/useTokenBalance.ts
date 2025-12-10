import { useCallback, useEffect, useState } from 'react';
import { fetchTokenBalance, Token } from '@/lib/utils/token';
import { useChainId } from 'wagmi';

export function useTokenBalance(
  token: Token | null,
  userAddress?: `0x${string}`,  
) {
  const chainId = useChainId();
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!token || !userAddress) {
      setBalance(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const balanceStr = await fetchTokenBalance(token, userAddress, chainId)
      setBalance(balanceStr)
    } catch (err) {
      console.error('Error fetching token balance:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setBalance(null)
    } finally {
      setIsLoading(false)
    }
  }, [token, userAddress])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return { 
    balance, 
    isLoading,
    error,
    refetchBalance: fetchBalance 
  }
}
