import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits } from 'viem'
import { UNISWAP_V2_ADDRESSES, UNISWAP_V2_ROUTER_ABI, ERC20_ABI, COMMON_TOKENS, getUniswapV2Addresses } from '@/lib/contracts/uniswap-v2'
import { Token, toRouteAddress } from '@/lib/utils/token'
 
/**
 * Get estimated output amount for a swap
 */
export function useSwapQuote(
  amountIn: string,
  tokenIn: Token | null,
  tokenOut: Token | null
) {
  const chainId = useChainId();
  const path =
    tokenIn && tokenOut
      ? [toRouteAddress(tokenIn), toRouteAddress(tokenOut)]
      : []
  const amountInParsed =
    amountIn && tokenIn
      ? parseUnits(amountIn, tokenIn.decimals)
      : 0n
  const addresses = getUniswapV2Addresses(chainId)

  return useReadContract({
    address: addresses.ROUTER,
    abi: UNISWAP_V2_ROUTER_ABI,
    functionName: "getAmountsOut",
    args: [amountInParsed, path],
    query: {
      enabled:
        !!tokenIn &&
        !!tokenOut &&
        !!amountIn &&
        parseFloat(amountIn) > 0,
      refetchInterval: 10000,
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
  const chainId = useChainId();
  const addresses = getUniswapV2Addresses(chainId)

  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress, addresses.ROUTER] : undefined,
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
  const chainId = useChainId();
  const addresses = getUniswapV2Addresses(chainId)

  const approve = (token: Token, amount: bigint) => {
    writeContract({
      address: toRouteAddress(token),
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [addresses.ROUTER, amount],
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
  const chainId = useChainId();
  const addresses = getUniswapV2Addresses(chainId)


  const swap = (
    amountIn: string,
    amountOutMin: string,
    tokenIn: Token,
    tokenOut: Token,
    userAddress: `0x${string}`,
    slippageTolerance: number = 0.5
  ) => {
    const path =
    tokenIn && tokenOut
      ? [toRouteAddress(tokenIn), toRouteAddress(tokenOut)]
      : []
    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    const amountOutMinParsed = parseUnits(amountOutMin, tokenOut.decimals)
    
    // Apply slippage tolerance
    const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
    const amountOutWithSlippage = (amountOutMinParsed * slippageMultiplier) / 10000n
    
    // Deadline: 20 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    writeContract({
      address: addresses.ROUTER,
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
