import { useCallback, useEffect, useState } from 'react';
import { fetchTokenBalance, Token } from '@/lib/utils/token';
import { useChainId } from 'wagmi';
import { Hash } from 'viem';

export function useTokenBalance(
  token: Token | null,
  userAddress?: Hash,  
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

    if (chainId === 11155111 && token.address === '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48') {
      console.warn("Preventing balance fetch for Mainnet USDC on Sepolia");
      setBalance("0");
      return;
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
