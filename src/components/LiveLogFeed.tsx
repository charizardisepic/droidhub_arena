"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useBlockchainUtils } from "@/lib/blockchainUtils"
import { useAccount } from "wagmi"

interface LogEntry {
  time: string
  action: string
}

export const LiveLogFeed = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const blockchainUtils = useBlockchainUtils()
  const { isConnected } = useAccount()

  // Listen for blockchain events and update logs
  useEffect(() => {
    if (!isConnected) return

    // Initial log entry
    setLogs([{ time: formatTime(new Date()), action: "Connected to blockchain" }])

    // Simulate blockchain event logs at interval
    let intervalId: ReturnType<typeof setInterval>
    intervalId = setInterval(async () => {
      try {
        const controller = await blockchainUtils.getCurrentController()
        if (controller) {
          const shortAddress = `${controller.slice(0, 6)}...${controller.slice(-4)}`
          const eventTypes = [
            `${shortAddress} is now in control`,
            `Fee collected: 0.5 WND`,
            `Command sent: up`,
            `Command sent: down`,
            `Command sent: left`,
            `Command sent: right`,
            `Control verified`,
          ]
          const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
          setLogs((prev) => [{ time: formatTime(new Date()), action: randomEvent }, ...prev.slice(0, 19)])
        }
      } catch (error) {
        console.error("Error fetching live log event:", error)
      }
    }, 45000)

    return () => clearInterval(intervalId)
  }, [isConnected])

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toTimeString().split(" ")[0]
  }

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="w-full transition-all duration-300 ease-in-out mb-4"
    >
      <Card className={`neo-card overflow-hidden transition-all duration-300 ${isExpanded ? "h-auto" : "h-16"}`}>
        <div className={`p-2 ${isExpanded ? "" : "py-1"}`}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center cursor-pointer py-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold">Live Activity Log</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-400 hover:text-orange-500 hover:bg-orange-500/10 h-6 w-6 p-0"
              >
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-1">
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-1">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={`py-1 px-2 ${index % 2 === 0 ? "bg-background/60" : "bg-background/30"} 
                      rounded-md mb-1 flex justify-between items-center`}
                  >
                    <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                    <span className="text-xs">{log.action}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CollapsibleContent>
        </div>
      </Card>
    </Collapsible>
  )
}
