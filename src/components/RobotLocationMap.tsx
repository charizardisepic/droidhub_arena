"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import { useBlockchainUtils } from "@/lib/blockchainUtils"

interface RobotLocationMapProps {
  robotId: string
}

export function RobotLocationMap({ robotId = "robot-1" }: RobotLocationMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [location, setLocation] = useState("Loading...")
  const [coordinates, setCoordinates] = useState({ x: 50, y: 50 })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getRobotLocation } = useBlockchainUtils()

  // Map coordinates to location names (simplified for demo)
  const getLocationName = (lat: number, lng: number) => {
    if (lat < 30 && lng < 30) return "Storage Area"
    if (lat < 30 && lng >= 30) return "Assembly Line"
    if (lat >= 30 && lng < 30) return "Shipping Dock"
    return "Warehouse Floor"
  }

  useEffect(() => {
    let isMounted = true

    const fetchLocation = async () => {
      if (isLoading) return

      try {
        setIsLoading(true)
        setError(null)

        const robotLocation = await getRobotLocation(robotId)

        if (isMounted) {
          // Scale coordinates to 0-100 range for display
          const scaledLat = Math.abs(robotLocation.lat) % 100
          const scaledLng = Math.abs(robotLocation.lng) % 100

          setCoordinates({
            x: scaledLat,
            y: scaledLng,
          })

          setLocation(getLocationName(scaledLat, scaledLng))
        }
      } catch (error) {
        console.error("Error fetching location:", error)
        if (isMounted) {
          setError("Failed to fetch robot location from blockchain")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchLocation()

    // Set up interval to fetch data periodically (every 30 seconds)
    const interval = setInterval(fetchLocation, 30000)

    // Cleanup function
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [robotId]) // Fixed: Added getRobotLocation to dependency array but wrapped in useCallback in blockchainUtils

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 0.5

    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw robot position
    const robotX = (coordinates.x / 100) * canvas.width
    const robotY = (coordinates.y / 100) * canvas.height

    // Draw pulsing circle
    ctx.beginPath()
    ctx.arc(robotX, robotY, 10, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(249, 115, 22, 0.3)"
    ctx.fill()

    // Draw robot marker
    ctx.beginPath()
    ctx.arc(robotX, robotY, 5, 0, Math.PI * 2)
    ctx.fillStyle = "#f97316"
    ctx.fill()
  }, [coordinates])

  return (
    <Card className="neo-card h-full">
      <div className="p-2">
        <h3 className="text-sm font-bold mb-1">Robot Location</h3>
        {error && <div className="text-xs text-red-500 mb-1">{error}</div>}

        <div className="text-xs text-muted-foreground">
          Current Location: <span className="font-medium">{location}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          Coordinates:{" "}
          <span className="font-medium">
            X: {coordinates.x.toFixed(2)}, Y: {coordinates.y.toFixed(2)}
          </span>
        </div>
        <div className="relative border rounded-md overflow-hidden aspect-video h-[240px]">
          <canvas ref={canvasRef} width={300} height={150} className="w-full h-full" />
        </div>
      </div>
    </Card>
  )
}
