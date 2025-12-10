import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { parseUnits } from 'viem'
import { ERC20_ABI, UNISWAP_V3_ROUTER_ABI, UNISWAP_V3_QUOTER_V2_ABI, getUniswapV3Addresses } from '@/lib/contracts/uniswap-v3'
import { useMemo } from 'react'
import { Token, toRouteAddress } from '@/lib/utils/token'

export function useMultiFeeQuote(
  amountIn: string,
  tokenIn: Token | null,
  tokenOut: Token | null
) {
  // Try all fee tiers
  const quote100 = useSwapQuote(amountIn, tokenIn, tokenOut, 100)
  const quote500 = useSwapQuote(amountIn, tokenIn, tokenOut, 500)
  const quote3000 = useSwapQuote(amountIn, tokenIn, tokenOut, 3000)
  const quote10000 = useSwapQuote(amountIn, tokenIn, tokenOut, 10000)

  // Find the best valid quote (highest output)
  return useMemo(() => {
    const quotes = [
      { fee: 100, data: quote100.data, isLoading: quote100.isLoading, error: quote100.error },
      { fee: 500, data: quote500.data, isLoading: quote500.isLoading, error: quote500.error },
      { fee: 3000, data: quote3000.data, isLoading: quote3000.isLoading, error: quote3000.error },
      { fee: 10000, data: quote10000.data, isLoading: quote10000.isLoading, error: quote10000.error },
    ]

    // Filter valid quotes
    const validQuotes = quotes.filter(q => q.data && q.data[0])

    if (validQuotes.length === 0) {
      return { 
        bestFee: 3000, 
        bestQuote: null, 
        isLoading: quote3000.isLoading,
        allQuotes: quotes 
      }
    }

    // Find quote with highest output
    const best = validQuotes.reduce((prev, curr) => {
      return (curr.data![0] > prev.data![0]) ? curr : prev
    })

    return {
      bestFee: best.fee,
      bestQuote: best.data,
      isLoading: false,
      allQuotes: quotes
    }
  }, [quote100, quote500, quote3000, quote10000])
}
 
/**
 * Get swap quote for a single fee tier
 */
export function useSwapQuote(
  amountIn: string,
  tokenIn: Token | null,
  tokenOut: Token | null,
  fee: number
) {
  const amountInParsed =
    amountIn && tokenIn ? parseUnits(amountIn, tokenIn.decimals) : 0n
  const chainId = useChainId();
  const addresses = getUniswapV3Addresses(chainId)

    

  return useReadContract({
    address: addresses.QUOTER_V2!,
    abi: UNISWAP_V3_QUOTER_V2_ABI,
    functionName: 'quoteExactInputSingle',
    args: tokenIn && tokenOut ? [{
      tokenIn: toRouteAddress(tokenIn),
      tokenOut: toRouteAddress(tokenOut),
      amountIn: amountInParsed,
      fee: fee,
      sqrtPriceLimitX96: 0n
    }] : undefined,
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
export function useTokenBalance(token: Token | null, userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: toRouteAddress(token!),
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!token && !!userAddress,
    },
  })
}

/**
 * Get token allowance (how much user has approved for router)
 */
export function useTokenAllowance(
  tokenAddress: Token | null,
  ownerAddress: `0x${string}` | undefined
) {
  const chainId = useChainId();
  const addresses = getUniswapV3Addresses(chainId)

  const enabled = Boolean(tokenAddress && ownerAddress);
  
  return useReadContract({
    address: tokenAddress ? toRouteAddress(tokenAddress) : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: enabled ? [ownerAddress!, addresses.ROUTER] : undefined,
    query: {
      enabled,
    },
  });
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
  const addresses = getUniswapV3Addresses(chainId)

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
  const addresses = getUniswapV3Addresses(chainId)

  const swap = (
    amountIn: string,
    amountOutMin: string,
    tokenIn: Token,
    tokenOut: Token,
    slippageTolerance: number,
    fee: number, // Fee tier from quote
    userAddress: `0x${string}`
  ) => {

    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    const amountOutMinParsed = parseUnits(amountOutMin, tokenOut.decimals)
    
    // Apply slippage tolerance
    const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
    const amountOutWithSlippage = (amountOutMinParsed * slippageMultiplier) / 10000n
    
    // Deadline: 20 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    writeContract({
      address: addresses.ROUTER,
      abi: UNISWAP_V3_ROUTER_ABI,
      functionName: 'exactInputSingle',
      args: [{
        tokenIn: toRouteAddress(tokenIn),
        tokenOut: toRouteAddress(tokenOut),
        fee: fee, // Use the fee tier from the best quote
        recipient: userAddress,
        deadline: deadline,
        amountIn: amountInParsed,
        amountOutMinimum: amountOutWithSlippage,
        sqrtPriceLimitX96: 0n // No price limit
      }],
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