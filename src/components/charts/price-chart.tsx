'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

interface PriceChartProps {
  data: [number, number][] // [timestamp, price]
  isLoading?: boolean
  days: number | 'max'
}

export function PriceChart({ data, isLoading, days }: PriceChartProps) {
  // Transform data for recharts
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    return data.map(([timestamp, price]) => ({
      timestamp,
      price,
      date: new Date(timestamp),
    }))
  }, [data]);

  console.log('chart data', chartData);

  // Determine if price is up or down
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0
    const first = chartData[0].price
    const last = chartData[chartData.length - 1].price
    return ((last - first) / first) * 100
  }, [chartData])

  const lineColor = priceChange >= 0 ? '#10b981' : '#ef4444' // green or red

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    )
  }

  // Format date based on timeframe
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp)
    if (days === 1) return format(date, 'HH:mm')
    if (days === 7) return format(date, 'MMM dd')
    if (Number(days) <= 30) return format(date, 'MMM dd')
    return format(date, 'MMM yyyy')
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Price
                        </span>
                        <span className="font-bold text-lg">
                          ${data.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="text-sm">
                          {format(data.date, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}