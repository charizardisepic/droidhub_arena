"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { Badge } from "@/components/ui/badge"
import { useBlockchainUtils } from "@/lib/blockchainUtils"

export const Navbar = () => {
  const location = useLocation()
  const { address, isConnected } = useAccount()
  const [userBalance, setUserBalance] = useState("0.0")
  const { getUserBalance } = useBlockchainUtils()

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
            <span className="font-bold text-2xl bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              DECENTRABOT
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">Westend</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors hover:text-orange-400 ${
                location.pathname === "/" ? "text-orange-400 font-semibold" : "text-foreground/80"
              }`}
            >
              Home
            </Link>
            <Link
              to="/app"
              className={`transition-colors hover:text-orange-400 ${
                location.pathname === "/app" ? "text-orange-400 font-semibold" : "text-foreground/80"
              }`}
            >
              App
            </Link>
            <a
              href="#"
              className="text-foreground/80 hover:text-orange-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </a>
            <a
              href="https://github.com"
              className="text-foreground/80 hover:text-orange-400 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isConnected && (
            <Badge variant="outline" className="border-orange-400 bg-orange-500/10 text-orange-400 text-sm px-3 py-1">
              Balance: {userBalance} WND
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
