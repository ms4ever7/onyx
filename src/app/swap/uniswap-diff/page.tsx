'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, TrendingUp, TrendingDown, Info, RefreshCw } from 'lucide-react'
import { useSwapQuote as useV2Quote } from '@/hooks/useUniswapV2'
import { useMultiFeeQuote as useV3Quote } from '@/hooks/useUniswapV3'
import { COMMON_TOKENS as V2_TOKENS, type Token as V2Token } from '@/lib/contracts/uniswap-v2'
import { formatUnits } from 'viem'
import Image from 'next/image'
import { ChainSwitcher } from '@/components/web3/chain-switcher'
import { useAccount } from 'wagmi'

const TRADING_PAIRS = [
  { tokenIn: 'WETH', tokenOut: 'USDC', label: 'ETH/USDC' },
  { tokenIn: 'WETH', tokenOut: 'USDT', label: 'ETH/USDT' },
  { tokenIn: 'WETH', tokenOut: 'DAI', label: 'ETH/DAI' },
  { tokenIn: 'WBTC', tokenOut: 'USDC', label: 'WBTC/USDC' },
  { tokenIn: 'UNI', tokenOut: 'USDC', label: 'UNI/USDC' },
  { tokenIn: 'LINK', tokenOut: 'USDC', label: 'LINK/USDC' },
]

function PairComparison({
  tokenIn,
  tokenOut,
  amount,
  label,
}: {
  tokenIn: V2Token
  tokenOut: V2Token
  amount: string
  label: string
}) {
  // V2 Quote
  const { data: v2Quote, isLoading: v2Loading } = useV2Quote(amount, tokenIn, tokenOut)

  // V3 Quote (best across all fees)
  const { bestQuote: v3Quote, bestFee, isLoading: v3Loading } = useV3Quote(
    amount,
    tokenIn,
    tokenOut
  )

  const v2Output = v2Quote && v2Quote[1] 
    ? parseFloat(formatUnits(v2Quote[1], tokenOut.decimals))
    : 0

  const v3Output = v3Quote && v3Quote[0]
    ? parseFloat(formatUnits(v3Quote[0], tokenOut.decimals))
    : 0

  const difference = v2Output && v3Output ? v3Output - v2Output : 0
  const percentDiff = v2Output ? (difference / v2Output) * 100 : 0
  const v3IsBetter = difference > 0

  const isLoading = v2Loading || v3Loading

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={tokenIn.logo} alt={tokenIn.symbol} width={20} height={20} className="rounded-full" />
            <span>{label}</span>
            <span className="text-muted-foreground text-sm">
              ({amount} {tokenIn.symbol})
            </span>
          </div>
          {v3IsBetter ? (
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
              V3 Better
            </span>
          ) : (
            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
              V2 Better
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Loading quotes...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${!v3IsBetter ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
                <div className="text-xs text-muted-foreground mb-1">Uniswap V2</div>
                <div className="font-mono text-lg font-bold">
                  {v2Output > 0 ? v2Output.toFixed(4) : '-'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Fee: 0.3%
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${v3IsBetter ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
                <div className="text-xs text-muted-foreground mb-1">Uniswap V3</div>
                <div className="font-mono text-lg font-bold">
                  {v3Output > 0 ? v3Output.toFixed(4) : '-'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Fee: {bestFee ? (bestFee / 10000).toFixed(2) : '0'}%
                </div>
              </div>
            </div>

            {v2Output > 0 && v3Output > 0 && (
              <div className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">Difference:</span>
                <div className="flex items-center gap-2">
                  {v3IsBetter ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-mono font-medium ${v3IsBetter ? 'text-green-500' : 'text-red-500'}`}>
                    {v3IsBetter ? '+' : ''}{Math.abs(difference).toFixed(4)} ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function UniswapDiffPage() {
  const { chain } = useAccount()
  const [amount, setAmount] = useState('1')
  const [customPair, setCustomPair] = useState(false)
  const [selectedTokenIn, setSelectedTokenIn] = useState<keyof typeof V2_TOKENS>('WETH')
  const [selectedTokenOut, setSelectedTokenOut] = useState<keyof typeof V2_TOKENS>('USDC')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Uniswap V2 vs V3 Comparison</h1>
            <p className="text-muted-foreground">
              Compare prices across protocols • {chain?.name || 'Ethereum'}
            </p>
          </div>
          <ChainSwitcher />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparison Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Amount to Compare
                </label>
                <Input
                  type="number"
                  placeholder="1.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setCustomPair(!customPair)}
              >
                {customPair ? 'Show Popular Pairs' : 'Custom Pair'}
              </Button>
            </div>

            {customPair && (
              <div className="flex gap-4 items-center p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <select
                    value={selectedTokenIn}
                    onChange={(e) => setSelectedTokenIn(e.target.value as keyof typeof V2_TOKENS)}
                    className="w-full p-2 rounded border bg-background"
                  >
                    {Object.keys(V2_TOKENS).map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground mt-5" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <select
                    value={selectedTokenOut}
                    onChange={(e) => setSelectedTokenOut(e.target.value as keyof typeof V2_TOKENS)}
                    className="w-full p-2 rounded border bg-background"
                  >
                    {Object.keys(V2_TOKENS).map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-500">
                Live comparison shows which protocol offers better rates. Green indicates the better deal.
              </p>
            </div>
          </CardContent>
        </Card>

        {customPair && (
          <PairComparison
            tokenIn={V2_TOKENS[selectedTokenIn]}
            tokenOut={V2_TOKENS[selectedTokenOut]}
            amount={amount}
            label={`${selectedTokenIn}/${selectedTokenOut}`}
          />
        )}

        {!customPair && (
          <div className="grid md:grid-cols-2 gap-4">
            {TRADING_PAIRS.map((pair) => {
              const tokenIn = V2_TOKENS[pair.tokenIn as keyof typeof V2_TOKENS]
              const tokenOut = V2_TOKENS[pair.tokenOut as keyof typeof V2_TOKENS]
              
              if (!tokenIn || !tokenOut) return null

              return (
                <PairComparison
                  key={pair.label}
                  tokenIn={tokenIn}
                  tokenOut={tokenOut}
                  amount={amount}
                  label={pair.label}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
