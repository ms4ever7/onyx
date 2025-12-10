'use client';

import { Chain, createWalletClient, custom, type EIP1193Provider } from 'viem';
import { arbitrum, avalanche, base, baseSepolia, mainnet, optimism, polygon, sepolia } from 'viem/chains';

export async function getWalletClient() {
  if (typeof window === 'undefined') return null;
  if (!window.ethereum) return null;

  // Correct type for viem
  const provider = window.ethereum as unknown as EIP1193Provider;

  const [account] = await provider.request({ method: 'eth_requestAccounts' });
  const chainId = await provider.request({ method: 'eth_chainId' });
  const chainIdNumber = parseInt(chainId, 16);
  
  const chains: Record<number, Chain> = {
    1: mainnet,
    11155111: sepolia,
    8453: base,
    84532: baseSepolia,
    137: polygon,
    42161: arbitrum,
    10: optimism,
    43114: avalanche
    // ... add other chains you support
  };
  
  const chain = chains[chainIdNumber];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainIdNumber}`);
  }
  
  return createWalletClient({
    account,
    chain,
    transport: custom(provider)
  });
}
