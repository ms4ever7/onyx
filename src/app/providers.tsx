'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { WagmiProvider } from 'wagmi';
import { wagmiAdapter, projectId } from '@/lib/wagmi';

const queryClient = new QueryClient();

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  defaultNetwork: mainnet,
  features: {
    analytics: true
  },
  networks: [mainnet, arbitrum, sepolia],
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}