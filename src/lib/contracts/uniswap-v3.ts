import { parseAbi } from 'viem'

export const UNISWAP_V3_ADDRESSES: Record<
  number,
  {
    FACTORY: `0x${string}`
    ROUTER: `0x${string}`
    QUOTER_V2: `0x${string}` | null
    POSITION_MANAGER: `0x${string}` | null
  }
> = {
  1: { // Ethereum Mainnet
    FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    QUOTER_V2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },

  137: { // Polygon
    FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    QUOTER_V2: '0x91AE842A5Ffd8d12023116943e72A606179294f3',
    POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },

  42161: { // Arbitrum One
    FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    QUOTER_V2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },

  10: { // Optimism
    FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    ROUTER: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    QUOTER_V2: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },

  8453: { // Base Mainnet
    FACTORY: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    ROUTER: '0x2626664c2603336E57B271c5C0b26F421741e481',
    QUOTER_V2: '0xF8A8f71F251cDD7C5e76F3Fd70936A21F7fBe3c5',
    POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },

  84532: { // Base Sepolia
    FACTORY: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    ROUTER: '0x050E797f3625EC8785265e1d9BDd4799b97528A1',
    QUOTER_V2: null, // Not deployed
    POSITION_MANAGER: null, // Not deployed
  },

  43114: { // Avalanche C-Chain
    FACTORY: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
    ROUTER: '0x4Dae2f939ACf50408e13d58534Ff8c2776d45265',
    QUOTER_V2: null, // No official QuoterV2 on AVAX
    POSITION_MANAGER: null,
  },
}


export const getUniswapV3Addresses = (chainId: number): { FACTORY: `0x${string}`, ROUTER: `0x${string}`, QUOTER_V2: `0x${string}` | null  } => {
  const addresses = UNISWAP_V3_ADDRESSES[chainId]
  if (!addresses) {
    throw new Error(`Uniswap V3 not supported on chain ${chainId}`)
  }
  return addresses
}

export const FEE_TIERS = {
  LOWEST: 100,
  LOW: 500,
  MEDIUM: 3000,
  HIGH: 10000,
} as const

export const UNISWAP_V3_ROUTER_ABI = parseAbi([
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
])

export const UNISWAP_V3_QUOTER_V2_ABI = parseAbi([
  'function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96)) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)',
])

export const UNISWAP_V3_FACTORY_ABI = parseAbi([
  'function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)',
  'function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)',
])

export const UNISWAP_V3_POOL_ABI = parseAbi([
  // Core pool state
  'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() external view returns (uint128)',
  'function fee() external view returns (uint24)',
  'function tickSpacing() external view returns (int24)',

  // Token metadata
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',

  // Ticks
  'function ticks(int24 tick) external view returns (uint128 liquidityGross, int128 liquidityNet, uint256 feeGrowthOutside0X128, uint256 feeGrowthOutside1X128, int56 tickCumulativeOutside, uint160 secondsPerLiquidityOutsideX128, uint32 secondsOutside, bool initialized)',

  // Tick bitmap (to find initialized ticks)
  'function tickBitmap(int16 wordPosition) external view returns (uint256)',

  // Observations (for TWAP)
  'function observe(uint32[] secondsAgos) external view returns (int56[] tickCumulatives, uint160[] secondsPerLiquidityCumulativeX128s)',

  // Direct swap function (optional, if you want to simulate swaps via staticcall)
  'function swap(address recipient, bool zeroForOne, int256 amountSpecified, uint160 sqrtPriceLimitX96, bytes data) external returns (int256 amount0, int256 amount1)',
])


export const ERC20_ABI = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
])

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