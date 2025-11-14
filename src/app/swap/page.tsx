'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchCoinListFromCoinGecko } from '@/lib/api/coingecko'
import { ArrowDown, Settings, ChevronDown, Loader2, Info } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWalletInfo } from '@/hooks/useWalletInfo'

interface Token {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
}

export default function SwapPage() {
  const { isConnected, formattedBalance } = useWalletInfo()

  const [tokenIn, setTokenIn] = useState<Token | null>(null)
  const [tokenOut, setTokenOut] = useState<Token | null>(null)
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [showSettings, setShowSettings] = useState(false)

  const { data: coinList, isLoading } = useQuery({
    queryKey: ['coin-list'],
    queryFn: fetchCoinListFromCoinGecko,
    refetchInterval: 60000,
  })

  // Set default tokens when data loads
  useMemo(() => {
    if (coinList && !tokenIn && !tokenOut) {
      const eth = coinList.find(c => c.symbol === 'eth')
      const usdc = coinList.find(c => c.symbol === 'usdc')
      if (eth) setTokenIn(eth)
      if (usdc) setTokenOut(usdc)
    }
  }, [coinList, tokenIn, tokenOut])

  // Calculate output amount (simple price conversion)
  const amountOut = useMemo(() => {
    if (!amountIn || !tokenIn || !tokenOut) return ''
    const input = parseFloat(amountIn)
    if (isNaN(input)) return ''
    
    const valueInUSD = input * tokenIn.current_price
    const output = valueInUSD / tokenOut.current_price
    
    // Apply slippage
    const slippageAmount = output * (parseFloat(slippage) / 100)
    return (output - slippageAmount).toFixed(6)
  }, [amountIn, tokenIn, tokenOut, slippage])

  // Price impact calculation (mock)
  const priceImpact = useMemo(() => {
    if (!amountIn || !tokenIn) return '0.00'
    const impact = parseFloat(amountIn) * 0.001 // Simple mock calculation
    return impact.toFixed(2)
  }, [amountIn, tokenIn])

  const handleSwap = () => {
    if (!isConnected) {
      alert('Please connect your wallet')
      return
    }
    alert(`Swap ${amountIn} ${tokenIn?.symbol.toUpperCase()} for ${amountOut} ${tokenOut?.symbol.toUpperCase()}`)
  }

  const handleFlipTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Swap</h1>
          <p className="text-muted-foreground">
            Trade tokens in an instant
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Swap</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            {showSettings && (
              <div className="pt-4 space-y-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Slippage tolerance</span>
                  <div className="flex gap-2">
                    {['0.1', '0.5', '1.0'].map((val) => (
                      <Button
                        key={val}
                        variant={slippage === val ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSlippage(val)}
                        className="h-7 text-xs"
                      >
                        {val}%
                      </Button>
                    ))}
                    <Input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="h-7 w-16 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You pay</span>
                {isConnected && tokenIn && (
                  <button 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      // Mock: In real app, fetch actual token balance
                      // For now, show native balance for ETH, or mock for others
                      if (tokenIn.symbol.toLowerCase() === 'eth') {
                        setAmountIn(formattedBalance)
                      }
                    }}
                  >
                    Balance: {tokenIn.symbol.toLowerCase() === 'eth' ? formattedBalance : '0.0000'}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  className="text-2xl h-16 border-2"
                />
                <TokenSelector
                  token={tokenIn}
                  onSelect={setTokenIn}
                  tokens={coinList || []}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-center relative z-10 m-0">
              <Button
                variant="outline"
                size="icon"
                onClick={handleFlipTokens}
                className="rounded-full border-4 border-background"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You receive</span>
                {isConnected && tokenOut && (
                  <span className="text-muted-foreground">
                    Balance: {tokenOut.symbol.toLowerCase() === 'eth' ? formattedBalance : '0.0000'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountOut}
                  readOnly
                  className="text-2xl h-16 border-2 bg-muted"
                />
                <TokenSelector
                  token={tokenOut}
                  onSelect={setTokenOut}
                  tokens={coinList || []}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Swap Details */}
            {amountIn && tokenIn && tokenOut && (
              <div className="pt-4 space-y-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    1 {tokenIn.symbol.toUpperCase()} = {(tokenOut.current_price / tokenIn.current_price).toFixed(6)} {tokenOut.symbol.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price Impact</span>
                  <span className={`font-medium ${parseFloat(priceImpact) > 1 ? 'text-red-500' : 'text-green-500'}`}>
                    ~{priceImpact}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum received</span>
                  <span className="font-medium">
                    {(parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {tokenOut.symbol.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <Button
              size="lg"
              className="w-full mt-4"
              disabled={!isConnected || !amountIn || !tokenIn || !tokenOut}
              onClick={handleSwap}
            >
              {!isConnected ? 'Connect Wallet' : 'Swap'}
            </Button>

            {/* Info Banner */}
            {isConnected && amountIn && (
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-500">
                  This is a demo swap interface. No real transactions will be executed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Token Selector Component
function TokenSelector({
  token,
  onSelect,
  tokens,
  isLoading,
}: {
  token: Token | null
  onSelect: (token: Token) => void
  tokens: Token[]
  isLoading: boolean
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filteredTokens = useMemo(() => {
    if (!search) return tokens.slice(0, 20)
    const query = search.toLowerCase()
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.symbol.toLowerCase().includes(query)
    )
  }, [tokens, search])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-16 px-4 min-w-[140px]">
          {token ? (
            <div className="flex items-center gap-2">
              <Image
                src={token.image}
                alt={token.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="font-semibold">{token.symbol.toUpperCase()}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Select token</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
          <DialogDescription>
            Search by name or symbol
          </DialogDescription>
        </DialogHeader>
        
        <Input
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-1">
            {filteredTokens.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelect(t)
                  setOpen(false)
                  setSearch('')
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="text-left">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.symbol.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${t.current_price.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}