'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDown, Settings, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useWalletInfo } from '@/hooks/useWalletInfo'
import { useMultiFeeQuote, useTokenBalance, useTokenAllowance, useApproveToken, useSwapTokens } from '@/hooks/useUniswapV3'
import { COMMON_TOKENS, type Token } from '@/lib/contracts/uniswap-v3'
import { formatUnits, parseUnits } from 'viem'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { ChainSwitcher } from '@/components/web3/chain-switcher'

export default function UniswapV3SwapPage() {
  const { address, isConnected } = useWalletInfo()
  
  const [tokenIn, setTokenIn] = useState<Token>(COMMON_TOKENS.USDC)
  const [tokenOut, setTokenOut] = useState<Token>(COMMON_TOKENS.UNI)
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [showSettings, setShowSettings] = useState(false)
  const { chain } = useAccount()

  const { data: balanceIn, refetch: refetchBalanceIn } = useTokenBalance(tokenIn.address, address)
  const { data: balanceOut } = useTokenBalance(tokenOut.address, address)

  // Get best quote across all fee tiers
  const { bestFee, bestQuote, allQuotes, isLoading: quoteLoading } = useMultiFeeQuote(
    amountIn, 
    tokenIn, 
    tokenOut
  )

  const amountOut = useMemo(() => {
    if (!bestQuote || !bestQuote[0]) return ''
    return formatUnits(bestQuote[0], tokenOut.decimals)
  }, [bestQuote, tokenOut])

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(tokenIn.address, address)
  
  const needsApproval = useMemo(() => {
    if (allowance == null || !amountIn) return false
    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    return allowance < amountInParsed
  }, [allowance, amountIn, tokenIn])

  const { approve, isPending: isApproving, isConfirming: isApprovingConfirm, isSuccess: approveSuccess } = useApproveToken()
  const { swap, isPending: isSwapping, isConfirming: isSwappingConfirm, isSuccess: swapSuccess, hash } = useSwapTokens()

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
    if (!amountIn || !address) return
    const maxAmount = parseUnits('1000000', tokenIn.decimals)
    approve(tokenIn.address, maxAmount)
  }

  const handleSwap = () => {
    if (!address || !amountIn || !amountOut || !bestFee) return
    swap(amountIn, amountOut, tokenIn, tokenOut, parseFloat(slippage), bestFee, address)
  }

  const handleFlipTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn('')
  }

  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return '0.0000'
    return parseFloat(formatUnits(balance, decimals)).toFixed(4)
  }

  const pricePerToken = useMemo(() => {
    if (!amountIn || !amountOut || parseFloat(amountIn) === 0) return '0'
    return (parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)
  }, [amountIn, amountOut])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Swap V3</h1>
          <ChainSwitcher />
          <p className="text-muted-foreground">
            Trade tokens on Uniswap V3 • {chain?.name || 'Ethereum'}
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
                  </div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            {/* Token Input */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You pay</span>
                {isConnected && balanceIn !== undefined && (
                  <button
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setAmountIn(formatUnits(balanceIn, tokenIn.decimals))}
                  >
                    Balance: {formatBalance(balanceIn, tokenIn.decimals)}
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
                <TokenDisplay token={tokenIn} />
              </div>
            </div>

            {/* Flip Button */}
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

            {/* Token Output */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You receive</span>
                {isConnected && balanceOut !== undefined && (
                  <span className="text-muted-foreground">
                    Balance: {formatBalance(balanceOut, tokenOut.decimals)}
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
                <TokenDisplay token={tokenOut} />
              </div>
            </div>

            {/* Fee Tier Info */}
            {bestFee && amountOut && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Best rate from {(bestFee / 10000).toFixed(2)}% fee tier
                </span>
              </div>
            )}

            {/* All Available Quotes */}
            {amountIn && allQuotes.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View all fee tiers
                </summary>
                <div className="mt-2 space-y-1 pl-4">
                  {allQuotes.map((q) => (
                    <div key={q.fee} className="flex justify-between">
                      <span className={q.data ? 'text-foreground' : 'text-muted-foreground line-through'}>
                        {(q.fee / 10000).toFixed(2)}% fee:
                      </span>
                      <span className={q.data ? 'font-medium' : 'text-muted-foreground'}>
                        {q.data && q.data[0] 
                          ? `${formatUnits(q.data[0], tokenOut.decimals)} ${tokenOut.symbol}`
                          : 'Pool not available'}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Swap Details */}
            {amountIn && amountOut && !quoteLoading && (
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
                    {(parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {tokenOut.symbol}
                  </span>
                </div>
                {bestQuote && bestQuote[3] && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Gas</span>
                    <span className="font-medium">
                      ~{Number(bestQuote[3]).toLocaleString()} units
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!isConnected ? (
              <Button size="lg" className="w-full mt-4" disabled>
                Connect Wallet
              </Button>
            ) : needsApproval ? (
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TokenDisplay({ token }: { token: Token }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg bg-muted min-w-[120px]">
      <Image
        src={token.logo}
        alt={token.symbol}
        width={24}
        height={24}
        className="rounded-full"
      />
      <span className="font-semibold">{token.symbol}</span>
    </div>
  )
}