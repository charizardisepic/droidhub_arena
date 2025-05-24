"use client"

import { Card } from "@/components/ui/card"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Users, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "react-router-dom"

interface RobotCameraFeedProps {
  robotId?: string
  robotName?: string
  viewerCount?: number
  chargeRate?: number
}

export const RobotCameraFeed = ({
  robotId = "robot-1",
  robotName = "London Explorer",
  viewerCount = 5,
  chargeRate = 2.5,
}: RobotCameraFeedProps) => {
  const { isConnected } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()

  const robots = [
    { id: "robot-1", name: "London Explorer" },
    { id: "robot-2", name: "New York Explorer" },
    { id: "robot-3", name: "Dubai" },
    { id: "robot-4", name: "Monster Truck #1" },
    { id: "robot-5", name: "Duck Feeder" },
    { id: "robot-6", name: "De Louvre GuideBot" },
  ]

  const handleRobotChange = (value) => {
    setSearchParams({ robot: value })
  }

  return (
    <Card className="neo-card p-3 mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <Select value={robotId} onValueChange={handleRobotChange}>
            <SelectTrigger className="w-[220px] border-none bg-transparent px-0 font-bold focus:ring-0">
              <SelectValue placeholder={robotName} />
            </SelectTrigger>
            <SelectContent>
              {robots.map((robot) => (
                <SelectItem key={robot.id} value={robot.id}>
                  {robot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isConnected && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-sky-400" />
              <span>{viewerCount} watching</span>
            </div>
            <div className="flex items-center gap-2 bg-sky-500/20 px-3 py-1 rounded-full">
              <Clock className="h-4 w-4 text-sky-400" />
              <span className="font-semibold text-sky-400">{chargeRate} AVAX/min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 soft-pulse"></div>
              <span className="text-xs text-green-400">LIVE</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative aspect-video bg-black/70 rounded-md overflow-hidden transition-transform duration-300 transform hover:scale-[1.01]">
        {isConnected ? (
          <>
            <div className="absolute inset-0 grid-pattern opacity-20"></div>
            <img
              src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e"
              alt="Robot camera feed"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 soft-pulse"></div>
              <span className="text-xs text-green-400">CONNECTED</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-md text-sm">
              <span className="text-white">{robotName}</span>
            </div>
            <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium soft-pulse">
              LIVE
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center space-y-4 max-w-md px-6">
              <div className="font-mono text-cyber-cyan">CAMERA FEED</div>
              <div className="text-2xl font-bold">Connect Wallet to Access Live Feed</div>
              <div className="text-muted-foreground mb-4">
                You need to connect your wallet to view the robot camera feed and control the robot
              </div>
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
