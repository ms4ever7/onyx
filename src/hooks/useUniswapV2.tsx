import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { UNISWAP_V2_ADDRESSES, UNISWAP_V2_ROUTER_ABI, ERC20_ABI, type Token } from '@/lib/contracts/uniswap-v2'
 
/**
 * Get estimated output amount for a swap
 */
export function useSwapQuote(
  amountIn: string,
  tokenIn: Token | null,
  tokenOut: Token | null
) {
  const path = tokenIn && tokenOut ? [tokenIn.address, tokenOut.address] : []
  
  const amountInParsed = amountIn && tokenIn
    ? parseUnits(amountIn, tokenIn.decimals)
    : 0n

  return useReadContract({
    address: UNISWAP_V2_ADDRESSES.ROUTER,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [amountInParsed, path],
    query: {
      enabled: !!tokenIn && !!tokenOut && !!amountIn && parseFloat(amountIn) > 0,
      refetchInterval: 10000, // Refresh every 10s
    },
  })
}

/**
 * Get token balance
 */
export function useTokenBalance(tokenAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!tokenAddress && !!userAddress,
    },
  })
}

/**
 * Get token allowance (how much user has approved for router)
 */
export function useTokenAllowance(
  tokenAddress: `0x${string}` | undefined,
  ownerAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress, UNISWAP_V2_ADDRESSES.ROUTER] : undefined,
    query: {
      enabled: !!tokenAddress && !!ownerAddress,
    },
  })
}

/**
 * Approve token spending
 */
export function useApproveToken() {
  const { data: hash, writeContract, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (tokenAddress: `0x${string}`, amount: bigint) => {
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [UNISWAP_V2_ADDRESSES.ROUTER, amount],
    })
  }

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    hash,
  }
}

/**
 * Execute a token swap
 */
export function useSwapTokens() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const swap = (
    amountIn: string,
    amountOutMin: string,
    tokenIn: Token,
    tokenOut: Token,
    userAddress: `0x${string}`,
    slippageTolerance: number = 0.5
  ) => {
    const path = [tokenIn.address, tokenOut.address]
    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    const amountOutMinParsed = parseUnits(amountOutMin, tokenOut.decimals)
    
    // Apply slippage tolerance
    const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
    const amountOutWithSlippage = (amountOutMinParsed * slippageMultiplier) / 10000n
    
    // Deadline: 20 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    writeContract({
      address: UNISWAP_V2_ADDRESSES.ROUTER,
      abi: UNISWAP_V2_ROUTER_ABI,
      functionName: 'swapExactTokensForTokens',
      args: [amountInParsed, amountOutWithSlippage, path, userAddress, deadline],
    })
  }

  return {
    swap,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
  }
}