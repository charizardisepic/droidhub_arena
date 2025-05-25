"use client"

import { useState, useEffect, useRef } from "react"
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

  // Track if we've already reset the queue after gaining control
  const [queueResetOnGain, setQueueResetOnGain] = useState(false);
  // Track if this is the first render
  const [firstLoad, setFirstLoad] = useState(true);

  // Update handleRobotCommand to call the robot API
  const handleRobotCommand = async (command: 'up'|'down'|'left'|'right') => {
    switch (controlState) {
      case 'controller':
      case 'losing':
        setLoading(true);
        setLastCommand(command);
        try {
          const res = await fetch('https://droidbot-api.onrender.com/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: mapCommandToApi(command) })
          });
          if (res.ok) {
            toast.success(`Command sent: ${command}`);
          } else {
            toast.error('Failed to send command');
          }
        } catch (err) {
          toast.error('Error sending command');
        }
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        break;
      case 'gaining':
        toast.info(`Control change pending in ${secondsToNextMinute}s. Please wait.`);
        break;
      case 'notController':
      default:
        toast.error("You are not the controller");
        break;
    }
  };

  // Add a Reset Queue button
  const resetQueue = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/queue', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Queue reset!');
      } else {
        toast.error('Failed to reset queue');
      }
    } catch (err) {
      toast.error('Error resetting queue');
    }
  }

  // Effect: auto-reset queue ONCE when control is gained
  // Only trigger when controlState transitions to 'controller' from something else
  // and only if not already reset for this gain
  const prevControlState = useRef(controlState);
  useEffect(() => {
    if ((controlState === 'controller') && !queueResetOnGain) {
      resetQueue();
      setQueueResetOnGain(true);
    }
    if (controlState !== 'controller') {
      setQueueResetOnGain(false);
    }
    prevControlState.current = controlState;
  }, [controlState]);

  // Effect: skip 'gaining' on first load if user is already controller
  useEffect(() => {
    if (firstLoad && controlState === 'gaining') {
      // If the user is already the controller on first load, force to 'controller'
      // This requires a callback/prop from AppPage to forcibly set controlState
      // We'll call a prop: onForceControllerState?.()
      if (typeof window !== 'undefined') {
        // Use a custom event to notify AppPage to force controller state
        window.dispatchEvent(new CustomEvent('force-controller-state'));
      }
      setFirstLoad(false);
    } else if (firstLoad) {
      setFirstLoad(false);
    }
  }, [controlState, firstLoad]);

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

  // Buttons enabled only for controller and losing
  const buttonsEnabled = controlState === 'controller' || controlState === 'losing';

  // Keyboard-style arrow layout
  //   [   ↑   ]
  // [ ← ][ ↓ ][ → ]
  // Reset Queue button to the right of the arrows

  return (
    <Card className="neo-card p-4 relative">
      {showOverlay && overlayMessage && (
        <div
          className={`absolute top-0 right-0 bottom-0 w-1/2 z-10 flex flex-col items-center justify-center p-4 text-center rounded-l-md backdrop-blur-sm ${overlayBgClass}`}
        >
          <p className="text-lg font-bold text-white">{overlayMessage}</p>
        </div>
      )}
      <div className="flex items-start justify-start gap-4 mt-2">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <Button onClick={() => handleRobotCommand('up')} disabled={!buttonsEnabled || loading} className="w-14 h-14">↑</Button>
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={() => handleRobotCommand('left')} disabled={!buttonsEnabled || loading} className="w-14 h-14">←</Button>
            <Button onClick={() => handleRobotCommand('down')} disabled={!buttonsEnabled || loading} className="w-14 h-14">↓</Button>
            <Button onClick={() => handleRobotCommand('right')} disabled={!buttonsEnabled || loading} className="w-14 h-14">→</Button>
          </div>
        </div>
        <div className="flex flex-col justify-center ml-4 w-32">
          <div className="flex justify-center">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
              onClick={resetQueue}
              disabled={!buttonsEnabled || loading}
            >
              Reset Queue
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Add a helper to map UI command to API command
function mapCommandToApi(cmd: string) {
  switch (cmd) {
    case 'up': return 'F';
    case 'down': return 'B';
    case 'left': return 'L';
    case 'right': return 'R';
    default: return 'S';
  }
}
