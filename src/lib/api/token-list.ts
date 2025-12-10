import axios from 'axios'
import type { Token } from '@/lib/utils/token'

interface TokenListToken {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

interface TokenList {
  name: string
  tokens: TokenListToken[]
}

const TOKEN_LIST_URLS = {
  UNISWAP: 'https://tokens.uniswap.org',
  COINGECKO: 'https://tokens.coingecko.com/uniswap/all.json',
}

export const resolveLogo = (logo: string) => {
  if (logo.startsWith("ipfs://")) {
    return "https://ipfs.io/ipfs/" + logo.slice(7)
  }
  return logo
}

export async function fetchTokenList(chainId: number = 1): Promise<Token[]> {
  try {
    // For testnets, return hardcoded token list
    if (chainId === 11155111) { // Sepolia
      return getSepoliaTokens()
    }

    const response = await axios.get<TokenList>(TOKEN_LIST_URLS.UNISWAP)
     
    const tokens: Token[] = response.data.tokens
      .filter(t => t.chainId === chainId)
      .map(t => ({
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        address: t.address as `0x${string}`,
        isNative: false,
        logo: t.logoURI,
      }))
   
    const nativeToken = getNativeToken(chainId)
     
    return [nativeToken, ...tokens]
  } catch (error) {
    console.error('Error fetching token list:', error)
    return []
  }
}

function getNativeToken(chainId: number): Token {
  const nativeTokens: Record<number, Token> = {
    1: { // Ethereum
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: 'NATIVE',
      isNative: true,
      wrappedAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    },
    11155111: { // Sepolia
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: 'NATIVE',
      isNative: true,
      wrappedAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // WETH on Sepolia
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    },
    137: { // Polygon
      symbol: 'MATIC',
      name: 'Polygon',
      decimals: 18,
      address: 'NATIVE',
      isNative: true,
      wrappedAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    },
    42161: { // Arbitrum
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: 'NATIVE',
      isNative: true,
      wrappedAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    },
    10: { // Optimism
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: 'NATIVE',
      isNative: true,
      wrappedAddress: '0x4200000000000000000000000000000000000006',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    },
    8453: { // Base
      symbol: 'ETH',
      name: 'Ethereum',
      decimals: 18,
      address: 'NATIVE',
      isNative: true,
      wrappedAddress: '0x4200000000000000000000000000000000000006',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    },
  }

  const token = nativeTokens[chainId]
  if (!token) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }
  return token
}

function getSepoliaTokens(): Token[] {
  const nativeToken = getNativeToken(11155111)
  
  // Common Sepolia testnet tokens
  const tokens: Token[] = [
    nativeToken,
    {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      decimals: 18,
      address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
      isNative: false,
      logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
      isNative: false,
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
      address: '0x68194a729C2450ad26072b3D33ADaCbcef39D574',
      isNative: false,
      logo: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
    }
  ]

  return tokens
}

// Popular tokens for quick access
export function getPopularTokens(tokens: Token[]): Token[] {
  const popularSymbols = ['WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'UNI', 'LINK']
  return tokens.filter(t => 
    t.isNative || popularSymbols.includes(t.symbol.toUpperCase())
  )
}