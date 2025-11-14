'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CandlestickChart } from '@/components/charts/candlestick-chart'
import { OrderBook } from '@/components/trading/order-book'
import { getKlines, getOrderBook, getRecentTrades, get24hrTicker, TRADING_PAIRS, type KlineInterval } from '@/lib/api/binance'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'

export default function AdvancedMarketsPage() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT')
  const [interval, setInterval] = useState<KlineInterval>('1h')

  // Fetch candlestick data
  const { data: klines, isLoading: klinesLoading } = useQuery({
    queryKey: ['klines', selectedPair, interval],
    queryFn: () => getKlines(selectedPair, interval, 100),
    refetchInterval: 30000,
  })

  // Fetch order book
  const { data: orderBook, isLoading: orderBookLoading } = useQuery({
    queryKey: ['orderbook', selectedPair],
    queryFn: () => getOrderBook(selectedPair, 20),
    refetchInterval: 5000,
  })

  // Fetch recent trades
  const { data: trades } = useQuery({
    queryKey: ['trades', selectedPair],
    queryFn: () => getRecentTrades(selectedPair, 20),
    refetchInterval: 5000,
  })

  // Fetch 24hr stats
  const { data: ticker } = useQuery({
    queryKey: ['ticker', selectedPair],
    queryFn: () => get24hrTicker(selectedPair),
    refetchInterval: 10000,
  })

  const priceChange = ticker ? parseFloat(ticker.priceChangePercent) : 0
  const isPositive = priceChange >= 0

  const currentPair = TRADING_PAIRS.find(p => p.symbol === selectedPair)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Advanced Trading</h1>
            <p className="text-muted-foreground">
              Professional trading interface with candlesticks and order book
            </p>
          </div>

          {/* Pair Selector */}
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRADING_PAIRS.map((pair) => (
                <SelectItem key={pair.symbol} value={pair.symbol}>
                  {pair.name} / USDT
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Stats Bar */}
        {ticker && (
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price</p>
                  <p className="text-lg font-bold">
                    ${parseFloat(ticker.lastPrice).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h High</p>
                  <p className="font-medium text-green-500">
                    ${parseFloat(ticker.highPrice).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Low</p>
                  <p className="font-medium text-red-500">
                    ${parseFloat(ticker.lowPrice).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Volume ({currentPair?.base})</p>
                  <p className="font-medium">
                    {parseFloat(ticker.volume).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">24h Volume (USDT)</p>
                  <p className="font-medium">
                    ${(parseFloat(ticker.quoteVolume) / 1e6).toFixed(2)}M
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Trading Interface */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-4">
          {/* Chart Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{currentPair?.name} / USDT</CardTitle>
                  
                  {/* Interval Selector */}
                  <Tabs value={interval} onValueChange={(v) => setInterval(v as KlineInterval)}>
                    <TabsList>
                      <TabsTrigger value="1m">1m</TabsTrigger>
                      <TabsTrigger value="5m">5m</TabsTrigger>
                      <TabsTrigger value="15m">15m</TabsTrigger>
                      <TabsTrigger value="1h">1h</TabsTrigger>
                      <TabsTrigger value="4h">4h</TabsTrigger>
                      <TabsTrigger value="1d">1D</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <CandlestickChart
                  data={klines || []}
                  isLoading={klinesLoading}
                  interval={interval}
                />
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="grid grid-cols-3 text-xs text-muted-foreground pb-2">
                    <div>Price (USDT)</div>
                    <div className="text-right">Amount ({currentPair?.base})</div>
                    <div className="text-right">Time</div>
                  </div>
                  {trades?.map((trade) => (
                    <div
                      key={trade.id}
                      className="grid grid-cols-3 text-sm py-1"
                    >
                      <div className={trade.isBuyerMaker ? 'text-red-500' : 'text-green-500'}>
                        {parseFloat(trade.price).toFixed(2)}
                      </div>
                      <div className="text-right font-mono">
                        {parseFloat(trade.qty).toFixed(4)}
                      </div>
                      <div className="text-right text-muted-foreground text-xs">
                        {format(new Date(trade.time), 'HH:mm:ss')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Book Section */}
          <div>
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Order Book</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderBook
                  data={orderBook}
                  isLoading={orderBookLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}