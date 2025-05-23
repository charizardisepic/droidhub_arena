"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Battery, Signal } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { useBlockchainUtils } from "@/lib/blockchainUtils"

interface RobotStatusProps {
  robotId: string
}

export function RobotStatus({ robotId = "robot-1" }: RobotStatusProps) {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"Connected" | "Disconnected">("Disconnected")
  const [lastActive, setLastActive] = useState<string | null>(null)
  const [botFee, setBotFee] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const blockchainUtils = useBlockchainUtils()

  useEffect(() => {
    let isMounted = true
    let intervalId: NodeJS.Timeout

    const fetchRobotStatus = async () => {
      if (isLoading) return

      try {
        setIsLoading(true)
        setError(null)

        // Get battery level
        const batteryLevel = await blockchainUtils.getRobotBatteryLevel(robotId)
        if (isMounted) setBatteryLevel(batteryLevel)

        // Get uptime
        const uptime = await blockchainUtils.getRobotUptime(robotId)
        if (isMounted) setLastActive(uptime)

        // Get fee
        const fee = await blockchainUtils.getBotFee()
        if (isMounted) setBotFee(fee)

        // Set connection status based on successful data retrieval
        if (isMounted) setConnectionStatus("Connected")
      } catch (error) {
        console.error("Error fetching robot status:", error)
        if (isMounted) {
          setError("Failed to fetch robot data from blockchain")
          setConnectionStatus("Disconnected")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchRobotStatus()

    // Set up interval to fetch data periodically (every 30 seconds)
    intervalId = setInterval(fetchRobotStatus, 30000)

    // Cleanup function
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [robotId]) // Fixed: Added proper dependency array

  const formattedLastActive = lastActive ? new Date(lastActive).toLocaleString() : "Loading..."

  return (
    <Card className="neo-card h-full">
      <div className="p-2">
        <h3 className="text-sm font-bold mb-1">Robot Status</h3>
        <div className="space-y-2">
          {error && <div className="text-xs text-red-500 mb-1">{error}</div>}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Battery Level</span>
              <span className="text-xs font-medium">
                {batteryLevel !== null ? `${batteryLevel.toFixed(0)}%` : "Loading..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={batteryLevel !== null ? batteryLevel : 0} className="h-1.5" />
              <Battery
                className={`h-3 w-3 ${
                  batteryLevel !== null && batteryLevel < 20
                    ? "text-red-500"
                    : batteryLevel !== null
                      ? "text-green-500"
                      : "text-muted-foreground"
                }`}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Connection Status</span>
            <Badge
              variant="outline"
              className={`text-xs h-5 ${
                connectionStatus === "Connected" ? "text-green-500 border-green-500" : "text-red-500 border-red-500"
              }`}
            >
              <Signal className="h-3 w-3 mr-1" />
              {connectionStatus}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Last Active</span>
            <span className="text-xs font-medium">{formattedLastActive}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Fee Rate</span>
            <span className="text-xs font-medium">
              {botFee !== null ? `${Number.parseFloat(botFee).toFixed(2)} WND/min` : "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
