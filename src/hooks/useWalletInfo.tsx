import { useAccount, useBalance, useEnsName, useEnsAvatar, useTransaction } from 'wagmi'
import { formatEther } from 'viem'

/**
 * Custom hook to fetch all wallet information in one place
 * Makes it easier to reuse across components
 */
export function useWalletInfo() {
  const { address, isConnected, chain, connector } = useAccount()
  
  const { data: balance, isLoading: balanceLoading } = useBalance({ 
    address,
  })
  
  const { data: ensName } = useEnsName({ 
    address,
    chainId: 1, // ENS is on mainnet
  })
  
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1,
  })

  // Format balance for display
  const formattedBalance = balance 
    ? Number(formatEther(balance.value)).toFixed(4)
    : '0.0000'

  // Shorten address for display
  const shortAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return {
    // Raw data
    address,
    balance,
    ensName,
    ensAvatar,
    chain,
    connector,
    
    // Computed/formatted data
    formattedBalance,
    shortAddress,
    
    // Status
    isConnected,
    balanceLoading,
    
    // Utility
    explorerUrl: chain?.blockExplorers?.default.url,
    nativeSymbol: balance?.symbol || chain?.nativeCurrency.symbol,
  }
}