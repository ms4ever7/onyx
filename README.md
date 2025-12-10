# 🔄 Advanced DEX Aggregator

> **📚 Portfolio/Learning Project**: This is an educational pet project where I explore and study DeFi protocols in-depth by building everything from scratch.

A sophisticated decentralized exchange (DEX) aggregator built with Next.js, featuring manual implementations of Uniswap V2 and V3 protocols. Rather than using existing SDKs, this project implements the core mathematical models and blockchain interactions from first principles to demonstrate deep understanding of DeFi mechanics, smart contract interactions, and advanced Web3 development.

## 🎯 Project Goals

This is a **personal learning project** aimed at:

- 📖 **Deep-diving into DeFi protocols** by implementing them manually without SDK abstractions
- 🔬 **Understanding the math** behind AMMs (Automated Market Makers)
- 🏗️ **Building production-quality code** while learning advanced blockchain development
- 💡 **Exploring Web3 best practices** through hands-on implementation
- 🎨 **Creating a portfolio piece** that showcases technical depth and learning capability

**Note**: This is not production-ready software. It's an educational exploration where breaking things and rebuilding them is part of the learning process!

## ✨ Features

### 🎯 Core Functionality
- **Multi-DEX Support**: Aggregate liquidity from Uniswap V2 and V3
- **Multi-Chain**: Support for Ethereum, Sepolia, Polygon, Arbitrum, Optimism, Base, BSC, and Avalanche
- **Manual Protocol Implementation**: Custom quote calculations without relying on SDK abstractions
- **Real-time Price Quotes**: Fetch and calculate optimal swap rates
- **Token Approval Management**: Smart approval flow with allowance checking
- **Native & Wrapped Token Handling**: Seamless swaps between ETH/WETH and ERC20 tokens

### 🔧 Technical Highlights
- **Uniswap V2 Manual Implementation**:
  - Custom reserve-based quote calculation
  - Pair discovery and caching
  - Manual constant product (x*y=k) formula implementation
  
- **Uniswap V3 Manual Implementation** *(In Progress)*:
  - Tick math and sqrt price calculations
  - Concentrated liquidity simulation
  - Multi-tick swap path computation
  - Liquidity distribution analysis

### 🎨 User Experience
- Token search and selection
- Balance display
- Real-time quote updates
- Slippage tolerance configuration
- Transaction status tracking
- Multi-chain wallet integration

## 🏗️ Architecture

### Smart Contract Integration
```
📦 Contracts
├── Uniswap V2 Factory (getPair, token discovery)
├── Uniswap V2 Router (swap execution)
├── Uniswap V2 Pair (reserves, token0/token1)
├── Uniswap V3 Factory (getPool, multi-fee tier support)
├── Uniswap V3 Router (concentrated liquidity swaps)
└── ERC20 Tokens (balance, allowance, approve)
```

### Key Components
- **Token Management**: Dynamic token list fetching and caching
- **Quote Engine**: Manual calculation engine for optimal swap rates
- **Transaction Manager**: Approval and swap transaction handling
- **Chain Abstraction**: Multi-chain support with dynamic contract addresses

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Blockchain Interaction**: Viem 2.x
- **Wallet Connection**: wagmi
- **State Management**: React Hooks
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- A Web3 wallet (MetaMask, Rainbow, etc.)
- Test ETH on Sepolia testnet (for testing)

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🔑 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

## 📚 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── SwapInterface/     # Main swap UI
│   └── TokenSelector/     # Token search and selection
├── hooks/                  # Custom React hooks
│   ├── useUniswapV2Manual.ts    # V2 manual implementation
│   ├── useUniswapV3Manual.ts    # V3 manual implementation
│   └── useTokenList.ts          # Token management
├── lib/                    # Core utilities
│   ├── contracts/         # ABIs and contract addresses
│   ├── tokens/           # Token utilities and lists
│   └── utils/            # Helper functions
└── types/                 # TypeScript definitions
```

## 🎓 Learning Highlights

This project demonstrates:

1. **Deep DeFi Understanding**
   - Constant product AMM mechanics (x*y=k)
   - Concentrated liquidity mathematics
   - Tick-based pricing systems
   - Price impact calculations

2. **Advanced Smart Contract Interaction**
   - Multi-call optimization for reduced RPC calls
   - Transaction simulation and gas estimation
   - Event listening and transaction tracking
   - Error handling and retry logic

3. **Web3 Best Practices**
   - Chain-specific contract handling
   - Native vs wrapped token logic
   - Allowance management patterns
   - Slippage protection

4. **Performance Optimization
