import axios from 'axios'

const BINANCE_API = 'https://api.binance.com/api/v3'

export type KlineInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

export interface Kline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  trades: number
}

export interface OrderBookEntry {
  price: string
  quantity: string
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdateId: number
}

export interface Trade {
  id: number
  price: string
  qty: string
  time: number
  isBuyerMaker: boolean
}

export async function getKlines(
  symbol: string,
  interval: KlineInterval = '1h',
  limit: number = 100
): Promise<Kline[]> {
  try {
    const response = await axios.get(`${BINANCE_API}/klines`, {
      params: { symbol, interval, limit },
    })

    return response.data.map((k: any[]) => ({
      openTime: k[0],
      open: k[1],
      high: k[2],
      low: k[3],
      close: k[4],
      volume: k[5],
      closeTime: k[6],
      trades: k[8],
    }))
  } catch (error) {
    console.error('Binance Klines Error:', error)
    throw error
  }
}

export async function getOrderBook(
  symbol: string,
  limit: number = 20
): Promise<OrderBook> {
  try {
    const response = await axios.get(`${BINANCE_API}/depth`, {
      params: { symbol, limit },
    })

    return {
      bids: response.data.bids.map((b: string[]) => ({
        price: b[0],
        quantity: b[1],
      })),
      asks: response.data.asks.map((a: string[]) => ({
        price: a[0],
        quantity: a[1],
      })),
      lastUpdateId: response.data.lastUpdateId,
    }
  } catch (error) {
    console.error('Binance Order Book Error:', error)
    throw error
  }
}

export async function getRecentTrades(
  symbol: string,
  limit: number = 50
): Promise<Trade[]> {
  try {
    const response = await axios.get(`${BINANCE_API}/trades`, {
      params: { symbol, limit },
    })

    return response.data
  } catch (error) {
    console.error('Binance Trades Error:', error)
    throw error
  }
}

export async function get24hrTicker(symbol: string) {
  try {
    const response = await axios.get(`${BINANCE_API}/ticker/24hr`, {
      params: { symbol },
    })
    return response.data
  } catch (error) {
    console.error('Binance Ticker Error:', error)
    throw error
  }
}

export const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', base: 'BTC', quote: 'USDT' },
  { symbol: 'ETHUSDT', name: 'Ethereum', base: 'ETH', quote: 'USDT' },
  { symbol: 'BNBUSDT', name: 'BNB', base: 'BNB', quote: 'USDT' },
  { symbol: 'SOLUSDT', name: 'Solana', base: 'SOL', quote: 'USDT' },
  { symbol: 'ADAUSDT', name: 'Cardano', base: 'ADA', quote: 'USDT' },
  { symbol: 'MATICUSDT', name: 'Polygon', base: 'MATIC', quote: 'USDT' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', base: 'DOGE', quote: 'USDT' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', base: 'AVAX', quote: 'USDT' },
] as const;