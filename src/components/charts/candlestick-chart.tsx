'use client'

import { useMemo } from 'react'
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from 'recharts'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import type { Kline } from '@/lib/api/binance'

interface CandlestickChartProps {
  data: Kline[]
  isLoading?: boolean
  interval: string
}

export function CandlestickChart({ data, isLoading, interval }: CandlestickChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    return data.map((candle) => {
      const open = parseFloat(candle.open)
      const close = parseFloat(candle.close)
      const high = parseFloat(candle.high)
      const low = parseFloat(candle.low)
      const isGreen = close >= open

      return {
        time: candle.openTime,
        open,
        close,
        high,
        low,
        volume: parseFloat(candle.volume),
        // For rendering candlestick body
        body: isGreen ? [open, close] : [close, open],
        // For rendering wicks
        upperWick: [Math.max(open, close), high],
        lowerWick: [low, Math.min(open, close)],
        color: isGreen ? '#10b981' : '#ef4444',
        isGreen,
      }
    })
  }, [data])

  // Calculate moving averages
  const chartDataWithMA = useMemo(() => {
    if (chartData.length < 20) return chartData

    return chartData.map((item, idx) => {
      // Simple Moving Average (SMA) 20
      const ma20Start = Math.max(0, idx - 19)
      const ma20Slice = chartData.slice(ma20Start, idx + 1)
      const ma20 = ma20Slice.reduce((sum, d) => sum + d.close, 0) / ma20Slice.length

      // Simple Moving Average (SMA) 50
      const ma50Start = Math.max(0, idx - 49)
      const ma50Slice = chartData.slice(ma50Start, idx + 1)
      const ma50 = ma50Slice.reduce((sum, d) => sum + d.close, 0) / ma50Slice.length

      return {
        ...item,
        ma20: ma20Slice.length >= 20 ? ma20 : null,
        ma50: ma50Slice.length >= 50 ? ma50 : null,
      }
    })
  }, [chartData])

  if (isLoading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    )
  }

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp)
    if (interval === '1m' || interval === '5m' || interval === '15m') {
      return format(date, 'HH:mm')
    }
    if (interval === '1h' || interval === '4h') {
      return format(date, 'MMM dd HH:mm')
    }
    return format(date, 'MMM dd')
  }

  return (
    <div className="space-y-4">
      {/* Price Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartDataWithMA} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={['dataMin - 100', 'dataMax + 100']}
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              orientation="right"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="grid gap-2">
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(data.time), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <span className="text-muted-foreground">Open:</span>
                          <span className="font-mono">${data.open.toFixed(2)}</span>
                          <span className="text-muted-foreground">High:</span>
                          <span className="font-mono text-green-500">${data.high.toFixed(2)}</span>
                          <span className="text-muted-foreground">Low:</span>
                          <span className="font-mono text-red-500">${data.low.toFixed(2)}</span>
                          <span className="text-muted-foreground">Close:</span>
                          <span className="font-mono font-bold">${data.close.toFixed(2)}</span>
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="font-mono">{data.volume.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />

            {/* Candlestick Wicks (thin lines) */}
            <Bar
              dataKey="upperWick"
              fill="none"
              stroke="#888888"
              strokeWidth={1}
            />
            <Bar
              dataKey="lowerWick"
              fill="none"
              stroke="#888888"
              strokeWidth={1}
            />

            {/* Candlestick Bodies */}
            {chartDataWithMA.map((entry, index) => (
              <Bar
                key={`candle-${index}`}
                dataKey={() => entry.body}
                fill={entry.color}
                barSize={8}
              />
            ))}

            {/* Moving Averages */}
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="ma50"
              stroke="#8b5cf6"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartDataWithMA} margin={{ top: 0, right: 10, left: 10, bottom: 5 }}>
            <XAxis
              dataKey="time"
              tickFormatter={formatXAxis}
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              orientation="right"
            />
            <Bar
              dataKey="volume"
              fill="#888888"
              opacity={0.3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500" />
          <span>MA20</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-purple-500" />
          <span>MA50</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm" />
          <span>Bullish</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" />
          <span>Bearish</span>
        </div>
      </div>
    </div>
  )
}