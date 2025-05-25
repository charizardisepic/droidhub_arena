import { Card } from "@/components/ui/card";
import React from "react";

interface ControlPanelStatusOverlayProps {
  controlState: 'controller' | 'notController' | 'gaining' | 'losing';
  secondsToNextMinute: number;
}

export const ControlPanelStatusOverlay: React.FC<ControlPanelStatusOverlayProps> = ({ controlState, secondsToNextMinute }) => {
  let overlayMessage = "";
  let overlayBgClass = "";

  switch (controlState) {
    case 'controller':
      overlayMessage = 'You are the controller.';
      overlayBgClass = 'bg-green-500/30';
      break;
    case 'notController':
      overlayMessage = 'You are not the controller.';
      overlayBgClass = 'bg-gray-600/70';
      break;
    case 'gaining':
      overlayMessage = `Gaining control in ${secondsToNextMinute}s`;
      overlayBgClass = 'bg-green-500/70';
      break;
    case 'losing':
      overlayMessage = `Losing control in ${secondsToNextMinute}s`;
      overlayBgClass = 'bg-red-500/70';
      break;
  }

  return (
    <Card className={`w-full flex justify-center items-center py-2 rounded-t-md backdrop-blur-sm ${overlayBgClass}`}>
      <p className="text-base font-bold text-white text-center">{overlayMessage}</p>
    </Card>
  );
};
