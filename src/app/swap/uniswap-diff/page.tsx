'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { useSwapQuote as useV2Quote } from '@/hooks/uniswap/wagmi/useUniswapV2Wagmi'
import { useMultiFeeQuote as useV3Quote } from '@/hooks/uniswap/wagmi/useUniswapV3Wagmi'
import { formatUnits } from 'viem'
import Image from 'next/image'
import { ChainSwitcher } from '@/components/web3/chain-switcher'
import { useAccount } from 'wagmi'
import { Token } from '@/lib/utils/token'
import { useTokenList } from '@/hooks/useTokenList'
import TokenSelector from '../token-selector'
import { Loader2 } from 'lucide-react'
import { resolveLogo } from '@/lib/api/token-list'


/**
 * Helper to define a few popular pairs based on token symbols.
 * These will be resolved into full Token objects using the fetched token list.
 */
const POPULAR_PAIR_SYMBOLS = [
  { tokenInSymbol: 'WETH', tokenOutSymbol: 'USDC', label: 'ETH/USDC' },
  { tokenInSymbol: 'WETH', tokenOutSymbol: 'USDT', label: 'ETH/USDT' },
  { tokenInSymbol: 'WBTC', tokenOutSymbol: 'USDC', label: 'WBTC/USDC' },
  { tokenInSymbol: 'UNI', tokenOutSymbol: 'WETH', label: 'UNI/WETH' },
  { tokenInSymbol: 'LINK', tokenOutSymbol: 'USDC', label: 'LINK/USDC' },
]

function PairComparison({
  tokenIn,
  tokenOut,
  amount,
  label,
}: {
  tokenIn: Token
  tokenOut: Token
  amount: string
  label: string
}) {
  const tokenInAmount = amount || '0';  
  // V2 Quote
  const { data: v2Quote, isLoading: v2Loading } = useV2Quote(tokenInAmount, tokenIn, tokenOut);

  // V3 Quote (best across all fees)
  const { bestQuote: v3Quote, bestFee, isLoading: v3Loading } = useV3Quote(
    tokenInAmount,
    tokenIn,
    tokenOut
  );

  const v2Output = v2Quote && v2Quote[1] 
    ? parseFloat(formatUnits(v2Quote[1], tokenOut.decimals))
    : 0;

  const v3Output = v3Quote && v3Quote[0]
    ? parseFloat(formatUnits(v3Quote[0], tokenOut.decimals))
    : 0;

  // Calculation logic remains the same
  const difference = v2Output && v3Output ? v3Output - v2Output : 0;
  const percentDiff = v2Output ? (difference / v2Output) * 100 : 0;
  const v3IsBetter = difference > 0;

  const isLoading = v2Loading || v3Loading;

  const getImageEl = (src: string, token: Token) => {
      const isIpfs = src.includes("ipfs");
  
      return isIpfs ? (
        <img
          src={resolveLogo(src)}
          alt={token.symbol}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <Image
          src={src}
          alt={token.symbol}
          width={32}
          height={32}
          className="rounded-full"
        />
      );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tokenIn.logo && getImageEl(tokenIn.logo, tokenIn)}
            <span>{label}</span>
            <span className="text-muted-foreground text-sm">
              ({amount} {tokenIn.symbol})
            </span>
          </div>
          {/* Show comparison result */}
          {v2Output > 0 && v3Output > 0 && (
            v3IsBetter ? (
              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                V3 Better
              </span>
            ) : (
              <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                V2 Better
              </span>
            )
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading quotes...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${!v3IsBetter && v2Output > 0 ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
                <div className="text-xs text-muted-foreground mb-1">Uniswap V2</div>
                <div className="font-mono text-lg font-bold">
                  {v2Output > 0 ? v2Output.toFixed(4) : '-'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Fee: 0.3%
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${v3IsBetter && v3Output > 0 ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
                <div className="text-xs text-muted-foreground mb-1">Uniswap V3</div>
                <div className="font-mono text-lg font-bold">
                  {v3Output > 0 ? v3Output.toFixed(4) : '-'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Fee: {bestFee !== undefined ? (bestFee / 10000).toFixed(2) : '-'}%
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
            {(v2Output === 0 && !v2Loading) && (v3Output === 0 && !v3Loading) && (
                 <div className="text-center py-2 text-sm text-yellow-500">
                    No active pool found for this pair.
                 </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Main Component
export default function UniswapDiffPage() {
  const { chain } = useAccount()
  // Use the hook to fetch tokens
  const { tokens, popularTokens, isLoading: isTokenListLoading } = useTokenList()

  const [amount, setAmount] = useState('1')
  const [customPair, setCustomPair] = useState(false)
  
  // Use Token | null state
  const [selectedTokenIn, setSelectedTokenIn] = useState<Token | null>(null)
  const [selectedTokenOut, setSelectedTokenOut] = useState<Token | null>(null)
  
  // Initialize with popular tokens when the list is ready
  useMemo(() => {
    if (popularTokens.length > 0) {
        if (!selectedTokenIn) {
            setSelectedTokenIn(popularTokens.find(t => t.symbol.toUpperCase() === 'WETH') || popularTokens[0]);
        }
        if (!selectedTokenOut) {
            setSelectedTokenOut(popularTokens.find(t => t.symbol.toUpperCase() === 'USDC') || popularTokens[1]);
        }
    }
  }, [popularTokens, selectedTokenIn, selectedTokenOut])


  // Resolve popular pairs into Token objects
  const resolvedPopularPairs = useMemo(() => {
    if (isTokenListLoading || tokens.length === 0) return []
    
    // Create a map for quick lookup
    const tokenMap = new Map(tokens.map(token => [token.symbol.toUpperCase(), token]))

    return POPULAR_PAIR_SYMBOLS.map(pair => {
      const tokenIn = tokenMap.get(pair.tokenInSymbol.toUpperCase())
      const tokenOut = tokenMap.get(pair.tokenOutSymbol.toUpperCase())
      
      if (tokenIn && tokenOut) {
        return {
          tokenIn,
          tokenOut,
          label: pair.label,
        }
      }
      return null
    }).filter((pair): pair is { tokenIn: Token, tokenOut: Token, label: string } => pair !== null)
  }, [tokens, isTokenListLoading])

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
                  <TokenSelector
                    token={selectedTokenIn}
                    onSelect={setSelectedTokenIn}
                    tokens={tokens}
                    popularTokens={popularTokens}
                    isLoading={isTokenListLoading}
                  />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground mt-5" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <TokenSelector
                    token={selectedTokenOut}
                    onSelect={setSelectedTokenOut}
                    tokens={tokens}
                    popularTokens={popularTokens}
                    isLoading={isTokenListLoading}
                  />
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

        {isTokenListLoading ? (
            <div className="text-center py-8 text-xl text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading token list...
            </div>
        ) : customPair ? (
          // Custom Pair
          selectedTokenIn && selectedTokenOut ? (
            <PairComparison
              tokenIn={selectedTokenIn}
              tokenOut={selectedTokenOut}
              amount={amount}
              label={`${selectedTokenIn.symbol}/${selectedTokenOut.symbol}`}
            />
          ) : (
            <div className="text-center py-8 text-lg text-muted-foreground">
              Select tokens for custom comparison.
            </div>
          )
        ) : (
          // Popular Pairs
          <div className="grid md:grid-cols-2 gap-4">
            {resolvedPopularPairs.length > 0 ? (
                resolvedPopularPairs.map((pair) => (
                  <PairComparison
                    key={pair.label}
                    tokenIn={pair.tokenIn}
                    tokenOut={pair.tokenOut}
                    amount={amount}
                    label={pair.label}
                  />
                ))
            ) : (
                <div className="md:col-span-2 text-center py-8 text-lg text-muted-foreground">
                    No popular pairs available for this chain.
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
