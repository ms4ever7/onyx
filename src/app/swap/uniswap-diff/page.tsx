'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowDown, Settings, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useWalletInfo } from '@/hooks/useWalletInfo'
import { useSwapQuote, useTokenBalance, useTokenAllowance } from '@/hooks/useUniswapV2'
import { COMMON_TOKENS, type Token } from '@/lib/contracts/uniswap-v2'
import { formatUnits, parseUnits } from 'viem'
import Image from 'next/image'

export default function UniswapDiff() {
  const { address, isConnected } = useWalletInfo()
  
  const [tokenIn, setTokenIn] = useState<Token>(COMMON_TOKENS.UNI)
  const [tokenOut, setTokenOut] = useState<Token>(COMMON_TOKENS.USDC)
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)

  const { data: balanceIn, refetch: refetchBalanceIn } = useTokenBalance(tokenIn.address, address)
  const { data: balanceOut } = useTokenBalance(tokenOut.address, address)

  const { data: quote2, isLoading: quoteLoading2 } = useSwapQuote(amountIn, tokenIn, tokenOut)
  const { data: quote3, isLoading: quoteLoading3 } = useSwapQuote(amountIn, tokenIn, tokenOut)

  const amountOut2 = useMemo(() => {
    if (!quote2 || !quote2[1]) return ''
    return formatUnits(quote2[1], tokenOut.decimals)
  }, [quote2, tokenOut])

  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(tokenIn.address, address)
  
  const needsApproval = useMemo(() => {
    if (allowance == null || !amountIn) return false;

    const amountInParsed = parseUnits(amountIn, tokenIn.decimals)
    return allowance < amountInParsed
  }, [allowance, amountIn, tokenIn])

  // Format balance
  const formatBalance = (balance: bigint | undefined, decimals: number) => {
    if (!balance) return '0.0000'
    return parseFloat(formatUnits(balance, decimals)).toFixed(4)
  }

  // Price per token
  const pricePerToken2 = useMemo(() => {
    if (!amountIn || !amountOut2 || parseFloat(amountIn) === 0) return '0'
    return (parseFloat(amountOut2) / parseFloat(amountIn)).toFixed(6)
  }, [amountIn, amountOut2])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Swap</h1>
          <p className="text-muted-foreground">
            Uniswap Token Price Difference Dashboard
          </p>
        </div>
      </div>
    </div>
  )
}

// Simple token display component
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