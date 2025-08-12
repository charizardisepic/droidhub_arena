"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useWalletAccount } from "@/hooks/useWalletAccount"
import { Badge } from "@/components/ui/badge"
import { useBlockchainUtils } from "@/lib/blockchainUtils"

export const StandardNavbar = () => {
  const location = useLocation()
  const { address, isConnected } = useWalletAccount()
  
  // Single hook call for blockchain utilities
  const { getUserBalance, getNetwork } = useBlockchainUtils()
  const [network, setNetwork] = useState<'MainNet' | 'TestNet'>(getNetwork())
  const [userBalance, setUserBalance] = useState("0.0")

  useEffect(() => {
    // Initialize network label via utils
    setNetwork(getNetwork())
    const handler = (chainIdHex: string) => {
      setNetwork(getNetwork())
    }
    // Listen for chain changes
    (window as any).ethereum?.on('chainChanged', handler)
    return () => {
      (window as any).ethereum?.removeListener('chainChanged', handler)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout | null = null

    const fetchBalance = async () => {
      if (isConnected && address) {
        try {
          const balance = await getUserBalance()
          if (isMounted) {
            // Round to 2 decimal places
            setUserBalance(Number.parseFloat(balance).toFixed(2))
          }
        } catch (error) {
          console.error("Error fetching user balance:", error)
        }
      }
    }

    fetchBalance()

    // Poll every 5 seconds
    intervalId = setInterval(fetchBalance, 5000)

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [isConnected, address, getUserBalance])

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-2xl bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
              DroidHub
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-sky-500/20 text-sky-400">
              {network}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors hover:text-sky-400 ${
                location.pathname === "/" ? "text-sky-400 font-semibold" : "text-foreground/80"
              }`}
            >
              Home
            </Link>
            <Link
              to="/app"
              className={`transition-colors hover:text-sky-400 ${
                location.pathname === "/app" ? "text-sky-400 font-semibold" : "text-foreground/80"
              }`}
            >
              App
            </Link>
            <Link
              to="/docs"
              className={
                location.pathname === "/docs"
                  ? "text-sky-400 font-semibold"
                  : "text-foreground/80 hover:text-sky-400 transition-colors"
              }
            >
              Docs
            </Link>
            <a
              href="https://github.com/bonusducks777/droidhub/blob/main/README.md"
              className="text-foreground/80 hover:text-sky-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <Badge variant="outline" className="border-sky-400 bg-sky-500/10 text-sky-400 text-sm px-3 py-1">
              Balance: {userBalance} AVAX
            </Badge>
          )}
          <div className="scale-95">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </div>
      </div>
    </nav>
  )
}
