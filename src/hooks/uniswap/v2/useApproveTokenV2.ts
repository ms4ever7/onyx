import { useEffect, useState } from 'react';
import { ERC20_ABI, getUniswapV2Addresses } from '@/lib/contracts/uniswap-v2';
import { Token, toRouteAddress } from '@/lib/utils/token';
import { getWalletClient } from '@/lib/viem/walletClient';
import type { Hash, WalletClient } from 'viem';
import { createPublicClientForChain } from '@/lib/viem/publicClient';

export function useApproveTokenV2() {
  const [wallet, setWallet] = useState<WalletClient | null>(null);
  const [hash, setHash] = useState<Hash | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    getWalletClient().then(setWallet);
    return () => {}
  }, []);

  const approve = async (token: Token, amount: bigint) => {
    if (!wallet) throw new Error("Wallet not loaded yet");

    const chainId = wallet.chain?.id
    if (!chainId) throw new Error("Chain ID not available");

    const addresses = getUniswapV2Addresses(chainId)

    setIsPending(true);
    setIsConfirming(false);
    setIsConfirmed(false);

    const txHash = await wallet.writeContract({
      chain: undefined,
      account: wallet.account!,
      address: toRouteAddress(token),
      abi: ERC20_ABI,
      functionName: "approve",
      args: [addresses.ROUTER, amount],
    });

    setHash(txHash);
    setIsPending(false);
    setIsConfirming(true);

    const publicClient = createPublicClientForChain(chainId)
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    setIsConfirming(false);
    setIsConfirmed(true);

    return receipt;
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  };
}