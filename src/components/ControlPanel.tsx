"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/sonner"

interface ControlPanelProps {
  controlState: 'controller' | 'notController' | 'gaining' | 'losing'
  secondsToNextMinute: number
  onlyStatusOverlay?: boolean // If true, render only the status overlay
}

export const ControlPanel = ({ controlState, secondsToNextMinute, onlyStatusOverlay }: ControlPanelProps) => {
  const [lastCommand, setLastCommand] = useState("");

  // Track if we've already reset the queue after gaining control
  const [queueResetOnGain, setQueueResetOnGain] = useState(false);
  // Track if this is the first render
  const [firstLoad, setFirstLoad] = useState(true);

  // Update handleRobotCommand to call the robot API
  const handleRobotCommand = async (command: 'up'|'down'|'left'|'right') => {
    if (!(controlState === 'controller' || controlState === 'losing')) {
      if (controlState === 'gaining') {
        toast.info(`Control change pending in ${secondsToNextMinute}s. Please wait.`);
      } else {
        toast.error("You are not the controller");
      }
      return;
    }
    setLastCommand(command);
    try {
      // Add to queue endpoint (not just /api/command)
      const res = await fetch('https://droidbot-api.onrender.com/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: mapCommandToApi(command) })
      });
      if (res.ok) {
        toast.success(`Added to queue: ${command}`);
        fetchQueue(); // Refresh queue display
      } else {
        toast.error('Failed to add command to queue');
      }
    } catch (err) {
      toast.error('Error sending command');
    }
    // No loading state, so button can be pressed rapidly
  };

  // Add a Reset Queue button and queue preview
  const [queue, setQueue] = useState<string[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);

  // Fetch the current queue from the API
  const fetchQueue = async () => {
    setQueueLoading(true);
    try {
      const res = await fetch('https://droidbot-api.onrender.com/api/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
      } else {
        setQueue([]);
      }
    } catch (err) {
      setQueue([]);
    }
    setQueueLoading(false);
  };

  // Call fetchQueue on mount and every 2 seconds
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  const resetQueue = async () => {
    try {
      const res = await fetch('https://droidbot-api.onrender.com/api/queue', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Queue reset!');
        fetchQueue();
        const status = document.getElementById('status');
        if (status) {
          status.innerHTML = `<p style="color: blue;">Queue cleared</p>`;
        }
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

  // Detect if we're in mobile mode by checking for onlyStatusOverlay prop in the parent
  // If onlyStatusOverlay is undefined, check if window width is < 768 (for SSR safety, default to false)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Only show overlay if not in mobile main panel (i.e., onlyStatusOverlay is false/null and not mobile)
  const showOverlayInPanel = !onlyStatusOverlay && !isMobile;

  return (
    <Card className="neo-card p-4 relative">
      {showOverlayInPanel && showOverlay && overlayMessage && (
        <div
          className={`absolute top-0 right-0 bottom-0 w-1/2 z-10 flex flex-col items-center justify-center p-4 text-center rounded-l-md backdrop-blur-sm ${overlayBgClass}`}
        >
          <p className="text-lg font-bold text-white">{overlayMessage}</p>
        </div>
      )}
      <div className="flex items-start justify-start gap-4 mt-2">
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-2">
            <Button onClick={() => handleRobotCommand('up')} disabled={!buttonsEnabled} className="w-14 h-14">↑</Button>
          </div>
          <div className="flex justify-center gap-2">
            <Button onClick={() => handleRobotCommand('left')} disabled={!buttonsEnabled} className="w-14 h-14">←</Button>
            <Button onClick={() => handleRobotCommand('down')} disabled={!buttonsEnabled} className="w-14 h-14">↓</Button>
            <Button onClick={() => handleRobotCommand('right')} disabled={!buttonsEnabled} className="w-14 h-14">→</Button>
          </div>
        </div>
        <div className="flex flex-col justify-center ml-4 w-32">
          <div className="flex justify-center">
            <Button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
              onClick={resetQueue}
              disabled={!buttonsEnabled}
            >
              Reset Queue
            </Button>
          </div>
          <div className="mt-4 text-xs text-center bg-gray-100 dark:bg-gray-800 rounded p-2 min-h-[40px]">
            <div className="font-bold mb-1">Command Queue:</div>
            {queueLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : queue.length === 0 ? (
              <span className="text-gray-400">Empty</span>
            ) : (
              <span>{queue.join(' → ')}</span>
            )}
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
