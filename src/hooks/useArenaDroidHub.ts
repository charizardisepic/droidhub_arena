import { useArena } from '@/components/ArenaProvider';
import { useCallback, useEffect, useState } from 'react';
import * as ethers from 'ethers';

// Contract addresses for Avalanche networks
const MAINNET_CONTRACT_ADDRESS = "0xB3f57e8fc33f61Ce464a9c287f34EF3FD422B1ae";
const TESTNET_CONTRACT_ADDRESS = "0xfd275143fAbFAb2c4bE8f0d51266e8896B276b3b";

// DroidHub contract ABI (abbreviated for key functions)
const DROIDHUB_ABI = [
  "function addRobot(string memory robotId) external",
  "function sendCommand(string memory robotId, string memory command) external payable",
  "function getFeePerMinute() external view returns (uint256)",
  "function getAccumulatedFees(address controller) external view returns (uint256)",
  "function collectFees() external",
  "function stake() external payable",
  "function unstake(uint256 amount) external",
  "function getStakeAmount(address staker) external view returns (uint256)",
  "function getCurrentController() external view returns (address)",
  "function getRobots() external view returns (string[] memory)",
  "event CommandSent(address indexed controller, string robotId, string command)",
  "event FeeCollected(address indexed controller, uint256 amount, uint256 timestamp)",
];

export interface RobotCommand {
  robotId: string;
  command: string;
  fee: string;
}

export interface StakeInfo {
  amount: string;
  isController: boolean;
}

export const useArenaDroidHub = () => {
  const { 
    sdk, 
    isConnected, 
    walletAddress, 
    sendTransaction,
    isLoading: arenaLoading,
    error: arenaError 
  } = useArena();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize contract when SDK and wallet are ready
  useEffect(() => {
    const initializeContract = async () => {
      if (!sdk || !walletAddress) {
        setContract(null);
        return;
      }

      try {
        // Get chain ID from the provider
        const chainIdHex = await sdk.provider.request({
          method: 'eth_chainId',
        });
        const currentChainId = parseInt(chainIdHex, 16);
        setChainId(currentChainId);

        // Determine contract address based on chain
        const contractAddress = currentChainId === 43113 
          ? TESTNET_CONTRACT_ADDRESS 
          : MAINNET_CONTRACT_ADDRESS;

        // Create a custom provider wrapper for ethers
        const provider = new ethers.providers.Web3Provider({
          request: sdk.provider.request.bind(sdk.provider),
          on: sdk.provider.on?.bind(sdk.provider),
          removeListener: sdk.provider.removeListener?.bind(sdk.provider),
        } as any);

        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, DROIDHUB_ABI, signer);
        
        setContract(contractInstance);
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      }
    };

    initializeContract();
  }, [sdk, walletAddress]);

  // Send robot command
  const sendRobotCommand = useCallback(async (robotId: string, command: string) => {
    if (!contract || !walletAddress) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current fee per minute
      const feePerMinute = await contract.getFeePerMinute();
      
      // Estimate 1 minute of control (you can adjust this)
      const commandFee = feePerMinute.toString();

      // Send transaction through Arena SDK
      const txHash = await sendTransaction({
        to: contract.address,
        value: ethers.utils.hexlify(feePerMinute),
        data: contract.interface.encodeFunctionData('sendCommand', [robotId, command]),
      });

      console.log('Robot command sent:', { robotId, command, txHash, fee: commandFee });
      return txHash;
    } catch (err) {
      console.error('Failed to send robot command:', err);
      setError(err instanceof Error ? err.message : 'Failed to send robot command');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, walletAddress, sendTransaction]);

  // Add robot (for robot owners)
  const addRobot = useCallback(async (robotId: string) => {
    if (!contract || !walletAddress) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const txHash = await sendTransaction({
        to: contract.address,
        value: '0x0',
        data: contract.interface.encodeFunctionData('addRobot', [robotId]),
      });

      console.log('Robot added:', { robotId, txHash });
      return txHash;
    } catch (err) {
      console.error('Failed to add robot:', err);
      setError(err instanceof Error ? err.message : 'Failed to add robot');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, walletAddress, sendTransaction]);

  // Stake AVAX
  const stake = useCallback(async (amount: string) => {
    if (!contract || !walletAddress) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountWei = ethers.utils.parseEther(amount);
      
      const txHash = await sendTransaction({
        to: contract.address,
        value: ethers.utils.hexlify(amountWei),
        data: contract.interface.encodeFunctionData('stake', []),
      });

      console.log('Staked:', { amount, txHash });
      return txHash;
    } catch (err) {
      console.error('Failed to stake:', err);
      setError(err instanceof Error ? err.message : 'Failed to stake');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, walletAddress, sendTransaction]);

  // Unstake AVAX
  const unstake = useCallback(async (amount: string) => {
    if (!contract || !walletAddress) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const amountWei = ethers.utils.parseEther(amount);
      
      const txHash = await sendTransaction({
        to: contract.address,
        value: '0x0',
        data: contract.interface.encodeFunctionData('unstake', [amountWei]),
      });

      console.log('Unstaked:', { amount, txHash });
      return txHash;
    } catch (err) {
      console.error('Failed to unstake:', err);
      setError(err instanceof Error ? err.message : 'Failed to unstake');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, walletAddress, sendTransaction]);

  // Collect accumulated fees
  const collectFees = useCallback(async () => {
    if (!contract || !walletAddress) {
      throw new Error('Contract not initialized or wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const txHash = await sendTransaction({
        to: contract.address,
        value: '0x0',
        data: contract.interface.encodeFunctionData('collectFees', []),
      });

      console.log('Fees collected:', { txHash });
      return txHash;
    } catch (err) {
      console.error('Failed to collect fees:', err);
      setError(err instanceof Error ? err.message : 'Failed to collect fees');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contract, walletAddress, sendTransaction]);

  // Get stake information
  const getStakeInfo = useCallback(async (): Promise<StakeInfo | null> => {
    if (!contract || !walletAddress) {
      return null;
    }

    try {
      const [stakeAmount, currentController] = await Promise.all([
        contract.getStakeAmount(walletAddress),
        contract.getCurrentController(),
      ]);

      return {
        amount: ethers.utils.formatEther(stakeAmount),
        isController: currentController.toLowerCase() === walletAddress.toLowerCase(),
      };
    } catch (err) {
      console.error('Failed to get stake info:', err);
      return null;
    }
  }, [contract, walletAddress]);

  // Get accumulated fees
  const getAccumulatedFees = useCallback(async (): Promise<string | null> => {
    if (!contract || !walletAddress) {
      return null;
    }

    try {
      const fees = await contract.getAccumulatedFees(walletAddress);
      return ethers.utils.formatEther(fees);
    } catch (err) {
      console.error('Failed to get accumulated fees:', err);
      return null;
    }
  }, [contract, walletAddress]);

  // Get available robots
  const getRobots = useCallback(async (): Promise<string[]> => {
    if (!contract) {
      return [];
    }

    try {
      const robots = await contract.getRobots();
      return robots;
    } catch (err) {
      console.error('Failed to get robots:', err);
      return [];
    }
  }, [contract]);

  return {
    // Connection state
    isConnected,
    walletAddress,
    chainId,
    isLoading: isLoading || arenaLoading,
    error: error || arenaError,
    
    // Contract methods
    sendRobotCommand,
    addRobot,
    stake,
    unstake,
    collectFees,
    
    // Query methods
    getStakeInfo,
    getAccumulatedFees,
    getRobots,
    
    // Contract info
    contractAddress: contract?.address,
    isTestnet: chainId === 43113,
  };
};
