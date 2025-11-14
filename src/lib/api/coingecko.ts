import axios, { AxiosRequestConfig } from "axios";
import { CoinGeckoMarketData } from './types';

const API_KEY = "CG-htW8FZA2s6UML5ozgvrHDwgs";

// TypeScript types
export interface PriceChartData {
  prices: [number, number][] // [timestamp, price]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

/**
 * Fetch top 50 coins by market cap
 */
export const fetchCoinListFromCoinGecko = async (): Promise<CoinGeckoMarketData[]> => {
  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.coingecko.com/api/v3/coins/markets",
    params: {
      vs_currency: "usd",
      per_page: 50,
      page: 1,
      order: 'market_cap_desc',
      sparkline: false
    },
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": API_KEY,
    },
  };

  try {
    const response = await axios.request<CoinGeckoMarketData[]>(options);
    return response.data;
  } catch (err) {
    console.error(`COINGECKO ERROR ${err}`);
    throw err;
  }
};

/**
 * Fetch historical price data for charts
 * @param coinId - coin id (e.g., 'bitcoin', 'ethereum')
 * @param days - number of days (1, 7, 30, 90, 365, 'max')
 */
export const fetchCoinChart = async (
  coinId: string,
  days: number | 'max' = 7
): Promise<PriceChartData> => {
  const options: AxiosRequestConfig = {
    method: "GET",
    url: `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
    params: {
      vs_currency: 'usd',
      days,
      interval: days === 1 ? 'hourly' : 'daily',
    },
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": API_KEY,
    },
  };

  try {
    const response = await axios.request<PriceChartData>(options);
    return response.data;
  } catch (err) {
    console.error(`COINGECKO CHART ERROR ${err}`);
    throw err;
  }
};

/**
 * Fetch single coin data (for detailed view)
 */
export const fetchCoinData = async (coinId: string): Promise<CoinGeckoMarketData> => {
  const options: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.coingecko.com/api/v3/coins/markets",
    params: {
      vs_currency: "usd",
      ids: coinId,
    },
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": API_KEY,
    },
  };

  try {
    const response = await axios.request<CoinGeckoMarketData[]>(options);
    return response.data[0];
  } catch (err) {
    console.error(`COINGECKO SINGLE COIN ERROR ${err}`);
    throw err;
  }
};

// Popular coins for quick access
export const POPULAR_COINS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USDC' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
] as const;