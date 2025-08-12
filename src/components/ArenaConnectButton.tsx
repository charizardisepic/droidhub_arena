import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, ChevronRight, Loader2, ExternalLink, Zap } from 'lucide-react';
import { useArena } from '@/components/ArenaProvider';
import { checkArenaEnvironment, isLocalArenaTest } from '@/lib/arenaConfig';

interface ArenaConnectButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const ArenaConnectButton: React.FC<ArenaConnectButtonProps> = ({
  variant = 'default',
  size = 'default',
  showDetails = false,
  className = '',
}) => {
  const {
    isConnected,
    walletAddress,
    userProfile,
    balance,
    isLoading,
    error,
    connect,
    disconnect,
    getUserProfile,
    getBalance,
  } = useArena();

  const [isExpanded, setIsExpanded] = useState(showDetails);
  const isArenaEnv = checkArenaEnvironment();
  const isLocalTest = isLocalArenaTest();

  const handleConnect = async () => {
    try {
      await connect();
      // Automatically fetch profile and balance after connection
      setTimeout(async () => {
        await getUserProfile();
        await getBalance();
      }, 1000);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const toggleDetails = () => {
    setIsExpanded(!isExpanded);
  };

  // If not in Arena environment, show fallback message
  if (!isArenaEnv) {
    return (
      <Alert className={className}>
        <ExternalLink className="h-4 w-4" />
        <AlertDescription>
          Arena wallet connection is only available when running within the Arena platform.
          {isLocalTest && (
            <span className="block mt-1 text-sm text-muted-foreground">
              Running on port 3481 - use Arena's "Run Your App Locally" feature to test.
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Connected state
  if (isConnected && walletAddress) {
    return (
      <div className={className}>
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Arena Wallet Connected</CardTitle>
                  <CardDescription className="text-xs">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Connected
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDetails}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>

          {isExpanded && (
            <CardContent className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Balance</div>
                  <div className="font-medium">
                    {balance ? `${balance} AVAX` : 'Loading...'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Network</div>
                  <div className="font-medium">Avalanche</div>
                </div>
              </div>

              {userProfile && (
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm">Profile</div>
                  <div className="flex items-center gap-2">
                    {userProfile.avatar && (
                      <img
                        src={userProfile.avatar}
                        alt="Profile"
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <span className="font-medium text-sm">
                      {userProfile.username || userProfile.id}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getBalance}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    'Refresh'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Disconnect
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Disconnected state - show connect button
  return (
    <div className={className}>
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        variant={variant}
        size={size}
        className="w-full flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        {isLoading ? 'Connecting...' : 'Connect Arena Wallet'}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {showDetails && (
        <Card className="mt-2">
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Environment</span>
                <Badge variant={isArenaEnv ? 'default' : 'secondary'}>
                  {isArenaEnv ? 'Arena Platform' : 'Standalone'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Local Test</span>
                <Badge variant={isLocalTest ? 'default' : 'secondary'}>
                  {isLocalTest ? 'Port 3481' : 'Other Port'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Arena SDK provides secure wallet access through Arena's infrastructure.
                Your wallet will be connected via WalletConnect protocol.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ArenaConnectButton;
