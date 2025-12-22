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
    let isMounted = true;

    async function loadTokens() {
      setIsLoading(true)
      setTokens([]) 
      setPopularTokens([])

      try {
        const tokenList = await fetchTokenList(chainId)
        if (isMounted) {
          setTokens(tokenList)
          setPopularTokens(getPopularTokens(tokenList))
        }
      } catch (error) {
        console.error('Error loading tokens:', error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadTokens()
    return () => { isMounted = false };
  }, [chainId])

  return { tokens, popularTokens, isLoading }
}