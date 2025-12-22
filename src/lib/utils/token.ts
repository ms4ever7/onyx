import { formatUnits, Hash } from 'viem'
import { ERC20_ABI } from '@/lib/contracts/uniswap-v2'
import { createPublicClientForChain } from '../viem/publicClient'
import { useChainId } from 'wagmi'

export type Token = {
  symbol: string
  name: string
  decimals: number
  address: Hash | "NATIVE"
  isNative: boolean
  wrappedAddress?: Hash
  logo?: string,
  current_price?: any
}

/**
 * Convert token to routing address
 * Native tokens (ETH) -> WETH for DEX routing
 * ERC20 tokens -> their own address
 */
export const toRouteAddress = (token: Token): Hash => {
  if (token.isNative) {
    if (!token.wrappedAddress) {
      throw new Error(`Native token ${token.symbol} missing wrappedAddress`)
    }
    return token.wrappedAddress
  }
  return token.address as Hash
}

/**
 * Get balance address
 */
export const toBalanceAddress = (token: Token): Hash | "NATIVE" => {
  return token.address
}

/**
 * Check if token is native
 */
export const isNativeToken = (token: Token): boolean => {
  return token.isNative || token.address === "NATIVE"
}

/**
 * Fetch token balance (handles both native and ERC20)
 */
export async function fetchTokenBalance(
  token: Token,
  userAddress: Hash,
  chainId: number,
): Promise<string> {
  const publicClient = createPublicClientForChain(chainId);
  
  if (isNativeToken(token)) {
    const raw = await publicClient.getBalance({ address: userAddress })
    return formatUnits(raw, token.decimals)
  }

  const tokenAddress = toRouteAddress(token)

  // This can be taken form some Coingecko API but here I use it for learning purpose
  const decimals = await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  // ERC20 token
  const rawBalance = await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  })

  return formatUnits(rawBalance, decimals)
}

/**
 * Check if token needs approval (native tokens never need approval)
 */
export function needsApproval(token: Token): boolean {
  return !isNativeToken(token)
}

/**
 * Get allowance for token (returns max for native tokens)
 */
export async function fetchTokenAllowance(
  token: Token,
  owner: Hash,
  spender: Hash,
  chainId: number
): Promise<bigint> {
  const publicClient = createPublicClientForChain(chainId);
  // Native tokens don't need approval
  if (isNativeToken(token)) {
    return BigInt(2) ** BigInt(256) - BigInt(1) // Max uint256
  }

  // ERC20 allowance
  const allowance = await publicClient.readContract({
    address: token.address as Hash,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, spender],
  })

  return allowance
}