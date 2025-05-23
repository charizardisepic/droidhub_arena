"use client"

import { useState, useEffect, useRef } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"
import { useBlockchainUtils } from "@/lib/blockchainUtils"

export const ControlPanel = () => {
  const { address, isConnected } = useAccount()
  const [isCurrentController, setIsCurrentController] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastCommand, setLastCommand] = useState("")
  const [selectedRobotId, setSelectedRobotId] = useState("robot-1")

  // Use a ref to track if data has been fetched
  const dataFetched = useRef(false)

  const { getCurrentController } = useBlockchainUtils()

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    let isMounted = true

    const checkController = async () => {
      if (!isConnected || !address) {
        if (isMounted) setIsCurrentController(false)
        return
      }

      try {
        const controller = await getCurrentController()
        if (isMounted) {
          setIsCurrentController(controller.toLowerCase() === address.toLowerCase())
        }
        // Mark data as fetched
        dataFetched.current = true
      } catch (error) {
        console.error("Error checking controller status:", error)
      }
    }

    // Check immediately
    checkController()

    // Set up interval to check every 5 seconds
    intervalId = setInterval(checkController, 5000)

    return () => {
      isMounted = false
      if (intervalId) clearInterval(intervalId)
    }
  }, [isConnected, address, getCurrentController])

  // Simplified button handlers that just update UI without blockchain calls
  const handleRobotCommand = (command) => {
    if (!isCurrentController) {
      toast.error("You are not the controller")
      return
    }
    setLoading(true)

    // Simulate command processing
    setTimeout(() => {
      toast.success(`Command sent: ${command}`)
      setLastCommand(command)
      setLoading(false)
    }, 500)
  }

  return (
    <Card className="neo-card p-3 mt-4 mb-4 transition-all duration-300 hover:shadow-lg animate-fade-in relative">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-2/3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold">Control Panel</h3>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="h-14 w-14 rounded-full neo-button transition-all duration-200 transform hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              onClick={() => handleRobotCommand("up")}
              disabled={!isCurrentController || loading}
            >
              ↑
            </Button>
            <Button
              className="h-14 w-14 rounded-full neo-button transition-all duration-200 transform hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              onClick={() => handleRobotCommand("left")}
              disabled={!isCurrentController || loading}
            >
              ←
            </Button>
            <Button
              className="h-14 w-14 rounded-full neo-button transition-all duration-200 transform hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              onClick={() => handleRobotCommand("down")}
              disabled={!isCurrentController || loading}
            >
              ↓
            </Button>
            <Button
              className="h-14 w-14 rounded-full neo-button transition-all duration-200 transform hover:scale-110 hover:shadow-lg disabled:opacity-50 disabled:transform-none"
              onClick={() => handleRobotCommand("right")}
              disabled={!isCurrentController || loading}
            >
              →
            </Button>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border lg:pl-4 pt-4 lg:pt-0 mt-4 lg:mt-0">
          <div className="space-y-2">
            <div className="text-sm font-bold">Current Status</div>
            <div className="text-xs text-muted-foreground">
              Controller:{" "}
              <span className={isCurrentController ? "text-green-400" : "text-red-400"}>
                {isCurrentController ? "You" : "Not you"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Last command: <span className="font-mono">{lastCommand || "None"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when not controller */}
      {!isCurrentController && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <p className="text-sm font-semibold text-muted-foreground">You are not the controller</p>
            <p className="text-xs text-muted-foreground mt-2">Increase your stake to gain control</p>
          </div>
        </div>
      )}
    </Card>
  )
}
