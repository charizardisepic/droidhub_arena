"use client"

import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { useState, useCallback } from "react"

// RPC endpoint and contract configuration
const RPC_URL = "wss://avalanche-c-chain-rpc.publicnode.com"
const CONTRACT_ADDRESS = "0xB3f57e8fc33f61Ce464a9c287f34EF3FD422B1ae"

// Full ABI based on the DroidHubContract
const ABI = [
  // Staking functions
  "function stakeTokens() payable",
  "function withdrawTokens(uint256 amount)",

  // Balance and stake functions
  "function stakedBalances(address) view returns (uint256)",
  "function getStakedBalance(address user) view returns (uint256)",
  "function getTotalStaked() view returns (uint256)",
  "function totalStaked() view returns (uint256)",

  // Controller functions
  "function currentController() view returns (address)",
  "function getHighestStaker() view returns (address)",
  "function isController(address user) view returns (bool)",
  "function lastControllerUpdate() view returns (uint256)",

  // Robot functions
  "function robots(string) view returns (string id, int256 locationLat, int256 locationLng, uint256 batteryLevel, uint256 uptime, uint256 lastUpdate, bool active)",
  "function getRobotLocation(string robotId) view returns (int256 lat, int256 lng)",
  "function getRobotBatteryLevel(string robotId) view returns (uint256)",
  "function getRobotUptime(string robotId) view returns (uint256)",
  "function getAllRobotIds() view returns (string[] memory)",
  "function sendCommand(string robotId, string command)",

  // Fee functions
  "function botFeePerMinute() view returns (uint256)",
  "function getBotFee() view returns (uint256)",
  "function lastFeeCollection() view returns (uint256)",
  "function getMinutesSinceLastCollection() view returns (uint256)",
  "function forceFeeCollection()",

  // Leaderboard functions
  "function stakers(uint256) view returns (address)",
  "function getStakingLeaderboard(uint256 count) view returns (address[] addresses, uint256[] amounts)",
  "function getTimeRemaining(address user) view returns (uint256)",
]

export const useBlockchainUtils = () => {
  const { address, isConnected } = useAccount()
  const [cachedLeaderboard, setCachedLeaderboard] = useState<any[]>([])

  // Helper to get signer for write operations
  const getSigner = () => {
    if (typeof window !== "undefined" && (window as any).ethereum && isConnected) {
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      return web3Provider.getSigner()
    }
    return null
  }

  // ========== STAKING OPERATIONS ==========

  const stakeTokens = async (amount: string) => {
    if (!isConnected) {
      console.error("Wallet not connected")
      return false
    }

    try {
      const signer = getSigner()
      if (!signer) throw new Error("No signer available")
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

      // Set explicit gas parameters
      const tx = await contract.stakeTokens({
        value: ethers.utils.parseEther(amount),
        gasLimit: 30000000,
        gasPrice: ethers.utils.parseUnits("1", "gwei"),
      })

      await tx.wait()
      console.log("Staking transaction:", tx.hash)
      return true
    } catch (error) {
      console.error("Error staking tokens:", error)
      return false
    }
  }

  const withdrawTokens = async (amount: string) => {
    if (!isConnected) {
      console.error("Wallet not connected")
      return false
    }

    try {
      const signer = getSigner()
      if (!signer) throw new Error("No signer available")
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

      // Set explicit gas parameters
      const tx = await contract.withdrawTokens(ethers.utils.parseEther(amount), {
        gasLimit: 30000000,
        gasPrice: ethers.utils.parseUnits("1", "gwei"),
      })

      await tx.wait()
      console.log("Withdrawal transaction:", tx.hash)
      return true
    } catch (error) {
      console.error("Error withdrawing tokens:", error)
      return false
    }
  }

  // ========== BALANCE AND CONTROL CHECKS ==========

  const getUserBalance = useCallback(async () => {
    if (!isConnected || !address) {
      return "0.0"
    }

    try {
      // Use the connected wallet's provider instead of JsonRpcProvider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      const balanceBN = await contract.getStakedBalance(address)
      return ethers.utils.formatEther(balanceBN)
    } catch (error) {
      console.error("Error getting user balance:", error)
      return "0.0"
    }
  }, [isConnected, address])

  // ========== LEADERBOARD ==========

  const getLeaderboard = async () => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      const [addresses, amounts] = await contract.getStakingLeaderboard(5)

      const leaderboard = await Promise.all(
        addresses.map(async (addr: string, i: number) => {
          if (addr === ethers.constants.AddressZero) {
            return null
          }

          const amount = ethers.utils.formatEther(amounts[i])
          const timeMinutes = Number(await contract.getTimeRemaining(addr))
          const hours = Math.floor(timeMinutes / 60)
          const mins = timeMinutes % 60

          // Format address for display
          const shortAddr = `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`

          return {
            address: shortAddr,
            stake: amount,
            timeRemaining: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
          }
        }),
      )

      // Filter out null entries (zero addresses)
      const filteredLeaderboard = leaderboard.filter((entry) => entry !== null)
      setCachedLeaderboard(filteredLeaderboard)
      return filteredLeaderboard
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      return cachedLeaderboard
    }
  }

  // ========== TOP STAKER & BALANCE ==========

  const getHighestStaker = useCallback(async () => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      return await contract.getHighestStaker()
    } catch (error) {
      console.error("Error getting highest staker:", error)
      return ethers.constants.AddressZero
    }
  }, [])

  const getStakedBalance = useCallback(async (userAddress: string) => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      const balanceBN = await contract.getStakedBalance(userAddress)
      return ethers.utils.formatEther(balanceBN)
    } catch (error) {
      console.error("Error getting staked balance:", error)
      return "0.0"
    }
  }, [])

  // ========== CONTROLLER & COMMAND ==========

  const getCurrentController = useCallback(async () => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      return await contract.currentController()
    } catch (error) {
      console.error("Error fetching current controller:", error)
      return ethers.constants.AddressZero
    }
  }, [])

  const sendRobotCommand = async (robotId: string, command: string) => {
    if (!isConnected) {
      console.error("Wallet not connected for command")
      return false
    }
    try {
      const signer = getSigner()
      if (!signer) throw new Error("No signer for sendCommand")
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

      // Set explicit gas parameters
      const tx = await contract.sendCommand(robotId, command, {
        gasLimit: 30000000,
        gasPrice: ethers.utils.parseUnits("1", "gwei"),
      })

      await tx.wait()
      console.log("Command sent:", command)
      return true
    } catch (error) {
      console.error("Error sending robot command:", error)
      return false
    }
  }

  // ========== ROBOT STATUS ==========

  const getRobotBatteryLevel = useCallback(async (robotId: string) => {
    // Return placeholder data instead of calling the contract
    return Math.floor(Math.random() * 30) + 70 // Random between 70-100
  }, [])

  const getRobotUptime = useCallback(async (robotId: string) => {
    // Return placeholder data instead of calling the contract
    return new Date().toISOString()
  }, [])

  const getRobotLocation = useCallback(async (robotId: string) => {
    // Return placeholder data instead of calling the contract
    return { lat: Math.floor(Math.random() * 100), lng: Math.floor(Math.random() * 100) }
  }, [])

  const getAllRobotIds = async () => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      return await contract.getAllRobotIds()
    } catch (error) {
      console.error("Error getting all robot IDs:", error)
      return []
    }
  }

  // ========== FEE OPERATIONS ==========

  const getBotFee = useCallback(async () => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      const fee = await contract.getBotFee()
      return ethers.utils.formatEther(fee)
    } catch (error) {
      console.error("Error getting bot fee:", error)
      return "0.5"
    }
  }, [])

  const getMinutesSinceLastCollection = async () => {
    try {
      // Use the connected wallet's provider
      const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, web3Provider)

      const minutes = await contract.getMinutesSinceLastCollection()
      return minutes.toNumber()
    } catch (error) {
      console.error("Error getting minutes since last collection:", error)
      return 0
    }
  }

  const forceFeeCollection = async () => {
    if (!isConnected) {
      return false
    }
    try {
      const signer = getSigner()
      if (!signer) throw new Error("No signer available")
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

      // Set explicit gas parameters
      const tx = await contract.forceFeeCollection({
        gasLimit: 30000000,
        gasPrice: ethers.utils.parseUnits("1", "gwei"),
      })

      await tx.wait()
      return true
    } catch (error) {
      console.error("Error forcing fee collection:", error)
      return false
    }
  }

  // Add a function to calculate time remaining based on stake difference
  const calculateTimeRemaining = (topStake: string, secondStake: string, ratePerMinute = 2.5) => {
    const topStakeValue = Number.parseFloat(topStake)
    const secondStakeValue = Number.parseFloat(secondStake)

    if (isNaN(topStakeValue) || isNaN(secondStakeValue) || topStakeValue <= secondStakeValue) {
      return { minutes: 0, seconds: 0 }
    }

    // Calculate the difference and divide by rate per minute
    const stakeDifference = topStakeValue - secondStakeValue
    const totalMinutes = stakeDifference / ratePerMinute

    // Convert to minutes and seconds
    const minutes = Math.floor(totalMinutes)
    const seconds = Math.floor((totalMinutes - minutes) * 60)

    return { minutes, seconds }
  }

  // ========== RETURN ALL FUNCTIONS ==========

  return {
    stakeTokens,
    withdrawTokens,
    getUserBalance,
    getLeaderboard,
    getHighestStaker,
    getStakedBalance,
    getCurrentController,
    sendRobotCommand,
    getRobotBatteryLevel,
    getRobotUptime,
    getRobotLocation,
    getAllRobotIds,
    getBotFee,
    getMinutesSinceLastCollection,
    forceFeeCollection,
    calculateTimeRemaining,
  }
}

export default useBlockchainUtils
