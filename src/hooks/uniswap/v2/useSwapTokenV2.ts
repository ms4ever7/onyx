import { useState } from 'react';
import { getUniswapV2Addresses, UNISWAP_V2_ROUTER_ABI } from '@/lib/contracts/uniswap-v2';
import { parseUnits } from 'viem';
import { isNativeToken, Token, toRouteAddress } from '@/lib/utils/token';
import { getWalletClient } from '@/lib/viem/walletClient';
import { createPublicClientForChain } from '@/lib/viem/publicClient';
import type { Hash } from 'viem';

export function useSwapTokenV2() {
  const [hash, setHash] = useState<Hash | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const swap = async (
    amountIn: string,
    amountOutMin: string,
    tokenIn: Token,
    tokenOut: Token,
    userAddress: `0x${string}`,
    slippageTolerance: number = 0.5
  ) => {
    const wallet = await getWalletClient();
    if (!wallet) throw new Error("Wallet not available");

    const chainId = wallet.chain?.id
    if (!chainId) throw new Error("Chain ID not available");

    const addresses = getUniswapV2Addresses(chainId)

    setIsPending(true);
    setIsConfirming(false);
    setIsSuccess(false);

    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    const amountOutMinParsed = parseUnits(amountOutMin, tokenOut.decimals)
    
    const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100))
    const amountOutWithSlippage = (amountOutMinParsed * slippageMultiplier) / 10000n    
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    let txHash: `0x${string}`;

    // Case 1: Swapping native ETH for tokens
    if (isNativeToken(tokenIn) && !isNativeToken(tokenOut)) {
      const path = [tokenIn.wrappedAddress!, toRouteAddress(tokenOut)]
      
      txHash = await wallet.writeContract({
        account: wallet.account!,
        address: addresses.ROUTER,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactETHForTokens',
        args: [
          amountOutWithSlippage,
          path,
          userAddress,
          deadline
        ],
        value: amountInParsed,
      })
    } 

    // Case 2: Swapping tokens for native ETH
    else if (!isNativeToken(tokenIn) && isNativeToken(tokenOut)) {
      const path = [toRouteAddress(tokenIn), tokenOut.wrappedAddress!]
      
      txHash = await wallet.writeContract({
        account: wallet.account!,
        address: addresses.ROUTER,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactTokensForETH',
        args: [
          amountInParsed,
          amountOutWithSlippage,
          path,
          userAddress,
          deadline
        ]
      })
    }
    // Case 3: Swapping ERC20 tokens (including WETH)
    else {
      const path = [toRouteAddress(tokenIn), toRouteAddress(tokenOut)]
      
      txHash = await wallet.writeContract({
        account: wallet.account!,
        address: addresses.ROUTER,
        abi: UNISWAP_V2_ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          amountInParsed,
          amountOutWithSlippage,
          path,
          userAddress,
          deadline
        ]
      })
    }

    setHash(txHash);
    setIsPending(false);
    setIsConfirming(true);

    const publicClient = createPublicClientForChain(chainId);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    setIsConfirming(false);
    setIsSuccess(true);

    return receipt;
  }

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  }
}
