"use client"

import { Card } from "@/components/ui/card"
import { useBlockchainUtils } from "@/lib/blockchainUtils"
import { useState, useEffect } from "react"
import { useWalletAccount } from "@/hooks/useWalletAccount"

interface StakingLeaderboardProps {
  robotId: string
}

interface LeaderboardEntry {
  address: string
  stake: string
  timeRemaining: string
  isCurrentUser?: boolean
  countdown?: {
    minutes: number
    seconds: number
  }
}

export function StakingLeaderboard({ robotId }: StakingLeaderboardProps) {
  const { getLeaderboard, calculateTimeRemaining, getBotFee } = useBlockchainUtils()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useWalletAccount()

  // Add state for countdown
  const [countdown, setCountdown] = useState({ minutes: 0, seconds: 0 })

  useEffect(() => {
    let isMounted = true
    let countdownInterval: NodeJS.Timeout | null = null

    // Start countdown timer
    if (leaderboard.length >= 2) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev.minutes === 0 && prev.seconds === 0) {
            // Time's up, refresh leaderboard
            fetchLeaderboard()
            return { minutes: 0, seconds: 0 }
          }

          if (prev.seconds === 0) {
            return { minutes: prev.minutes - 1, seconds: 59 }
          }

          return { minutes: prev.minutes, seconds: prev.seconds - 1 }
        })
      }, 1000)
    }

    return () => {
      isMounted = false
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [leaderboard])

  const fetchLeaderboard = async () => {
    if (isLoading) return

    try {
      setIsLoading(true)
      const data = await getLeaderboard()
      // Calculate time estimate based on current fee rate from contract
      const rateStr = await getBotFee()
      const rate = parseFloat(rateStr)
      if (data.length >= 2) {
        const est = calculateTimeRemaining(data[0].stake, data[1].stake, rate)
        data[0].timeRemaining = `${est.minutes}m ${est.seconds}s`
      }

      // Round stake values to 2 decimal places
      const roundedData = data.map((entry) => ({
        ...entry,
        stake: Number.parseFloat(entry.stake).toFixed(2),
      }))

      setLeaderboard(roundedData)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    let leaderboardInterval: NodeJS.Timeout | null = null

    fetchLeaderboard()

    // Set up interval to fetch data every 5 seconds
    leaderboardInterval = setInterval(fetchLeaderboard, 5000)

    // Cleanup function
    return () => {
      isMounted = false
      if (leaderboardInterval) clearInterval(leaderboardInterval)
    }
  }, [robotId])

  return (
    <Card className="neo-card flex flex-col h-full">
      <div className="p-2 flex flex-col h-full">
        <h3 className="text-sm font-bold mb-1">Staking Leaderboard</h3>
        <div className="flex-1 overflow-y-auto space-y-2 p-1">
          {leaderboard.map((stake, index) => {
            const isCurrentUser = address && stake.address.toLowerCase().includes(address.toLowerCase().slice(2, 6))

            // Display live countdown for the top staker
            const countdoAVAXisplay =
              index === 0 && countdown.minutes > 0 ? `${countdown.minutes}m ${countdown.seconds}s` : stake.timeRemaining

            return (
              <div
                key={stake.address}
                className={`grid grid-cols-3 items-center p-1 rounded-md ${
                  index === 0 ? "bg-sky-100 dark:bg-sky-900/30" : ""
                } ${stake.address.includes(address?.slice(2, 6) || "") ? "border border-sky-500" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <div className="font-bold text-xs">{index + 1}</div>
                  <span className={`text-xs font-medium ${index === 0 ? "text-sky-500" : ""}`}>{stake.address}</span>
                </div>
                <div className="text-xs text-muted-foreground">{stake.timeRemaining}</div>
                <div className="text-xs font-medium">{stake.stake} AVAX</div>
              </div>
            )
          })}

          {leaderboard.length === 0 && !isLoading && (
            <div className="text-center py-8 text-xs text-muted-foreground">No stakes yet. Be the first to stake!</div>
          )}

          {isLoading && leaderboard.length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">Loading leaderboard...</div>
          )}
        </div>
      </div>
    </Card>
  )
}
