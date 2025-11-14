'use client'

import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import type { OrderBook as OrderBookType } from '@/lib/api/binance'

interface OrderBookProps {
  data: OrderBookType | undefined
  isLoading?: boolean
}

export function OrderBook({ data, isLoading }: OrderBookProps) {
  // Calculate depth percentages for visual bars
  const { bids, asks, maxBidTotal, maxAskTotal } = useMemo(() => {
    if (!data) return { bids: [], asks: [], maxBidTotal: 0, maxAskTotal: 0 }

    // Calculate cumulative totals
    let bidTotal = 0
    const bidsWithTotal = data.bids.slice(0, 15).map((bid) => {
      bidTotal += parseFloat(bid.quantity)
      return {
        ...bid,
        total: bidTotal,
      }
    })

    let askTotal = 0
    const asksWithTotal = data.asks.slice(0, 15).map((ask) => {
      askTotal += parseFloat(ask.quantity)
      return {
        ...ask,
        total: askTotal,
      }
    })

    return {
      bids: bidsWithTotal,
      asks: asksWithTotal.reverse(), // Reverse to show highest ask at bottom
      maxBidTotal: bidTotal,
      maxAskTotal: askTotal,
    }
  }, [data])

  // Calculate spread
  const spread = useMemo(() => {
    if (!data || data.asks.length === 0 || data.bids.length === 0) return null
    
    const lowestAsk = parseFloat(data.asks[0].price)
    const highestBid = parseFloat(data.bids[0].price)
    const spreadValue = lowestAsk - highestBid
    const spreadPercent = (spreadValue / lowestAsk) * 100

    return {
      value: spreadValue,
      percent: spreadPercent,
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No order book data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-muted-foreground px-2">
        <div className="text-left">Price (USDT)</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders) - Red */}
      <div className="space-y-0.5">
        {asks.map((ask, idx) => {
          const price = parseFloat(ask.price)
          const quantity = parseFloat(ask.quantity)
          const depthPercent = (ask.total / maxAskTotal) * 100

          return (
            <div
              key={`ask-${idx}`}
              className="relative grid grid-cols-3 text-xs px-2 py-1 hover:bg-red-500/10 cursor-pointer transition-colors"
            >
              {/* Background bar */}
              <div
                className="absolute right-0 top-0 h-full bg-red-500/10"
                style={{ width: `${depthPercent}%` }}
              />
              
              {/* Content */}
              <div className="relative text-red-500 font-mono">
                {price.toFixed(2)}
              </div>
              <div className="relative text-right font-mono">
                {quantity.toFixed(4)}
              </div>
              <div className="relative text-right font-mono text-muted-foreground">
                {ask.total.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Spread */}
      {spread && (
        <div className="py-3 px-2 bg-muted/50 rounded text-center">
          <div className="text-lg font-bold">
            {data.asks[0] && parseFloat(data.asks[0].price).toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            Spread: {spread.value.toFixed(2)} ({spread.percent.toFixed(3)}%)
          </div>
        </div>
      )}

      {/* Bids (Buy Orders) - Green */}
      <div className="space-y-0.5">
        {bids.map((bid, idx) => {
          const price = parseFloat(bid.price)
          const quantity = parseFloat(bid.quantity)
          const depthPercent = (bid.total / maxBidTotal) * 100

          return (
            <div
              key={`bid-${idx}`}
              className="relative grid grid-cols-3 text-xs px-2 py-1 hover:bg-green-500/10 cursor-pointer transition-colors"
            >
              {/* Background bar */}
              <div
                className="absolute right-0 top-0 h-full bg-green-500/10"
                style={{ width: `${depthPercent}%` }}
              />
              
              {/* Content */}
              <div className="relative text-green-500 font-mono">
                {price.toFixed(2)}
              </div>
              <div className="relative text-right font-mono">
                {quantity.toFixed(4)}
              </div>
              <div className="relative text-right font-mono text-muted-foreground">
                {bid.total.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}