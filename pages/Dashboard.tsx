
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
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenLogin, onOpenDevices, onEditSsid }) => {
  return (
    <div className="space-y-6">
      {/* Row 1: Connection and Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-[450px]">
           <ConnectionCard 
             onOpenSettings={onOpenLogin} 
             onManageDevices={() => onOpenDevices()}
           />
        </div>
        <div className="h-[450px]">
           <MessagesCard 
             onOpenLogin={onOpenLogin}
           />
        </div>
      </div>

      {/* Row 2: Usage, Wi-Fi, Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-[450px]">
          <UsageCard />
        </div>
        <div className="h-[450px]">
          <WifiCard 
            onManageDevices={onOpenDevices}
            onOpenLogin={onOpenLogin}
            onEditSsid={onEditSsid}
          />
        </div>
        <div className="h-[450px]">
          <ServicesCard 
            onOpenLogin={onOpenLogin}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
