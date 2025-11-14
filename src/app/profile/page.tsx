'use client'

import { useAccount, useBalance, useEnsName } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, ExternalLink, Wallet } from 'lucide-react'
import { useState } from 'react'
import { formatEther } from 'viem'
import { useWalletInfo } from '@/hooks/useWalletInfo'

export default function ProfilePage() {
const { 
    address,
    isConnected,
    chain,
    balance,
    ensName,
    // explorerUrl,
  } = useWalletInfo()
  
  const [copied, setCopied] = useState(false)

  // If wallet not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription>
              Connect your wallet to view your profile and manage your assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the "Connect Wallet" button in the navigation to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your wallet and view your assets</p>
        </div>

        {/* Wallet Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
            <CardDescription>Your connected wallet details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ENS Name */}
            {ensName && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">ENS Name</p>
                <p className="text-lg font-mono">{ensName}</p>
              </div>
            )}

            {/* Address */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded">
                  {address}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="h-8 w-8"
                >
                  <a
                    href={`${chain?.blockExplorers?.default.url}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
              )}
            </div>

            {/* Network */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network</p>
              <p className="text-lg">{chain?.name || 'Unknown'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>Your native token balance</CardDescription>
          </CardHeader>
          <CardContent>
            {balance ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {Number(formatEther(balance.value)).toFixed(4)}
                  </span>
                  <span className="text-2xl text-muted-foreground">
                    {balance.symbol}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Native balance on {chain?.name}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading balance...</p>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future features */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Token Balances</CardTitle>
              <CardDescription>View your ERC20 tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription>Your transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}