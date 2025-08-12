import { useAccount } from "wagmi"
import { useArena } from "@/components/ArenaProvider"
import { checkArenaEnvironment } from "@/lib/arenaConfig"

/**
 * Universal hook that provides wallet account information
 * Focuses on Arena SDK with Wagmi fallback
 */
export const useWalletAccount = () => {
  const isArenaEnvironment = checkArenaEnvironment()
  
  if (isArenaEnvironment) {
    // Use Arena SDK
    const arena = useArena()
    return {
      address: arena.walletAddress as `0x${string}` | undefined,
      isConnected: arena.isConnected,
      isConnecting: arena.isLoading,
      isDisconnected: !arena.isConnected,
      status: arena.isConnected ? 'connected' : 'disconnected' as const,
      isArenaEnvironment: true,
      // Arena-specific data
      arenaUser: arena.userProfile,
      arenaLoading: arena.isLoading,
      arenaError: arena.error,
      arenaBalance: arena.balance,
      arenaSdk: arena.sdk,
      // Arena methods
      connect: arena.connect,
      disconnect: arena.disconnect,
      sendTransaction: arena.sendTransaction,
    }
  } else {
    // Fallback to Wagmi for standard environment
    const wagmi = useAccount()
    return {
      address: wagmi.address,
      isConnected: wagmi.isConnected,
      isConnecting: wagmi.isConnecting,
      isDisconnected: wagmi.isDisconnected,
      status: wagmi.status,
      isArenaEnvironment: false,
      // Arena fields will be undefined in non-Arena environment
      arenaUser: undefined,
      arenaLoading: false,
      arenaError: undefined,
      arenaBalance: undefined,
      arenaSdk: undefined,
      // No Arena methods available
      connect: undefined,
      disconnect: undefined,
      sendTransaction: undefined,
    }
  }
}
