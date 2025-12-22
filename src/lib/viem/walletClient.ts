'use client';

import { Chain, createWalletClient, custom, type EIP1193Provider } from 'viem';
import { arbitrum, avalanche, base, baseSepolia, mainnet, optimism, polygon, sepolia } from 'viem/chains';

interface EthereumProvider extends EIP1193Provider {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
}

export async function getWalletClient(requestedChainId?: number) {
  if (typeof window === 'undefined') return null;

  const ethereum = window.ethereum as EthereumProvider | undefined;
  if (!ethereum) return null;

  let provider: EthereumProvider = ethereum;

  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    const metaMask = ethereum.providers.find((p) => p.isMetaMask);
    if (metaMask) {
      provider = metaMask;
    }
  }

  const [account] = await provider.request({ method: 'eth_requestAccounts' });
  const currentChainIdHex = await provider.request({ method: 'eth_chainId' }) as string;
  const currentChainId = parseInt(currentChainIdHex, 16);
  
  const targetChainId = requestedChainId || currentChainId;

  if (requestedChainId && currentChainId !== requestedChainId) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requestedChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      console.error("Chain switch failed or rejected", switchError);
      return null;
    }
  }

  const chains: Record<number, Chain> = {
    1: mainnet,
    11155111: sepolia,
    8453: base,
    84532: baseSepolia,
    137: polygon,
    42161: arbitrum,
    10: optimism,
    43114: avalanche
  };
  
  const chain = chains[targetChainId];
  if (!chain) {
    throw new Error(`Unsupported chain: ${targetChainId}`);
  }
  
  return createWalletClient({
    account,
    chain,
    transport: custom(provider)
  });
}