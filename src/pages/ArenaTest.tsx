import React from 'react';
import { ArenaConnectButton } from '@/components/ArenaConnectButton';
import { ArenaIntegrationDemo } from '@/components/ArenaIntegrationDemo';
import { checkArenaEnvironment, isLocalArenaTest } from '@/lib/arenaConfig';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink, Zap } from 'lucide-react';

const ArenaTestPage = () => {
  const isArenaEnv = checkArenaEnvironment();
  const isLocalTest = isLocalArenaTest();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text">
              Arena SDK Integration Test
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Test and demonstrate DroidHub's integration with the Arena App Store SDK.
              Connect your wallet through Arena's secure infrastructure.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={isArenaEnv ? "default" : "secondary"}>
                  {isArenaEnv ? "Arena Platform" : "Standalone"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArenaEnv 
                    ? "Running within Arena iframe" 
                    : "Running in standalone mode"
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Local Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={isLocalTest ? "default" : "secondary"}>
                  {isLocalTest ? "Port 3481" : `Port ${window.location.port || '80'}`}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLocalTest 
                    ? "Ready for Arena local testing" 
                    : "Use port 3481 for Arena"
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                  SDK Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={window.ArenaAppStoreSdk ? "default" : "outline"}>
                  {window.ArenaAppStoreSdk ? "Available" : "Mock Mode"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {window.ArenaAppStoreSdk 
                    ? "Arena SDK detected" 
                    : "Using development mock"
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Connect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Connect
              </CardTitle>
              <CardDescription>
                Connect your wallet through Arena's secure WalletConnect integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArenaConnectButton 
                showDetails={true}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          {!isArenaEnv && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Arena Local Testing Setup:</p>
                  <ol className="text-sm space-y-1 ml-4 list-decimal">
                    <li>Ensure your app is running on port 3481</li>
                    <li>Open the Arena App Store</li>
                    <li>Use "Run Your App Locally" feature</li>
                    <li>Enter: <code className="bg-muted px-1 rounded">http://localhost:3481</code></li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Full Demo */}
          {isArenaEnv && <ArenaIntegrationDemo />}

          {/* Documentation Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Documentation & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Arena Platform</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Arena App Store SDK</li>
                    <li>• WalletConnect Integration</li>
                    <li>• Secure Wallet Access</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">DroidHub Integration</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Smart Contract Interaction</li>
                    <li>• Robot Command System</li>
                    <li>• Staking & Fee Management</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  📋 Complete integration guide available in: <code>ARENA_INTEGRATION.md</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArenaTestPage;
