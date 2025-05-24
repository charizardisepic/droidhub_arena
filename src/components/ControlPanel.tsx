"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"

interface ControlPanelProps {
  controlState: 'controller' | 'notController' | 'gaining' | 'losing'
  secondsToNextMinute: number
}

export const ControlPanel = ({ controlState, secondsToNextMinute }: ControlPanelProps) => {
  const [loading, setLoading] = useState(false);
  const [lastCommand, setLastCommand] = useState("");

  const handleRobotCommand = (command) => {
    if (controlState === 'losing' || controlState === 'gaining') {
      toast.info(`Control change pending in ${secondsToNextMinute}s. Please wait.`);
      return;
    }
    if (!(controlState === 'controller' || controlState === 'losing')) {
      toast.error("You are not the controller");
      return;
    }
    setLoading(true);
    setLastCommand(command);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Command executed: ${command}`);
    }, 1000);
  };

  let overlayMessage = "";
  let overlayBgClass = "";
  const showOverlay = true;

  switch (controlState) {
    case 'controller':
      overlayMessage = 'You are the controller.';
      overlayBgClass = 'bg-green-500/30';
      break;
    case 'notController':
      overlayMessage = 'You are not the controller.';
      overlayBgClass = 'bg-gray-600/70';
      break;
    case 'gaining':
      overlayMessage = `Gaining control in ${secondsToNextMinute}s`;
      overlayBgClass = 'bg-green-500/70';
      break;
    case 'losing':
      overlayMessage = `Losing control in ${secondsToNextMinute}s`;
      overlayBgClass = 'bg-red-500/70';
      break;
  }

  return (
    <Card className="neo-card p-4 relative">
      {showOverlay && overlayMessage && (
        <div
          className={`absolute top-0 right-0 bottom-0 w-1/2 z-10 flex flex-col items-center justify-center p-4 text-center rounded-l-md backdrop-blur-sm ${overlayBgClass}`}
        >
          <p className="text-lg font-bold text-white">{overlayMessage}</p>
        </div>
      )}

      <div className="flex">
        <div className="w-1/2 flex flex-wrap justify-center gap-4">
          <Button onClick={() => handleRobotCommand('up')} disabled={(controlState==='notController'||controlState==='gaining')||loading}>↑</Button>
          <Button onClick={() => handleRobotCommand('left')} disabled={(controlState==='notController'||controlState==='gaining')||loading}>←</Button>
          <Button onClick={() => handleRobotCommand('down')} disabled={(controlState==='notController'||controlState==='gaining')||loading}>↓</Button>
          <Button onClick={() => handleRobotCommand('right')} disabled={(controlState==='notController'||controlState==='gaining')||loading}>→</Button>
        </div>
      </div>
    </Card>
  )
}
