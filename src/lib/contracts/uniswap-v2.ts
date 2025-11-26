import { parseAbi } from 'viem'

// Uniswap V2 Contract Addresses (Ethereum Mainnet)
export const UNISWAP_V2_ADDRESSES = {
  ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D' as `0x${string}`,
  FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' as `0x${string}`,
} as const

// Uniswap V2 Router ABI (only functions we need)
export const UNISWAP_V2_ROUTER_ABI = parseAbi([
  // Get amounts
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  'function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)',
  
  // Swap exact tokens for tokens
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  
  // Swap tokens for exact tokens
  'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  
  // Swap ETH
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  
  // Add/Remove Liquidity
  'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)',
])

// ERC20 ABI (for token approvals and balances)
export const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
])

// Uniswap V2 Factory ABI
export const UNISWAP_V2_FACTORY_ABI = parseAbi([
  'function getPair(address tokenA, address tokenB) external view returns (address pair)',
  'function allPairs(uint) external view returns (address pair)',
  'function allPairsLength() external view returns (uint)',
])

// Uniswap V2 Pair ABI
export const UNISWAP_V2_PAIR_ABI = parseAbi([
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function totalSupply() external view returns (uint)',
])

// Common ERC20 tokens on Ethereum Mainnet
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
  LINK: {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as `0x${string}`,
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
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

// Helper: Check if token is native ETH
export function isNativeETH(token: Token | null): boolean {
  return token?.symbol === 'WETH'
}