import { cookieStorage, createStorage } from 'wagmi'
import { arbitrum, mainnet, sepolia } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { solana } from '@reown/appkit/networks'

// export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
export const projectId = '77b207c23c6638bd9b44e433c5609655'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, sepolia, arbitrum, solana]

// Create wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig