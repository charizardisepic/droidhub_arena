"use client"

import type React from "react"

import { useState } from "react"
import { useWalletAccount } from "@/hooks/useWalletAccount"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/sonner"

interface ChatMessage {
  id: number
  address: string
  message: string
  timestamp: number
}

export const ChatSystem = () => {
  const { address, isConnected } = useWalletAccount()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, address: "0xd8da...6273", message: "Just increased my stake!", timestamp: Date.now() - 300000 },
    { id: 2, address: "0xab12...9f3d", message: "The bot is moving quite well today", timestamp: Date.now() - 120000 },
    {
      id: 3,
      address: "0x742a...e851",
      message: "Anyone else having connection issues?",
      timestamp: Date.now() - 60000,
    },
    {
      id: 4,
      address: "0x3f5e...9c2d",
      message: "I'm going to outbid the current controller soon!",
      timestamp: Date.now() - 45000,
    },
    {
      id: 5,
      address: "0x8b7f...4a1e",
      message: "This is so cool, controlling a robot with AVAX tokens!",
      timestamp: Date.now() - 30000,
    },
    {
      id: 6,
      address: "0x6c2d...9e4f",
      message: "The robot just completed my warehouse inspection task perfectly!",
      timestamp: Date.now() - 15000,
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    if (!isConnected) {
      toast("Please connect your wallet to chat")
      return
    }

    const message: ChatMessage = {
      id: messages.length + 1,
      address: address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "",
      message: newMessage,
      timestamp: Date.now(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <Card className="neo-card flex flex-col h-full">
      <div className="p-2 flex flex-col h-full">
        <h3 className="text-sm font-bold mb-1">Community Chat</h3>
        <ScrollArea className="flex-1 rounded-md border mb-1">
          <div className="p-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`py-1 px-1 ${msg.id % 2 === 0 ? "bg-background/60" : "bg-background/30"} 
                  rounded-md mb-1`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-mono text-orange-400">{msg.address}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <p className="text-xs">{msg.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-1">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your message..." : "Connect wallet to chat"}
            disabled={!isConnected}
            className="flex-1 h-7 text-xs"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !newMessage.trim()}
            className="neo-button h-7 text-xs"
            size="sm"
          >
            Send
          </Button>
        </div>
      </div>
    </Card>
  )
}
