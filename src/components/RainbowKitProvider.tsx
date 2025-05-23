"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { RainbowKitProvider as RKProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit"
import { http, WagmiProvider } from "wagmi"
import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "@/components/ThemeProvider"
import "@rainbow-me/rainbowkit/styles.css"

interface RainbowKitWrapperProps {
  children: React.ReactNode
}

// WalletConnect Project ID
const projectId = "f648e94e1f1c32327aaa0416d6409e2b"

// Define the Avalanche C-Chain mainnet
const avalancheCChain = {
  id: 43114,
  name: "Avalanche C-Chain",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://avalanche-c-chain-rpc.publicnode.com"] },
  },
  blockExplorers: {
    default: {
      name: "SnowTrace",
      url: "https://snowtrace.io",
    },
  },
  testnet: false,
} as const

// Use getDefaultConfig from RainbowKit which properly sets up wagmi
const config = getDefaultConfig({
  appName: "DroidHub",
  projectId,
  chains: [avalancheCChain],
  transports: {
    [avalancheCChain.id]: http(),
  },
})

// Create query client with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const RainbowKitProvider: React.FC<RainbowKitWrapperProps> = ({ children }) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure window is available before mounting to prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RKProvider theme={theme === "dark" ? darkTheme() : lightTheme()}>{children}</RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default RainbowKitProvider
