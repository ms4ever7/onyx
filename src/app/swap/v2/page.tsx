'use client'

import { useState, useMemo, useEffect } from 'react'
import { ArrowDown, Settings, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { parseUnits } from 'viem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWalletInfo } from '@/hooks/uniswap/wagmi/useWalletInfo'
import { useSwapTokenV2 } from '@/hooks/uniswap/v2/useSwapTokenV2'
import { useTokenList } from '@/hooks/useTokenList'
import { useSwapQouteV2 } from '@/hooks/uniswap/v2/useSwapQouteV2'
import { useTokenAllowanceV2 } from '@/hooks/uniswap/v2/useTokenAllowanceV2'
import { useTokenBalance } from '@/hooks/uniswap/useTokenBalance'
import { Token } from '@/lib/utils/token'
import TokenSelector from '../token-selector'
import { useApproveTokenV2 } from '@/hooks/uniswap/v2/useApproveTokenV2'

export default function UniswapV2SwapPage() {
  const { address, isConnected } = useWalletInfo()
  const { tokens, popularTokens, isLoading } = useTokenList()
  
  const [tokenIn, setTokenIn] = useState<Token | null>(null)
  const [tokenOut, setTokenOut] = useState<Token | null>(null)
  const [amountIn, setAmountIn] = useState<string>('')
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)

  const { balance: balanceIn, refetchBalance: refetchBalanceIn } = useTokenBalance(tokenIn, address)
  const { balance: balanceOut } = useTokenBalance(tokenOut, address)
  const { data: quote, loading: quoteLoading } = useSwapQouteV2(amountIn, tokenIn, tokenOut)
  const { allowance, refetch: refetchAllowance } = useTokenAllowanceV2(tokenIn, address)

  const {
    approve: approveOldWay,
    isPending: isApproving,
    isConfirming: isApprovingConfirm,
    isConfirmed: approveSuccess
   } = useApproveTokenV2()
   const { swap, isPending: isSwapping, isConfirming: isSwappingConfirm, isSuccess: swapSuccess, hash } = useSwapTokenV2()

  const amountOut = useMemo(() => {
    if (!quote || !quote[1]) return '';

    return quote;
  }, [quote, tokenOut])

  
  const needsApproval = useMemo(() => {
    if (allowance == null || !amountIn || !tokenIn) return false;

    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    return allowance < amountInParsed
  }, [allowance, amountIn, tokenIn])

  useEffect(() => {
    if (popularTokens.length > 0 && !tokenIn) {
      setTokenIn(popularTokens[0])
      setTokenOut(popularTokens.find(t => t.symbol.toUpperCase() === 'USDC') || popularTokens[1])
    }
  }, [popularTokens, tokenIn])

  useEffect(() => {
    if (approveSuccess) {
      refetchAllowance()
    }
  }, [approveSuccess, refetchAllowance])

  useEffect(() => {
    if (swapSuccess) {
      refetchBalanceIn()
      setAmountIn('')
    }
  }, [swapSuccess, refetchBalanceIn])

  const handleApprove = () => {
    if (!amountIn || !address || !tokenIn) return
    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)

    approveOldWay(tokenIn, amountInParsed)
  }

  const handleSwap = () => {
    if (!address || !amountIn || !amountOut || !tokenIn || !tokenOut) return
    swap(amountIn, amountOut, tokenIn, tokenOut, address, slippage)
  }

  const handleFlipTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn('')
  }

  const formatBalance = (balance: string | null) => {
    if (!balance) return '0.0000';

    return Number(balance).toFixed(4)
  }

  const pricePerToken = useMemo(() => {
    if (!amountIn || !amountOut || parseFloat(amountIn) === 0) return '0'
    return (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)
  }, [amountIn, amountOut])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Swap</h1>
          <p className="text-muted-foreground">
            Trade tokens on Uniswap V2 (Ethereum)
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
                    {[0.1, 0.5, 1, 3].map((val) => (
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
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You pay</span>
                {isConnected && balanceIn !== undefined && (
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setAmountIn(balanceIn ?? '')}
                  >
                    Balance: {formatBalance(balanceIn)}
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
                  tokens={tokens}
                  popularTokens={popularTokens}
                  isLoading={isLoading}
                />
              </div>
            </div>

            <div className="flex justify-center -my-2 relative z-10">
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
                {isConnected && balanceOut !== undefined && (
                  <span className="text-muted-foreground">
                    Balance: {formatBalance(balanceOut)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={quoteLoading ? 'Loading...' : amountOut}
                  readOnly
                  className="text-2xl h-16 border-2 bg-muted"
                />
                 <TokenSelector
                    token={tokenOut}
                    onSelect={setTokenOut}
                    tokens={tokens}
                    popularTokens={popularTokens}
                    isLoading={isLoading}
                  />
              </div>
            </div>

            {amountIn && amountOut && !quoteLoading && tokenIn && tokenOut && (
              <div className="pt-4 space-y-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">
                    1 {tokenIn.symbol} = {pricePerToken} {tokenOut.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slippage Tolerance</span>
                  <span className="font-medium">{slippage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum received</span>
                  <span className="font-medium">
                    {(parseFloat(amountOut) * (1 - slippage / 100)).toFixed(6)} {tokenOut.symbol}
                  </span>
                </div>
              </div>
            )}

            {!isConnected ? (
              <Button size="lg" className="w-full mt-4" disabled>
                Connect Wallet
              </Button>
            ) : (needsApproval && tokenIn) ? (
              <Button
                size="lg"
                className="w-full mt-4"
                onClick={handleApprove}
                disabled={isApproving || isApprovingConfirm}
              >
                {isApproving || isApprovingConfirm ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving {tokenIn.symbol}...
                  </>
                ) : (
                  `Approve ${tokenIn.symbol}`
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full mt-4"
                onClick={handleSwap}
                disabled={!amountIn || !amountOut || isSwapping || isSwappingConfirm || quoteLoading}
              >
                {isSwapping || isSwappingConfirm ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  'Swap'
                )}
              </Button>
            )}

            {/* Success Message */}
            {swapSuccess && hash && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mt-4">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-500">Swap successful!</p>
                  <a
                    href={`https://etherscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-500 hover:underline"
                  >
                    View on Etherscan
                  </a>
                </div>
              </div>
            )}

            {/* Info Banner */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-4">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-500">
                <strong>Real Web3 Trading:</strong> This swaps real tokens on Ethereum using Uniswap V2. Make sure you're on Ethereum Mainnet and have ETH for gas fees.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
