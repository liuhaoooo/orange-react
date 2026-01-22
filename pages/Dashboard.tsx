
import React from 'react';
import { ConnectionCard } from '../components/ConnectionCard';
import { UsageCard } from '../components/UsageCard';
import { MessagesCard } from '../components/MessagesCard';
import { WifiCard } from '../components/WifiCard';
import { ServicesCard } from '../components/ServicesCard';
import { WifiNetwork } from '../types';

interface DashboardProps {
  onOpenLogin: () => void;
  onOpenDevices: (ssid?: string) => void;
  onEditSsid: (network: WifiNetwork) => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenLogin, onOpenDevices, onEditSsid, onShowPin, onShowPuk }) => {
  return (
    <div className="space-y-6">
      {/* Row 1: Connection and Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[540px]">
           <ConnectionCard 
             onOpenSettings={onOpenLogin} 
             onManageDevices={() => onOpenDevices()}
             onShowPin={onShowPin}
             onShowPuk={onShowPuk}
           />
        </div>
        <div className="h-[540px]">
           <MessagesCard 
             onOpenLogin={onOpenLogin}
           />
        </div>
      </div>

      {/* Row 2: Usage, Wi-Fi, Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-[540px]">
          <UsageCard />
        </div>
        <div className="h-[540px]">
          <WifiCard 
            onManageDevices={onOpenDevices}
            onOpenLogin={onOpenLogin}
            onEditSsid={onEditSsid}
          />
        </div>
        <div className="h-[540px]">
          <ServicesCard 
            onOpenLogin={onOpenLogin}
            onShowPin={onShowPin}
            onShowPuk={onShowPuk}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
