import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useArena } from '@/components/ArenaProvider';
import { useArenaDroidHub } from '@/hooks/useArenaDroidHub';
import { checkArenaEnvironment, isLocalArenaTest } from '@/lib/arenaConfig';

export const ArenaIntegrationDemo: React.FC = () => {
  const {
    connect,
    disconnect,
    getUserProfile,
    getBalance,
    isConnected,
    walletAddress,
    userProfile,
    balance,
    isLoading: arenaLoading,
    error: arenaError,
  } = useArena();

  const {
    sendRobotCommand,
    addRobot,
    stake,
    unstake,
    collectFees,
    getStakeInfo,
    getAccumulatedFees,
    getRobots,
    isLoading: contractLoading,
    error: contractError,
    contractAddress,
    isTestnet,
  } = useArenaDroidHub();

  const [robotId, setRobotId] = useState('robot-001');
  const [command, setCommand] = useState('forward');
  const [stakeAmount, setStakeAmount] = useState('1.0');
  const [robots, setRobots] = useState<string[]>([]);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [accumulatedFees, setAccumulatedFees] = useState<string | null>(null);

  const isArenaEnv = checkArenaEnvironment();
  const isLocalTest = isLocalArenaTest();
  const isLoading = arenaLoading || contractLoading;
  const error = arenaError || contractError;

  // Load data when connected
  useEffect(() => {
    if (isConnected) {
      loadContractData();
    }
  }, [isConnected]);

  const loadContractData = async () => {
    try {
      const [robotList, stake, fees] = await Promise.all([
        getRobots(),
        getStakeInfo(),
        getAccumulatedFees(),
      ]);
      
      setRobots(robotList);
      setStakeInfo(stake);
      setAccumulatedFees(fees);
    } catch (err) {
      console.error('Failed to load contract data:', err);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
      await getUserProfile();
      await getBalance();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleSendCommand = async () => {
    try {
      const txHash = await sendRobotCommand(robotId, command);
      alert(`Command sent! Transaction: ${txHash}`);
      await loadContractData();
    } catch (err) {
      console.error('Command failed:', err);
    }
  };

  const handleAddRobot = async () => {
    try {
      const txHash = await addRobot(robotId);
      alert(`Robot added! Transaction: ${txHash}`);
      await loadContractData();
    } catch (err) {
      console.error('Add robot failed:', err);
    }
  };

  const handleStake = async () => {
    try {
      const txHash = await stake(stakeAmount);
      alert(`Staked ${stakeAmount} AVAX! Transaction: ${txHash}`);
      await loadContractData();
    } catch (err) {
      console.error('Staking failed:', err);
    }
  };

  const handleUnstake = async () => {
    try {
      const txHash = await unstake(stakeAmount);
      alert(`Unstaked ${stakeAmount} AVAX! Transaction: ${txHash}`);
      await loadContractData();
    } catch (err) {
      console.error('Unstaking failed:', err);
    }
  };

  const handleCollectFees = async () => {
    try {
      const txHash = await collectFees();
      alert(`Fees collected! Transaction: ${txHash}`);
      await loadContractData();
    } catch (err) {
      console.error('Fee collection failed:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Arena SDK Integration Status</CardTitle>
          <CardDescription>
            DroidHub integration with Arena App Store SDK
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Environment</Label>
              <Badge variant={isArenaEnv ? "default" : "secondary"}>
                {isArenaEnv ? "Arena Platform" : "Standalone"}
              </Badge>
            </div>
            <div>
              <Label>Local Test</Label>
              <Badge variant={isLocalTest ? "default" : "secondary"}>
                {isLocalTest ? "Port 3481" : "Other Port"}
              </Badge>
            </div>
            <div>
              <Label>Network</Label>
              <Badge variant={isTestnet ? "destructive" : "default"}>
                {isTestnet ? "Testnet" : "Mainnet"}
              </Badge>
            </div>
            <div>
              <Label>Contract</Label>
              <Badge variant="outline">
                {contractAddress ? `${contractAddress.slice(0, 8)}...` : "Not Connected"}
              </Badge>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>
            Connect your wallet through Arena's secure interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Address</Label>
                  <div className="font-mono text-sm">
                    {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : "N/A"}
                  </div>
                </div>
                <div>
                  <Label>Balance</Label>
                  <div className="font-mono text-sm">
                    {balance ? `${balance} AVAX` : "Loading..."}
                  </div>
                </div>
              </div>

              {userProfile && (
                <div>
                  <Label>Profile ID</Label>
                  <div className="font-mono text-sm">{userProfile.id}</div>
                </div>
              )}

              <Button variant="outline" onClick={disconnect} disabled={isLoading}>
                Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Robot Control</CardTitle>
              <CardDescription>
                Send commands to robots via blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="robotId">Robot ID</Label>
                  <Input
                    id="robotId"
                    value={robotId}
                    onChange={(e) => setRobotId(e.target.value)}
                    placeholder="e.g., robot-001"
                  />
                </div>
                <div>
                  <Label htmlFor="command">Command</Label>
                  <Input
                    id="command"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="e.g., forward, left, right"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendCommand} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Command"}
                </Button>
                <Button variant="outline" onClick={handleAddRobot} disabled={isLoading}>
                  Add Robot
                </Button>
              </div>

              {robots.length > 0 && (
                <div>
                  <Label>Available Robots</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {robots.map((robot, index) => (
                      <Badge key={index} variant="secondary">
                        {robot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Staking & Fees</CardTitle>
              <CardDescription>
                Manage your AVAX stakes and collect fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Stake</Label>
                  <div className="font-mono text-sm">
                    {stakeInfo ? `${stakeInfo.amount} AVAX` : "0 AVAX"}
                  </div>
                  {stakeInfo?.isController && (
                    <Badge variant="default" className="mt-1">Controller</Badge>
                  )}
                </div>
                <div>
                  <Label>Accumulated Fees</Label>
                  <div className="font-mono text-sm">
                    {accumulatedFees ? `${accumulatedFees} AVAX` : "0 AVAX"}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="stakeAmount">Amount (AVAX)</Label>
                <Input
                  id="stakeAmount"
                  type="number"
                  step="0.1"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="1.0"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleStake} disabled={isLoading}>
                  Stake
                </Button>
                <Button variant="outline" onClick={handleUnstake} disabled={isLoading}>
                  Unstake
                </Button>
                <Button variant="secondary" onClick={handleCollectFees} disabled={isLoading}>
                  Collect Fees
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ArenaIntegrationDemo;
