"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { ArenaConnectButton } from "@/components/ArenaConnectButton"
import { useArena } from "@/components/ArenaProvider"

export const ArenaNavbar = () => {
  const location = useLocation()
  const { walletAddress, isConnected, balance } = useArena()
  
  const [userBalance, setUserBalance] = useState("0.0")

  useEffect(() => {
    if (balance) {
      setUserBalance(balance)
    }
  }, [balance])

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path !== "/" && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-white font-bold text-xl">DroidHub</span>
          </Link>
        
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors ${
                isActive("/") 
                  ? "text-sky-400 border-b-2 border-sky-400 pb-1" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/app" 
              className={`transition-colors ${
                isActive("/app") 
                  ? "text-sky-400 border-b-2 border-sky-400 pb-1" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Control Panel
            </Link>
            <Link 
              to="/docs" 
              className={`transition-colors ${
                isActive("/docs") 
                  ? "text-sky-400 border-b-2 border-sky-400 pb-1" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Documentation
            </Link>
            <Link 
              to="/arena-test" 
              className={`transition-colors ${
                isActive("/arena-test") 
                  ? "text-sky-400 border-b-2 border-sky-400 pb-1" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Arena Test
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && (
              <Badge variant="outline" className="border-sky-400 bg-sky-500/10 text-sky-400 text-sm px-3 py-1">
                Balance: {userBalance} AVAX
              </Badge>
            )}
            <div className="scale-95">
              <ArenaConnectButton variant="default" size="default" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
