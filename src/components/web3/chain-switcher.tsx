'use client'

import { useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { SUPPORTED_CHAINS, CHAIN_INFO } from '@/lib/wagmi'

export function ChainSwitcher() {
  const { chain, isConnected } = useAccount()
  const { chains, switchChain, isPending } = useSwitchChain()
  const [switchingTo, setSwitchingTo] = useState<number | null>(null)

  const handleSwitch = async (chainId: number) => {
    setSwitchingTo(chainId)
    try {
      await switchChain({ chainId })
    } catch (error) {
      console.error('Failed to switch chain:', error)
    } finally {
      setSwitchingTo(null)
    }
  }

  if (!isConnected) {
    return (
      <Button variant="outline" disabled>
        <span className="text-muted-foreground">Not Connected</span>
      </Button>
    )
  }

  const currentChainInfo = chain ? CHAIN_INFO[chain.id as keyof typeof CHAIN_INFO] : null
  const isUnsupportedChain = chain && !CHAIN_INFO[chain.id as keyof typeof CHAIN_INFO]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Switching...</span>
            </>
          ) : isUnsupportedChain ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-500">Unsupported Network</span>
            </>
          ) : currentChainInfo ? (
            <>
              <span>{currentChainInfo.icon}</span>
              <span>{currentChainInfo.name}</span>
            </>
          ) : (
            <span>Select Network</span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {SUPPORTED_CHAINS.map((supportedChain) => {
          console.log('supported chain', supportedChain);
          const chainInfo = CHAIN_INFO[supportedChain.id as keyof typeof CHAIN_INFO]
          const isActive = chain?.id === supportedChain.id
          const isSwitching = switchingTo === supportedChain.id

          return (
            <DropdownMenuItem
              key={supportedChain.id}
              onClick={() => !isActive && handleSwitch(supportedChain.id)}
              disabled={isActive || isSwitching}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>{chainInfo.icon}</span>
                  <span>{chainInfo.name}</span>
                </div>
                {isSwitching && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {isActive && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}