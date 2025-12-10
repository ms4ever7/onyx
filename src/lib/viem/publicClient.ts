import { createPublicClient, http, Chain } from 'viem';
import { arbitrum, avalanche, base, baseSepolia, mainnet, optimism, polygon, sepolia } from 'viem/chains';

const supportedChains: Chain[] = [arbitrum, avalanche, base, baseSepolia, mainnet, optimism, polygon, sepolia];

function getViemChain(chainId: number): Chain {
  const chain = supportedChains.find((c) => c.id === chainId);
  if (!chain) {
    // You might want to handle this more gracefully
    throw new Error(`Chain with ID ${chainId} is not supported.`);
  }
  return chain;
}

export function createPublicClientForChain(chainId: number) {
  const chain = getViemChain(chainId);
  
  return createPublicClient({
    chain: chain,
    transport: http(),
  });
}