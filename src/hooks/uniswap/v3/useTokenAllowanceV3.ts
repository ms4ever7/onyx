import { useCallback, useEffect, useState } from 'react';
import { fetchTokenAllowance, Token } from '@/lib/utils/token';
import { getUniswapV3Addresses } from '@/lib/contracts/uniswap-v3';
import { useChainId } from 'wagmi';
import { getAddress, Hash } from 'viem';

export function useTokenAllowanceV3(
  token: Token | null,
  owner: Hash | undefined
) {
  const chainId = useChainId();
  const [allowance, setAllowance] = useState<bigint | null>(null)
  
  const fetchAllowance = useCallback(async () => {
    if (!token || !owner) {
      setAllowance(null)
      return
    }
    
    try {
      const addresses = getUniswapV3Addresses(chainId)
      const allowanceValue = await fetchTokenAllowance(token, owner, getAddress(addresses.ROUTER), chainId)
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
