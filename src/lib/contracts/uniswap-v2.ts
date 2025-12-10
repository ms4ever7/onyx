import { parseAbi } from 'viem'

// Uniswap V2 Contract Addresses (Ethereum Mainnet)
export const UNISWAP_V2_ADDRESSES: Record<number, { FACTORY: `0x${string}`, ROUTER: `0x${string}` }> = {
  1: { // Mainnet
    FACTORY: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
  11155111: { // Sepolia
    FACTORY: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6',
    ROUTER: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
  },
  137: { // Polygon
    FACTORY: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
    ROUTER: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff', // QuickSwap (Uniswap V2 fork)
  },
  42161: { // Arbitrum
    FACTORY: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
    ROUTER: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // SushiSwap
  },
  10: { // Optimism
    FACTORY: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
    ROUTER: '0x4A7b5Da61326A6379179b40d00F57E5bbDC962c2', // Velodrome (Uniswap V2 compatible)
  },
  8453: { // Base
    FACTORY: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    ROUTER: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24', // BaseSwap
  },
  56: { // BSC
    FACTORY: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    ROUTER: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // PancakeSwap V2
  },
  43114: { // Avalanche
    FACTORY: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10',
    ROUTER: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4', // TraderJoe
  },
}

export const getUniswapV2Addresses = (chainId: number): { FACTORY: `0x${string}`, ROUTER: `0x${string}` } => {
  const addresses = UNISWAP_V2_ADDRESSES[chainId]
  if (!addresses) {
    throw new Error(`Uniswap V2 not supported on chain ${chainId}`)
  }
  return addresses
}

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
  ETH: {
    symbol: "ETH",
    decimals: 18,
    isNative: true,
    address: "NATIVE",
    wrappedAddress: "0xC02aaa39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  WETH: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/2518/small/weth.png',
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
  },
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' as `0x${string}`,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
  },
  UNI: {
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' as `0x${string}`,
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
  },
  LINK: {
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' as `0x${string}`,
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
  },
  WBTC: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    isNative: false,
    logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
  },
} as const
