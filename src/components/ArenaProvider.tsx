import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { ArenaAppStoreSdk, UserProfile, WalletChangedEvent } from '@/types/arena-sdk';

interface ArenaContextType {
  sdk: ArenaAppStoreSdk | null;
  isConnected: boolean;
  walletAddress: string | null;
  userProfile: UserProfile | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (params: {
    to: string;
    value: string;
    data?: string;
  }) => Promise<string>;
  getUserProfile: () => Promise<void>;
  getBalance: () => Promise<void>;
}

const ArenaContext = createContext<ArenaContextType | null>(null);

interface ArenaProviderProps {
  children: ReactNode;
  projectId: string;
  appName: string;
  appDescription: string;
  appIcon: string;
}

export const ArenaProvider: React.FC<ArenaProviderProps> = ({
  children,
  projectId,
  appName,
  appDescription,
  appIcon,
}) => {
  const [sdk, setSdk] = useState<ArenaAppStoreSdk | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if Arena SDK is available
        if (!window.ArenaAppStoreSdk) {
          // For development/testing: create a mock SDK
          console.log('Arena SDK not found, creating mock implementation for testing...');
          
          // Create a mock implementation for development
          const mockSdk = {
            provider: {
              accounts: [],
              request: async (params: any) => {
                console.log('Mock provider request:', params);
                if (params.method === 'eth_accounts') {
                  return [];
                }
                if (params.method === 'eth_requestAccounts') {
                  const mockAddress = '0x742d35Cc6634C0532925a3b8D6Ac6d4Db8C5';
                  return [mockAddress];
                }
                if (params.method === 'eth_getBalance') {
                  return '0x2386f26fc10000'; // 0.01 ETH in hex
                }
                if (params.method === 'eth_chainId') {
                  return '0xa86a'; // Avalanche mainnet
                }
                return null;
              },
              on: (event: string, handler: Function) => {
                console.log('Mock provider event listener:', event);
              },
              removeListener: (event: string, handler: Function) => {
                console.log('Mock provider remove listener:', event);
              },
            },
            on: (event: string, handler: Function) => {
              console.log('Mock SDK event listener:', event);
            },
            connect: async () => {
              console.log('Mock connect');
              const mockAddress = '0x742d35Cc6634C0532925a3b8D6Ac6d4Db8C5';
              setWalletAddress(mockAddress);
              setIsConnected(true);
              return mockAddress;
            },
            disconnect: async () => {
              console.log('Mock disconnect');
              setWalletAddress(null);
              setIsConnected(false);
            },
            isConnected: () => isConnected,
            sendRequest: async (method: string, params?: any) => {
              console.log('Mock sendRequest:', method, params);
              if (method === 'getUserProfile') {
                return {
                  id: 'mock-user-123',
                  address: walletAddress,
                  username: 'DemoUser',
                };
              }
              return null;
            },
            removeListener: (event: string, handler: Function) => {
              console.log('Mock remove listener:', event);
            },
          } as any;

          setSdk(mockSdk);
          return;
        }

        const arenaSDK = new window.ArenaAppStoreSdk({
          projectId,
          metadata: {
            name: appName,
            description: appDescription,
            url: window.location.href,
            icons: [appIcon],
          },
        });

        setSdk(arenaSDK);

        // Set up event listeners
        arenaSDK.on('walletChanged', (data: WalletChangedEvent) => {
          console.log('Wallet changed:', data.address);
          setWalletAddress(data.address);
          setIsConnected(!!data.address);
          if (data.address) {
            getBalanceInternal(arenaSDK, data.address);
          }
        });

        arenaSDK.on('connected', () => {
          console.log('Arena SDK connected');
          setIsConnected(true);
        });

        arenaSDK.on('disconnected', () => {
          console.log('Arena SDK disconnected');
          setIsConnected(false);
          setWalletAddress(null);
          setUserProfile(null);
          setBalance(null);
        });

        // Check if already connected
        if (arenaSDK.isConnected()) {
          setIsConnected(true);
          if (arenaSDK.provider.accounts.length > 0) {
            const address = arenaSDK.provider.accounts[0];
            setWalletAddress(address);
            getBalanceInternal(arenaSDK, address);
          }
        }
      } catch (err) {
        console.error('Failed to initialize Arena SDK:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Arena SDK');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, [projectId, appName, appDescription, appIcon, isConnected, walletAddress]);

  const getBalanceInternal = async (sdkInstance: ArenaAppStoreSdk, address: string) => {
    try {
      const balanceHex = await sdkInstance.provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from hex to decimal (wei) and then to AVAX
      const balanceWei = parseInt(balanceHex, 16);
      const balanceAvax = (balanceWei / 1e18).toFixed(4);
      setBalance(balanceAvax);
    } catch (err) {
      console.error('Failed to get balance:', err);
    }
  };

  const connect = useCallback(async () => {
    if (!sdk) {
      throw new Error('Arena SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      const address = await sdk.connect();
      setWalletAddress(address);
      setIsConnected(true);
      await getBalanceInternal(sdk, address);
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const disconnect = useCallback(async () => {
    if (!sdk) return;

    try {
      setIsLoading(true);
      await sdk.disconnect();
      setIsConnected(false);
      setWalletAddress(null);
      setUserProfile(null);
      setBalance(null);
    } catch (err) {
      console.error('Disconnect failed:', err);
      setError(err instanceof Error ? err.message : 'Disconnect failed');
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const sendTransaction = useCallback(async (params: {
    to: string;
    value: string;
    data?: string;
  }) => {
    if (!sdk || !walletAddress) {
      throw new Error('Not connected to Arena');
    }

    try {
      setIsLoading(true);
      setError(null);

      const txHash = await sdk.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: params.to,
          value: params.value,
          data: params.data,
        }],
      });

      // Refresh balance after transaction
      await getBalanceInternal(sdk, walletAddress);
      
      return txHash;
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk, walletAddress]);

  const getUserProfile = useCallback(async () => {
    if (!sdk) {
      throw new Error('Arena SDK not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      const profile = await sdk.sendRequest('getUserProfile');
      setUserProfile(profile);
    } catch (err) {
      console.error('Failed to get user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to get user profile');
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const getBalance = useCallback(async () => {
    if (!sdk || !walletAddress) {
      throw new Error('Not connected');
    }

    try {
      await getBalanceInternal(sdk, walletAddress);
    } catch (err) {
      console.error('Failed to get balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to get balance');
    }
  }, [sdk, walletAddress]);

  const value: ArenaContextType = {
    sdk,
    isConnected,
    walletAddress,
    userProfile,
    balance,
    isLoading,
    error,
    connect,
    disconnect,
    sendTransaction,
    getUserProfile,
    getBalance,
  };

  return (
    <ArenaContext.Provider value={value}>
      {children}
    </ArenaContext.Provider>
  );
};

export const useArena = (): ArenaContextType => {
  const context = useContext(ArenaContext);
  if (!context) {
    throw new Error('useArena must be used within an ArenaProvider');
  }
  return context;
};

export default ArenaProvider;
