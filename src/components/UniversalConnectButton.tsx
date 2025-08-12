import React from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArenaConnectButton } from './ArenaConnectButton';
import { checkArenaEnvironment } from '@/lib/arenaConfig';

interface UniversalConnectButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export const UniversalConnectButton: React.FC<UniversalConnectButtonProps> = (props) => {
  const isArenaEnvironment = checkArenaEnvironment();

  if (isArenaEnvironment) {
    // Use Arena connect button in Arena environment
    return <ArenaConnectButton {...props} />;
  } else {
    // Use RainbowKit connect button in standard environment
    return <ConnectButton />;
  }
};
