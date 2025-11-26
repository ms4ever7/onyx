import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '77b207c23c6638bd9b44e433c5609655'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
]

// Create wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: SUPPORTED_CHAINS,
})

export const config = wagmiAdapter.wagmiConfig

// Chain metadata for UI
export const CHAIN_INFO = {
  [mainnet.id]: {
    name: 'Ethereum',
    icon: '⟠',
    color: '#627EEA',
    explorers: mainnet.blockExplorers.default.url,
  },
  [polygon.id]: {
    name: 'Polygon',
    icon: '⬡',
    color: '#8247E5',
    explorers: polygon.blockExplorers.default.url,
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    icon: '◆',
    color: '#28A0F0',
    explorers: arbitrum.blockExplorers.default.url,
  },
  [optimism.id]: {
    name: 'Optimism',
    icon: '🔴',
    color: '#FF0420',
    explorers: optimism.blockExplorers.default.url,
  },
  [base.id]: {
    name: 'Base',
    icon: '🔵',
    color: '#0052FF',
    explorers: base.blockExplorers.default.url,
  }
} as const