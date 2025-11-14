'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'

export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  return (
    <button onClick={() => open()} className='py-2 px-4'>
      {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
    </button>
  )
}