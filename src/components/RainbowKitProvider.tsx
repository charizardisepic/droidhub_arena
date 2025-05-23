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

// Define the Asset-Hub Westend testnet
const westendAssetHub = {
  id: 420420421,
  name: "Asset-Hub Westend TestNet",
  nativeCurrency: {
    name: "Westend",
    symbol: "WND",
    decimals: 12,
  },
  rpcUrls: {
    default: { http: ["https://westend-asset-hub-rpc.polkadot.io"] },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://assethub-westend.subscan.io",
    },
  },
  testnet: true,
} as const

// Use getDefaultConfig from RainbowKit which properly sets up wagmi
const config = getDefaultConfig({
  appName: "Decentrabot",
  projectId,
  chains: [westendAssetHub],
  transports: {
    [westendAssetHub.id]: http(),
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
