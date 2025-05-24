"use client"

import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { useState, useCallback } from "react"

// RPC endpoints for Avalanche networks
const RPC_URL_MAINNET = "https://avalanche-c-chain-rpc.publicnode.com"
const RPC_URL_TESTNET = "https://api.avax-test.network/ext/bc/C/rpc"
// Contract addresses for Avalanche networks
const MAINNET_CONTRACT_ADDRESS = "0xB3f57e8fc33f61Ce464a9c287f34EF3FD422B1ae" // Deployed DroidHub mainnet contract
const TESTNET_CONTRACT_ADDRESS = "0xfd275143fAbFAb2c4bE8f0d51266e8896B276b3b"

// Helper to get the correct contract based on current chain
const getContract = (signerOrProvider: any) => {
  // Always detect chainId from MetaMask to select correct contract address
  const chainIdHex = (window as any).ethereum?.chainId
  const chainId = chainIdHex ? parseInt(chainIdHex, 16) : 43114
  const contractAddress =
    chainId === 43113 && ethers.utils.isAddress(TESTNET_CONTRACT_ADDRESS)
      ? TESTNET_CONTRACT_ADDRESS
      : MAINNET_CONTRACT_ADDRESS
  return new ethers.Contract(contractAddress, ABI, signerOrProvider)
}
// Helper to get JSON RPC provider based on current chain
const getReadProvider = () => {
  const chainIdHex = (window as any).ethereum?.chainId
  const chainId = chainIdHex ? parseInt(chainIdHex, 16) : 43114
  const url = chainId === 43113 ? RPC_URL_TESTNET : RPC_URL_MAINNET
  return new ethers.providers.JsonRpcProvider(url)
}

// Full ABI based on the DroidHubContract
const ABI = [
  // Contract ABI for DroidHub on Avalanche
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" } ],"name": "addRobot","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [],"name": "collectFees","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [ { "internalType": "uint256","name": "_initialFeePerMinute","type": "uint256" } ],"stateMutability": "nonpayable","type": "constructor" },
  { "inputs": [ { "internalType": "address","name": "owner","type": "address" } ],"name": "OwnableInvalidOwner","type": "error" },
  { "inputs": [ { "internalType": "address","name": "account","type": "address" } ],"name": "OwnableUnauthorizedAccount","type": "error" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "controller","type": "address" },{ "indexed": false,"internalType": "string","name": "robotId","type": "string" },{ "indexed": false,"internalType": "string","name": "command","type": "string" } ],"name": "CommandSent","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "oldController","type": "address" },{ "indexed": true,"internalType": "address","name": "newController","type": "address" } ],"name": "ControllerChanged","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": false,"internalType": "bool","name": "stopped","type": "bool" } ],"name": "EmergencyStatusChanged","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "controller","type": "address" },{ "indexed": false,"internalType": "uint256","name": "amount","type": "uint256" },{ "indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256" } ],"name": "FeeCollected","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": false,"internalType": "uint256","name": "oldFee","type": "uint256" },{ "indexed": false,"internalType": "uint256","name": "newFee","type": "uint256" } ],"name": "FeeUpdated","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "owner","type": "address" },{ "indexed": false,"internalType": "uint256","name": "amount","type": "uint256" } ],"name": "FeesWithdrawn","type": "event" },
  { "inputs": [],"name": "forceFeeCollection","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "previousOwner","type": "address" },{ "indexed": true,"internalType": "address","name": "newOwner","type": "address" } ],"name": "OwnershipTransferred","type": "event" },
  { "inputs": [],"name": "renounceOwnership","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "anonymous": false,"inputs": [ { "indexed": false,"internalType": "string","name": "robotId","type": "string" } ],"name": "RobotAdded","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": false,"internalType": "string","name": "robotId","type": "string" },{ "indexed": false,"internalType": "int256","name": "lat","type": "int256" },{ "indexed": false,"internalType": "int256","name": "lng","type": "int256" } ],"name": "RobotLocationUpdated","type": "event" },
  { "anonymous": false,"inputs": [ { "indexed": false,"internalType": "string","name": "robotId","type": "string" },{ "indexed": false,"internalType": "uint256","name": "batteryLevel","type": "uint256" },{ "indexed": false,"internalType": "uint256","name": "uptime","type": "uint256" } ],"name": "RobotStatusUpdated","type": "event" },
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" } ],"name": "sendCommand","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [ { "internalType": "uint256","name": "newFee","type": "uint256" } ],"name": "setBotFee","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [ { "internalType": "bool","name": "stopped","type": "bool" } ],"name": "setEmergencyStop","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "user","type": "address" },{ "indexed": false,"internalType": "uint256","name": "amount","type": "uint256" } ],"name": "StakeAdded","type": "event" },
  { "inputs": [],"name": "stakeTokens","outputs": [],"stateMutability": "payable","type": "function" },
  { "anonymous": false,"inputs": [ { "indexed": true,"internalType": "address","name": "user","type": "address" },{ "indexed": false,"internalType": "uint256","name": "amount","type": "uint256" } ],"name": "StakeWithdrawn","type": "event" },
  { "inputs": [ { "internalType": "address","name": "newOwner","type": "address" } ],"name": "transferOwnership","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "stateMutability": "receive","type": "receive" },
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" },{ "internalType": "int256","name": "lat","type": "int256" },{ "internalType": "int256","name": "lng","type": "int256" } ],"name": "updateRobotLocation","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" },{ "internalType": "uint256","name": "batteryLevel","type": "uint256" },{ "internalType": "uint256","name": "uptime","type": "uint256" },{ "internalType": "bool","name": "active","type": "bool" } ],"name": "updateRobotStatus","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [],"name": "withdrawFees","outputs": [],"stateMutability": "nonpayable","type": "function" },
  { "inputs": [ { "internalType": "uint256","name": "amount","type": "uint256" } ],"name": "withdrawTokens","outputs": [],"stateMutability": "nonpayable","type": "function" },
  // View functions
  { "inputs": [],"name": "accumulatedFees","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "botFeePerMinute","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "currentController","outputs": [ { "internalType": "address","name": "","type": "address" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "emergencyStop","outputs": [ { "internalType": "bool","name": "","type": "bool" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "getAllRobotIds","outputs": [ { "internalType": "string[]","name": "","type": "string[]" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "getBotFee","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "getHighestStaker","outputs": [ { "internalType": "address","name": "","type": "address" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "getMinutesSinceLastCollection","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" } ],"name": "getRobotBatteryLevel","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" } ],"name": "getRobotLocation","outputs": [ { "internalType": "int256","name": "lat","type": "int256" },{ "internalType": "int256","name": "lng","type": "int256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "string","name": "robotId","type": "string" } ],"name": "getRobotUptime","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "address","name": "user","type": "address" } ],"name": "getStakedBalance","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "uint256","name": "count","type": "uint256" } ],"name": "getStakingLeaderboard","outputs": [ { "internalType": "address[]","name": "addresses","type": "address[]" },{ "internalType": "uint256[]","name": "amounts","type": "uint256[]" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "address","name": "user","type": "address" } ],"name": "getTimeRemaining","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "getTotalStaked","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "address","name": "user","type": "address" } ],"name": "isController","outputs": [ { "internalType": "bool","name": "","type": "bool" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "lastControllerUpdate","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "lastFeeCollection","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "owner","outputs": [ { "internalType": "address","name": "","type": "address" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"name": "robotIds","outputs": [ { "internalType": "string","name": "","type": "string" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "string","name": "","type": "string" } ],"name": "robots","outputs": [ { "internalType": "string","name": "id","type": "string" },{ "internalType": "int256","name": "locationLat","type": "int256" },{ "internalType": "int256","name": "locationLng","type": "int256" },{ "internalType": "uint256","name": "batteryLevel","type": "uint256" },{ "internalType": "uint256","name": "uptime","type": "uint256" },{ "internalType": "uint256","name": "lastUpdate","type": "uint256" },{ "internalType": "bool","name": "active","type": "bool" }],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "address","name": "","type": "address" } ],"name": "stakedBalances","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" },
  { "inputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"name": "stakers","outputs": [ { "internalType": "address","name": "","type": "address" } ],"stateMutability": "view","type": "function" },
  { "inputs": [],"name": "totalStaked","outputs": [ { "internalType": "uint256","name": "","type": "uint256" } ],"stateMutability": "view","type": "function" }
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
      const contract = getContract(signer)

      // Set explicit gas parameters
      const tx = await contract.stakeTokens({
        value: ethers.utils.parseEther(amount),
        gasLimit: 300000,
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
      const contract = getContract(signer)

      // Set explicit gas parameters
      const tx = await contract.withdrawTokens(ethers.utils.parseEther(amount), {
        gasLimit: 300000,
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
      const provider = getReadProvider()
      const contract = getContract(provider)

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
      const provider = getReadProvider()
      const contract = getContract(provider)

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
      const provider = getReadProvider()
      const contract = getContract(provider)

      return await contract.getHighestStaker()
    } catch (error) {
      console.error("Error getting highest staker:", error)
      return ethers.constants.AddressZero
    }
  }, [])

  const getStakedBalance = useCallback(async (userAddress: string) => {
    try {
      const provider = getReadProvider()
      const contract = getContract(provider)

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
      const provider = getReadProvider()
      const contract = getContract(provider)

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
      const contract = getContract(signer)

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
      const provider = getReadProvider()
      const contract = getContract(provider)

      return await contract.getAllRobotIds()
    } catch (error) {
      console.error("Error getting all robot IDs:", error)
      return []
    }
  }

  // ========== FEE OPERATIONS ==========

  const getBotFee = useCallback(async () => {
    try {
      const provider = getReadProvider()
      const contract = getContract(provider)

      const fee = await contract.getBotFee()
      return ethers.utils.formatEther(fee)
    } catch (error) {
      console.error("Error getting bot fee:", error)
      return "0.5"
    }
  }, [])

  const getMinutesSinceLastCollection = async () => {
    try {
      const provider = getReadProvider()
      const contract = getContract(provider)

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
      const contract = getContract(signer)

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

  // Add network detection helper
  const getNetwork = () => {
    const chainIdHex = (window as any).ethereum?.chainId
    const chainId = chainIdHex ? parseInt(chainIdHex, 16) : 43114
    return chainId === 43113 ? 'TestNet' : 'MainNet'
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
    getNetwork, // dynamic network label
  }
}

export default useBlockchainUtils
