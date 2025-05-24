"use client"

import { useAccount } from "wagmi"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ControlPanel } from "@/components/ControlPanel"
import { StakeDashboard } from "@/components/StakeDashboard"
import { LiveLogFeed } from "@/components/LiveLogFeed"
import { RobotStatus } from "@/components/RobotStatus"
import { ChatSystem } from "@/components/ChatSystem"
import { StakingLeaderboard } from "@/components/StakingLeaderboard"
import { RobotLocationMap } from "@/components/RobotLocationMap"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useBlockchainUtils } from "@/lib/blockchainUtils"

const AppPage = () => {
  const { isConnected } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedRobot, setSelectedRobot] = useState(searchParams.get("robot") || "robot-1")
  const blockchainUtils = useBlockchainUtils()

  useEffect(() => {
    // Update URL when robot changes
    if (searchParams.get("robot") !== selectedRobot) {
      setSelectedRobot(searchParams.get("robot") || "robot-1")
    }
  }, [searchParams, selectedRobot])

  useEffect(() => {
    // When selectedRobot changes, update the URL
    setSearchParams({ robot: selectedRobot })
  }, [selectedRobot, setSearchParams])

  const robots = [
    { id: "robot-1", name: "Warehouse Bot Alpha", chargeRate: 2.5 },
    { id: "robot-2", name: "Garden Maintenance Bot", chargeRate: 1.8 },
    { id: "robot-3", name: "Security Patrol Bot", chargeRate: 1.2 },
    { id: "robot-4", name: "Delivery Bot", chargeRate: 1.5 },
    { id: "robot-5", name: "Assembly Line Bot", chargeRate: 0.9 },
    { id: "robot-6", name: "Cleaning Bot", chargeRate: 0.8 },
  ]

  const selectedRobotData = robots.find((r) => r.id === selectedRobot) || robots[0]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-4 container px-4 animate-fade-in">
        {isConnected ? (
          <div className="grid grid-cols-12 gap-2">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-2">
              {/* Twitch stream embed */}
              <div className="w-full aspect-video">
                <iframe
                  src={`https://player.twitch.tv/?channel=bonusducks777&parent=${window.location.hostname}`}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
              <ControlPanel />
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-1">
                  <RobotLocationMap robotId={selectedRobot} />
                </div>
                <div className="col-span-1">
                  <RobotStatus robotId={selectedRobot} />
                </div>
              </div>
            </div>

            {/* Right Column - Fixed layout to prevent overlapping */}
            <div className="col-span-12 lg:col-span-4 space-y-2">
              {/* Fixed height for ChatSystem - 15% taller */}
              <div className="h-[419px]">
                {/* Twitch chat embed */}
                <iframe
                  src={`https://www.twitch.tv/embed/bonusducks777/chat?parent=${window.location.hostname}&darkpopout`}
                  height="100%"
                  width="100%"
                  sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
                  frameBorder="0"
                />
              </div>
              {/* Dashboard with fixed height */}
              <div className="h-[140px]">
                <StakeDashboard />
              </div>
              {/* Add fixed height to prevent overflow */}
              <div className="h-[200px]">
                <StakingLeaderboard robotId={selectedRobot} />
              </div>
            </div>

            {/* Full Width Bottom Panel */}
            <div className="col-span-12 mt-2">
              <LiveLogFeed />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-card rounded-lg border border-border shadow-lg animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-center max-w-md mb-6">
              Please connect your wallet to view the robot feed and control panel.
            </p>
            <div className="z-50 relative">
              <ConnectButton />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default AppPage
