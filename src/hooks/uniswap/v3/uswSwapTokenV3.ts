import { useState } from 'react';
import { UNISWAP_V3_ADDRESSES, UNISWAP_V3_ROUTER_ABI } from '@/lib/contracts/uniswap-v3';
import { getAddress, parseUnits } from 'viem';
import { isNativeToken, Token, toRouteAddress } from '@/lib/utils/token';
import { getWalletClient } from '@/lib/viem/walletClient';
import { createPublicClientForChain } from '@/lib/viem/publicClient';
import type { Hash } from 'viem';
import { useChainId } from 'wagmi';

export function useSwapTokenV3() {
  const [hash, setHash] = useState<Hash | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const chainId = useChainId();

  const swap = async (
    amountIn: string,
    amountOutExpected: string,
    tokenIn: Token,
    tokenOut: Token,
    userAddress: Hash,
    slippageTolerance: number = 0.5,
    fee: number = 500 // 500, 3000, 10000
  ) => {
    const wallet = await getWalletClient(chainId);
    if (!wallet || !wallet.account) throw new Error("Wallet not available");

    const addresses = UNISWAP_V3_ADDRESSES[chainId];
    if (!addresses) throw new Error("V3 Addresses not found for this chain");

    const publicClient = createPublicClientForChain(chainId);

    setIsPending(true);
    setIsConfirming(false);
    setIsSuccess(false);

    try {
      const amountInParsed = parseUnits(amountIn, tokenIn.decimals);
      const amountOutExpectedParsed = parseUnits(amountOutExpected, tokenOut.decimals);
      
      // Calculate minimum output based on slippage
      // formula: amountOut * (100 - slippage) / 100
      const slippageMultiplier = BigInt(Math.floor((100 - slippageTolerance) * 100));
      const amountOutMinimum = (amountOutExpectedParsed * slippageMultiplier) / 10000n;
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);

      // Uniswap V3 exactInputSingle parameters
      // Note: For native ETH, we use WETH address in 'tokenIn' but send 'value'
      const params = {
        tokenIn: toRouteAddress(tokenIn),
        tokenOut: toRouteAddress(tokenOut),
        fee: fee,
        recipient: userAddress,
        deadline: deadline,
        amountIn: amountInParsed,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0n, // 0 means no limit
      };

      let txHash: Hash;

      const estimatedGas = await publicClient.estimateContractGas({
        account: wallet.account,
        address: getAddress(addresses.ROUTER),
        abi: UNISWAP_V3_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [params],
        value: amountInParsed,
      });

      const gasLimit = (estimatedGas * 110n) / 100n;
      
      if (isNativeToken(tokenIn)) {
        // Case 1: ETH -> Token
        txHash = await wallet.writeContract({
          account: wallet.account,
          address: getAddress(addresses.ROUTER),
          abi: UNISWAP_V3_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [params],
          value: amountInParsed,
          gas: gasLimit,
        });
      } else {
        // Case 2 & 3: Token -> ETH or Token -> Token
        txHash = await wallet.writeContract({
          account: wallet.account,
          address: getAddress(addresses.ROUTER),
          abi: UNISWAP_V3_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [params],
          gas: gasLimit,
        });
      }

      setHash(txHash);
      setIsPending(false);
      setIsConfirming(true);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
        retryCount: 10,
        retryDelay: 2000
      });

      setIsConfirming(false);
      setIsSuccess(true);
      return receipt;
    } catch (error) {
      setIsPending(false);
      setIsConfirming(false);
      console.error("Swap error:", error);
      throw error;
    }
  };

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
  };
}