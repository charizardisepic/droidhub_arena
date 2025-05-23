import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Battery, Clock, Users, TrendingUp } from "lucide-react";

interface RobotFeedCardProps {
  id: string;
  title: string;
  isActive?: boolean;
  viewerCount: number;
  thumbnailUrl?: string;
  batteryLevel: number;
  uptime: string;
  operatorCount: number;
  topStake?: number;
  chargeRate?: number;
}

export const RobotFeedCard = ({
  id,
  title,
  isActive = false,
  viewerCount,
  thumbnailUrl,
  batteryLevel,
  uptime,
  operatorCount,
  topStake = 0,
  chargeRate = 0
}: RobotFeedCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group neo-card">
      <div className="relative aspect-video bg-black/70">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="grid-pattern opacity-20 absolute inset-0"></div>
            <span className="text-muted-foreground">No Preview Available</span>
          </div>
        )}
        
        {isActive && (
          <Badge className="absolute top-2 right-2 bg-red-500" variant="default">
            LIVE
          </Badge>
        )}
        
        {viewerCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs flex items-center gap-1">
            <Users className="h-3 w-3" />
            {viewerCount}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold mb-2">{title}</h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Battery className="h-3.5 w-3.5" />
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-12 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
              <span>{batteryLevel}%</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{topStake} WND</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{viewerCount} viewers</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{chargeRate} WND/hr</span>
          </div>
        </div>
        
        <Link to={`/app?robot=${id}`}>
          <Button className="w-full neo-button">
            {isActive ? 'Control Robot' : 'View Details'}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
