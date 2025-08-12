// Arena App SDK TypeScript definitions

export interface ArenaSDKMetadata {
  name: string;
  description: string;
  url: string;
  icons: string[];
}

export interface ArenaSDKConfig {
  projectId: string;
  metadata: ArenaSDKMetadata;
}

export interface WalletChangedEvent {
  address: string;
}

export interface UserProfile {
  id: string;
  address: string;
  username?: string;
  avatar?: string;
  [key: string]: any;
}

export interface EthProvider {
  accounts: string[];
  request: (params: {
    method: string;
    params?: any[];
  }) => Promise<any>;
  on: (event: string, handler: Function) => void;
  removeListener: (event: string, handler: Function) => void;
}

export interface TransactionParams {
  from: string;
  to: string;
  value: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
}

export class ArenaAppStoreSdk {
  provider: EthProvider;
  
  constructor(config: ArenaSDKConfig);
  
  // Event listeners
  on(event: 'walletChanged', handler: (data: WalletChangedEvent) => void): void;
  on(event: 'connected', handler: () => void): void;
  on(event: 'disconnected', handler: () => void): void;
  
  // API methods
  sendRequest(method: string, params?: any): Promise<any>;
  getUserProfile(): Promise<UserProfile>;
  
  // Wallet methods
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Remove event listeners
  removeListener(event: string, handler: Function): void;
}

declare global {
  interface Window {
    ArenaAppStoreSdk?: typeof ArenaAppStoreSdk;
  }
}
