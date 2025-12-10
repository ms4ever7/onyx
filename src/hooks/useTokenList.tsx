import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { fetchTokenList, getPopularTokens } from '@/lib/api/token-list'
import type { Token } from '@/lib/utils/token'

export function useTokenList() {
  const { chain } = useAccount()
  const chainId = chain?.id || 1

  const [tokens, setTokens] = useState<Token[]>([])
  const [popularTokens, setPopularTokens] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTokens() {
      setIsLoading(true)
      try {
        const tokenList = await fetchTokenList(chainId)
        setTokens(tokenList)
        setPopularTokens(getPopularTokens(tokenList))
      } catch (error) {
        console.error('Error loading tokens:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTokens()
  }, [chainId])

  return { 
    tokens, 
    popularTokens, 
    isLoading 
  }
}