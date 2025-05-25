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
  const handleRobotCommand = async (command: 'up'|'down'|'left'|'right'|'buzzer') => {
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
      // Map 'buzzer' to 'Z' for the API
      const apiCommand = mapCommandToApi(command);
      const res = await fetch('https://droidbot-api.onrender.com/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: apiCommand })
      });
      if (res.ok) {
        toast.success(`Added to queue: ${command === 'buzzer' ? 'Beep' : command}`);
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

  // Slider state for arrow input
  const [sliderValue, setSliderValue] = useState(0); // -1: left, 0: neutral, 1: right
  const sliderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sliderActiveRef = useRef(false);

  // Helper to map slider value to command
  function sliderToCommand(val: number): 'left' | 'right' | null {
    if (val === -1) return 'left';
    if (val === 1) return 'right';
    return null;
  }

  // Handle slider change (simulate arrow key down/up)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    if (val === 0) {
      // Slider released, clear queue
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
        sliderIntervalRef.current = null;
      }
      if (sliderActiveRef.current) {
        resetQueue();
        sliderActiveRef.current = false;
      }
    } else {
      // Slider moved to left/right, start sending command every 1s
      if (!sliderActiveRef.current) {
        sliderActiveRef.current = true;
        handleSliderCommand(val); // send immediately
        sliderIntervalRef.current = setInterval(() => {
          handleSliderCommand(val);
        }, 1000);
      }
    }
  };

  // Helper to send slider command
  const handleSliderCommand = (val: number) => {
    const cmd = sliderToCommand(val);
    if (cmd) {
      handleRobotCommand(cmd);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (sliderIntervalRef.current) clearInterval(sliderIntervalRef.current);
    };
  }, []);

  // Keyboard input mode state
  const [keyboardMode, setKeyboardMode] = useState(false);
  const keyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keyDownRef = useRef<string | null>(null);

  // Handle keyboard events for arrow keys
  useEffect(() => {
    if (!keyboardMode) return;
    function handleKeyDown(e: KeyboardEvent) {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (keyDownRef.current) return; // Only allow one key at a time
      let cmd: 'up'|'down'|'left'|'right'|null = null;
      if (e.key === 'ArrowUp') cmd = 'up';
      if (e.key === 'ArrowDown') cmd = 'down';
      if (e.key === 'ArrowLeft') cmd = 'left';
      if (e.key === 'ArrowRight') cmd = 'right';
      if (cmd) {
        keyDownRef.current = cmd;
        handleRobotCommand(cmd); // send immediately
        keyIntervalRef.current = setInterval(() => {
          handleRobotCommand(cmd!);
        }, 1000);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      let cmd: 'up'|'down'|'left'|'right'|null = null;
      if (e.key === 'ArrowUp') cmd = 'up';
      if (e.key === 'ArrowDown') cmd = 'down';
      if (e.key === 'ArrowLeft') cmd = 'left';
      if (e.key === 'ArrowRight') cmd = 'right';
      if (cmd && keyDownRef.current === cmd) {
        if (keyIntervalRef.current) clearInterval(keyIntervalRef.current);
        keyIntervalRef.current = null;
        keyDownRef.current = null;
        resetQueue();
      }
    }
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (keyIntervalRef.current) clearInterval(keyIntervalRef.current);
      keyDownRef.current = null;
    };
  }, [keyboardMode]);

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
        <div className="grid grid-rows-2 grid-cols-3 gap-2">
          {/* Top row: Beep (left), Up (center), empty (right) */}
          <Button
            onClick={() => handleRobotCommand('buzzer')}
            disabled={!buttonsEnabled}
            className="w-14 h-14 bg-orange-400 hover:bg-orange-500 text-black font-bold col-start-1 row-start-1"
            title="Beep/Buzzer"
          >
            🔔
          </Button>
          <Button
            onClick={() => handleRobotCommand('up')}
            disabled={!buttonsEnabled}
            className="w-14 h-14 col-start-2 row-start-1"
          >
            ↑
          </Button>
          <div className="col-start-3 row-start-1 w-14 h-14" />
          {/* Bottom row: Left, Down, Right */}
          <Button
            onClick={() => handleRobotCommand('left')}
            disabled={!buttonsEnabled}
            className="w-14 h-14 col-start-1 row-start-2"
          >
            ←
          </Button>
          <Button
            onClick={() => handleRobotCommand('down')}
            disabled={!buttonsEnabled}
            className="w-14 h-14 col-start-2 row-start-2"
          >
            ↓
          </Button>
          <Button
            onClick={() => handleRobotCommand('right')}
            disabled={!buttonsEnabled}
            className="w-14 h-14 col-start-3 row-start-2"
          >
            →
          </Button>
        </div>
        <div className="flex flex-col justify-center ml-4 w-32">
          <div className="flex flex-col items-center gap-2 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keyboardMode}
                onChange={e => setKeyboardMode(e.target.checked)}
                className="accent-sky-500"
              />
              <span className="text-xs font-medium">ArrowKey Input</span>
            </label>
          </div>
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
    case 'buzzer': return 'Z';
    default: return 'S';
  }
}
