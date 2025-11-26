import { parseAbi } from 'viem'

export const UNISWAP_V3_ADDRESSES = {
  ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564' as `0x${string}`,
  FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984' as `0x${string}`,
  QUOTER_V2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' as `0x${string}`, // ← Fixed
  NFT_POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88' as `0x${string}`,
} as const

export const FEE_TIERS = {
  LOWEST: 100,
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
} as const

export const UNISWAP_V3_ROUTER_ABI = parseAbi([
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
])

// ✅ Fixed Quoter V2 ABI
export const UNISWAP_V3_QUOTER_V2_ABI = parseAbi([
  'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
])

// Factory ABI
export const UNISWAP_V3_FACTORY_ABI = parseAbi([
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)',
  'function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)',
])

// Pool ABI
export const UNISWAP_V3_POOL_ABI = parseAbi([
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function fee() external view returns (uint24)',
  'function tickSpacing() external view returns (int24)',
])

// ERC20 ABI (same as V2)
export const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
])

// Common tokens (same as V2, but now need to specify fee tier)
export const COMMON_TOKENS = {
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as `0x${string}`,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
  },
  UNI: {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' as `0x${string}`,
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
  },
  WBTC: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
  },
} as const

export type Token = typeof COMMON_TOKENS[keyof typeof COMMON_TOKENS]


export function encodePath(tokens: `0x${string}`[], fees: number[]): `0x${string}` {
  if (tokens.length !== fees.length + 1) {
    throw new Error('Invalid path: tokens.length must equal fees.length + 1')
  }
  
  let encoded = '0x'
  for (let i = 0; i < fees.length; i++) {
    // token + fee (3 bytes = 6 hex chars)
    encoded += tokens[i].slice(2) // Remove 0x
    encoded += fees[i].toString(16).padStart(6, '0')
  }
  encoded += tokens[tokens.length - 1].slice(2)
  
  return encoded as `0x${string}`
}