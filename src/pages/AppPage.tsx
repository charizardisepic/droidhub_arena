"use client"

import { useAccount } from "wagmi"
import { useState, useEffect, useRef } from "react"
import { toast } from "@/components/ui/sonner"
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
  const { isConnected, address } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedRobot, setSelectedRobot] = useState(searchParams.get("robot") || "robot-1")
  const blockchainUtils = useBlockchainUtils()
  // Dynamic bot fee (AVAX per min)
  const [botFee, setBotFee] = useState<string>("0.0")

  // Fetch bot fee on mount
  useEffect(() => {
    ;(async () => {
      const fee = await blockchainUtils.getBotFee()
      setBotFee(fee)
    })()
  }, [blockchainUtils])

  // UTC countdown to next minute
  const [secondsToNextMinute, setSecondsToNextMinute] = useState(60 - new Date().getUTCSeconds())
  // Central popup event ('losing' or 'gaining' control)
  const [centralEvent, setCentralEvent] = useState<'losing' | 'gaining' | null>(null)
  // Separate popup for stake/unstake feedback
  const [stakePopup, setStakePopup] = useState<string | null>(null);

  // Auto-hide stake/unstake popup after 3 seconds
  useEffect(() => {
    if (stakePopup) {
      const timeout = setTimeout(() => {
        setStakePopup(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [stakePopup]);

  // Track if currently controller
  const [currentIsController, setCurrentIsController] = useState<boolean>(false)
  const [controlState, setControlState] = useState<'controller'|'notController'|'gaining'|'losing'>('notController')

  // Initialize controller state once on mount
  useEffect(() => {
    if (isConnected && address) {
      ;(async () => {
        const ctrl = await blockchainUtils.getCurrentController()
        setCurrentIsController(ctrl.toLowerCase() === address.toLowerCase())
      })()
    } else {
      setCurrentIsController(false)
    }
  }, [address, isConnected, blockchainUtils])

  const controllerRef = useRef(false);
  const lastControllerUpdateRef = useRef<number | null>(null);

  // Set ref only on mount/address change (not on every render or stake change)
  useEffect(() => {
    if (isConnected && address) {
      (async () => {
        const ctrl = await blockchainUtils.getCurrentController();
        const isCtrl = ctrl.toLowerCase() === address.toLowerCase();
        controllerRef.current = isCtrl;
        setCurrentIsController(isCtrl);
        lastControllerUpdateRef.current = Math.floor(Date.now() / 60000); // current UTC minute
        console.log('[INIT] Controller:', ctrl, 'IsController:', isCtrl, 'Address:', address, 'Minute:', lastControllerUpdateRef.current);
      })();
    } else {
      controllerRef.current = false;
      setCurrentIsController(false);
      lastControllerUpdateRef.current = null;
      console.log('[INIT] Not connected or no address');
    }
  }, [address, isConnected]);

  useEffect(() => {
    const tick = async () => {
      const secs = 60 - new Date().getUTCSeconds();
      setSecondsToNextMinute(secs);
      const now = new Date();
      if (!isConnected || !address) {
        setCentralEvent(null);
        setControlState('notController');
        console.log('[TICK] Not connected or no address', { now });
        return;
      }
      try {
        // Only update actual controller on minute rollover (and only once per minute)
        const nowMinute = Math.floor(Date.now() / 60000);
        if (lastControllerUpdateRef.current !== nowMinute && secs === 60) {
          const ctrl = await blockchainUtils.getCurrentController();
          const isCtrl = ctrl.toLowerCase() === address.toLowerCase();
          controllerRef.current = isCtrl;
          setCurrentIsController(isCtrl);
          lastControllerUpdateRef.current = nowMinute;
          const fee = await blockchainUtils.getBotFee();
          setBotFee(fee);
          console.log('[ROLLOVER]', { now, ctrl, isCtrl, address, nowMinute });
        }
        // Always get next top staker for prediction
        const top = await blockchainUtils.getHighestStaker();
        const nextIs = top.toLowerCase() === address.toLowerCase();

        // UI state logic (controllerRef.current = controller for this minute)
        let uiState = '';
        if (controllerRef.current && !nextIs) {
          setCentralEvent('losing');
          uiState = 'losing';
        } else if (!controllerRef.current && nextIs) {
          setCentralEvent('gaining');
          uiState = 'gaining';
        } else if (controllerRef.current && nextIs) {
          setCentralEvent(null); // controller
          uiState = 'controller';
        } else if (!controllerRef.current && !nextIs) {
          setCentralEvent(null); // notController
          uiState = 'notController';
        }
        setControlState(uiState as typeof controlState);
        console.log('[TICK]', {
          now,
          secs,
          controllerForMinute: controllerRef.current,
          nextIsController: nextIs,
          uiState,
          currentIsController,
          centralEvent,
          lastControllerUpdateRef: lastControllerUpdateRef.current,
        });
      } catch (error) {
        console.error('Error updating controller state:', error);
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [isConnected, address, blockchainUtils])

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
    { id: "robot-1", name: "London Explorer", chargeRate: 2.5 },
    { id: "robot-2", name: "New York Explorer", chargeRate: 1.8 },
    { id: "robot-3", name: "Dubai", chargeRate: 1.2 },
    { id: "robot-4", name: "Monster Truck #1", chargeRate: 1.5 },
    { id: "robot-5", name: "Duck Feeder", chargeRate: 0.9 },
    { id: "robot-6", name: "De Louvre GuideBot", chargeRate: 0.8 },
  ]
  const selectedRobotData = robots.find((r) => r.id === selectedRobot) || robots[0]

  // Dismiss stakePopup as soon as userBalance or topStake changes (stake/unstake reflected)
  // This effect must run in AppPage, so we need to pass userBalance and topStake up from StakeDashboard
  // We'll use a callback prop to lift state up
  const [userBalance, setUserBalanceApp] = useState<string>("0.0");
  const [topStake, setTopStakeApp] = useState<string>("0.0");

  useEffect(() => {
    if (stakePopup) {
      setStakePopup(null);
    }
    // eslint-disable-next-line
  }, [userBalance, topStake]);

  // Listen for the custom event from ControlPanel to force controller state on first load
  useEffect(() => {
    function handleForceControllerState() {
      setControlState('controller');
    }
    window.addEventListener('force-controller-state', handleForceControllerState);
    return () => {
      window.removeEventListener('force-controller-state', handleForceControllerState);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Remove central control-change popup, only keep stake/unstake feedback popup */}
      {stakePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-card p-4 rounded-lg shadow-lg backdrop-blur-sm">
            <p className="text-lg font-bold text-sky-400">{stakePopup}</p>
          </div>
        </div>
      )}
      <Navbar />
      <main className="flex-1 py-4 container px-4 animate-fade-in text-xl">
        {isConnected ? (
          <div className="grid grid-cols-12 gap-2">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-2 text-lg min-w-0">
              {/* Twitch stream embed */}
              <div className="w-full aspect-video">
                <iframe
                  src={`https://player.twitch.tv/?channel=londonexplorerdroid&parent=${window.location.hostname}&darkpopout`}
                  height="100%"
                  width="100%"
                  allowFullScreen
                  frameBorder="0"
                />
              </div>
              <ControlPanel
                controlState={controlState}
                secondsToNextMinute={secondsToNextMinute}
              />
              <div className="grid grid-cols-2 gap-2 min-w-0 overflow-x-hidden">
                <div className="col-span-1 min-w-0">
                  <RobotLocationMap robotId={selectedRobot} />
                </div>
                <div className="col-span-1 min-w-0">
                  <RobotStatus robotId={selectedRobot} />
                </div>
              </div>
            </div>

            {/* Right Column - Fixed layout to prevent overlapping */}
            <div className="col-span-12 lg:col-span-4 space-y-2 text-lg min-w-0">
              {/* Bot Info and UTC Countdown */}
              <div className="p-2 bg-card rounded-md mb-2 grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col items-start">
                  <h4 className="text-lg font-bold underline">{selectedRobotData.name}</h4>
                  <span className="text-sm text-sky-500">{botFee} AVAX/min</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs">Next minute in:</span>
                  <span className="text-xl font-bold">{secondsToNextMinute}s</span>
                </div>
              </div>
              {/* Twitch chat embed */}
              <div className="h-[419px]">
                <iframe
                  src={`https://www.twitch.tv/embed/londonexplorerdroid/chat?parent=${window.location.hostname}&darkpopout`}
                  height="100%"
                  width="100%"
                  sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
                  frameBorder="0"
                />
              </div>
              {/* Dashboard with fixed height */}
              <div className="h-[140px]">
                <StakeDashboard
                  onUserBalanceChange={setUserBalanceApp}
                  onTopStakeChange={setTopStakeApp}
                />
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
