import { useCallback, useEffect, useState } from 'react';
import { getUniswapV2Addresses } from '@/lib/contracts/uniswap-v2';
import { fetchTokenAllowance, Token } from '@/lib/utils/token';
import { useChainId } from 'wagmi';

export function useTokenAllowanceV2(
  token: Token | null,
  owner: `0x${string}` | undefined
) {
  const chainId = useChainId();
  const [allowance, setAllowance] = useState<bigint | null>(null)

  const fetchAllowance = useCallback(async () => {
    if (!token || !owner) {
      setAllowance(null)
      return
    }
    
    try {
      const addresses = getUniswapV2Addresses(chainId)
      const allowanceValue = await fetchTokenAllowance(token, owner, addresses.ROUTER, chainId)
      setAllowance(allowanceValue)
    } catch (err) {
      console.error('Error fetching allowance:', err)
      setAllowance(null)
    }
  }, [token, owner])

  useEffect(() => {
    fetchAllowance()
  }, [fetchAllowance])

  return { 
    allowance, 
    refetch: fetchAllowance 
  }
}
