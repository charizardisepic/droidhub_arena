# Arena SDK Integration Guide

This document explains how the DroidHub application integrates with the Arena App Store SDK.

## Overview

The Arena integration allows DroidHub to run within the Arena platform, providing:
- Secure wallet access through Arena's infrastructure
- Seamless user experience within the Arena ecosystem
- Access to Arena's user base and features

## Setup Instructions

### 1. Reown Project Setup

Before using the Arena SDK, you need to create a Reown project:

1. Go to [Reown Developer Portal](https://cloud.reown.com/)
2. Create a new project
3. Configure your project settings:
   - Name: "DroidHub Arena"
   - Description: "Control and stake on autonomous robots"
   - URL: Your app's domain
4. Generate your Project ID and API keys
5. Add your app's domain to allowed origins
6. Save your credentials securely

### 2. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables:
   ```env
   VITE_REOWN_PROJECT_ID=your-actual-project-id-here
   ```

### 3. Local Testing

For local development with Arena:

1. Start your development server on port 3481:
   ```bash
   npm run dev
   ```

2. Use the "Run Your App Locally" feature in the Arena App Store
3. Enter `http://localhost:3481` as your app URL

## Integration Features

### Dual Environment Support

The app automatically detects whether it's running in:
- **Arena Environment**: Uses Arena SDK for wallet and transactions
- **Standalone Environment**: Uses RainbowKit for direct wallet connection

### Arena SDK Components

#### ArenaProvider
The main React context provider that initializes the Arena SDK and manages:
- Wallet connection state
- User profile information
- Transaction handling
- Error management

#### useArena Hook
Provides access to Arena SDK functionality:
```typescript
const {
  isConnected,
  walletAddress,
  userProfile,
  balance,
  connect,
  disconnect,
  sendTransaction,
} = useArena();
```

#### useArenaDroidHub Hook
Integrates Arena SDK with DroidHub smart contracts:
```typescript
const {
  sendRobotCommand,
  addRobot,
  stake,
  unstake,
  collectFees,
  getStakeInfo,
} = useArenaDroidHub();
```

## Key Differences from RainbowKit

| Feature | RainbowKit | Arena SDK |
|---------|------------|-----------|
| Wallet Connection | Direct wallet connect | Through Arena |
| User Management | Wallet address only | Full user profile |
| Permissions | Direct blockchain access | Arena-mediated access |
| Environment | Any web app | Arena platform only |

## Smart Contract Integration

The Arena integration maintains full compatibility with existing DroidHub contracts:

### Supported Operations
- **Robot Control**: Send commands to robots with fee payment
- **Robot Management**: Add new robots to the network
- **Staking**: Stake AVAX to become a controller
- **Fee Collection**: Collect accumulated fees from robot usage

### Transaction Flow
1. User initiates action in UI
2. Arena SDK handles wallet authentication
3. Transaction is sent through Arena's secure provider
4. Smart contract executes on Avalanche blockchain
5. UI updates with transaction results

## Security Considerations

### Permissions
The app requests the following permissions from Arena:
- **Wallet Access**: Read wallet address and balance
- **Transaction Signing**: Sign and send transactions
- **User Profile**: Access basic profile information

### Data Handling
- No sensitive data is stored locally
- All transactions go through Arena's security layer
- User profiles are managed by Arena

## Testing and Deployment

### Local Testing
1. Run on port 3481: `npm run dev`
2. Use Arena's local testing feature
3. Test all wallet and contract interactions

### Production Deployment
1. Deploy to HTTPS-enabled hosting
2. Configure CORS headers properly
3. Register app in Arena App Store
4. Provide required metadata and permissions

## Troubleshooting

### Common Issues

**Arena SDK not found**
- Ensure app is running within Arena platform
- Check iframe detection logic

**Connection failures**
- Verify Reown Project ID is correct
- Check network connectivity
- Ensure proper permissions are granted

**Transaction errors**
- Verify wallet has sufficient AVAX balance
- Check contract addresses for correct network
- Ensure proper function parameters

### Debug Mode
Enable debug logging by setting:
```env
VITE_DEBUG_ARENA=true
```

## API Reference

### ArenaProvider Props
```typescript
interface ArenaProviderProps {
  projectId: string;     // Reown Project ID
  appName: string;       // App display name
  appDescription: string; // App description
  appIcon: string;       // App icon URL
  children: ReactNode;   // Child components
}
```

### Arena Context Type
```typescript
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
  sendTransaction: (params) => Promise<string>;
  getUserProfile: () => Promise<void>;
  getBalance: () => Promise<void>;
}
```

## Support

For Arena integration support:
- Arena Documentation: [Arena Developer Docs]
- Reown Support: [Reown Documentation]
- DroidHub Issues: [GitHub Issues]
