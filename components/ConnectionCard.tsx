
import React, { useState } from 'react';
import { Card, CardHeader, SquareSwitch } from './UIComponents';
import { Timer, ArrowUpDown, Battery, TabletSmartphone } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';

interface ConnectionCardProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
}

const StatItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  topText?: string 
}> = ({ icon, label, value, topText }) => (
  <div className="flex flex-col items-center justify-start text-center h-full min-w-[70px]">
    <div className="text-orange mb-2">
        {topText && <div className="text-orange font-bold text-sm leading-none mb-1">{topText}</div>}
        {icon}
    </div>
    <div className="text-sm text-black leading-tight mb-1">{label}</div>
    <div className="font-bold text-black text-sm">{value}</div>
  </div>
);

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ onOpenSettings, onManageDevices }) => {
  const [isConnected, setIsConnected] = useState(false); // Default to false to match screenshot "Not connected"
  const [isRoaming, setIsRoaming] = useState(false);
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();

  const handleConnectionToggle = () => {
    if (!isLoggedIn) {
      onOpenSettings();
      return;
    }
    setIsConnected(!isConnected);
  };

  const handleRoamingToggle = () => {
    if (!isLoggedIn) {
      onOpenSettings();
      return;
    }
    setIsRoaming(!isRoaming);
  };

  return (
    <Card className="h-full">
      <CardHeader title={t('connection')} />
      
      {/* Top Stats Row */}
      <div className="p-4 pt-6 pb-6 flex justify-between items-start border-b border-gray-200">
          <StatItem 
            icon={<Timer size={40} strokeWidth={1.5} />} 
            label={t('timeElapsed')} 
            value="00:05:34" 
          />
          <StatItem 
            icon={<ArrowUpDown size={40} strokeWidth={1.5} />} 
            label={t('dataUsage')} 
            value="50 MB" 
          />
          <StatItem 
            icon={null} 
            topText="----"
            label={t('network')} 
            value={t('noNetwork')} 
          />
          <StatItem 
            icon={<Battery size={40} strokeWidth={1.5} className="rotate-0" />} 
            label={t('battery')} 
            value="100 %" 
          />
          <StatItem 
            icon={<TabletSmartphone size={40} strokeWidth={1.5} />} 
            label={t('connected')} 
            value="8" 
          />
      </div>

      {/* Toggles Section */}
      <div className="flex-1 flex flex-col p-4 pt-2">
        
        {/* Connection Toggle */}
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          <div className="flex flex-col items-start">
             <span className="font-bold text-black text-sm">{isConnected ? t('connected') : t('notConnected')}</span>
             <span className={`text-xs ${!isConnected ? 'text-orange' : 'text-gray-500'}`}>
                {isConnected ? `${t('dataIs')} ${t('on')}` : t('pinCodeRequired')}
             </span>
          </div>
          <SquareSwitch isOn={isConnected} onChange={handleConnectionToggle} />
        </div>

        {/* Roaming Toggle */}
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          <div className="flex flex-col items-start">
             <span className="font-bold text-black text-sm">{t('roaming')}</span>
             <span className="text-xs text-black">{isRoaming ? `${t('roamingIs')} ${t('on')}` : t('roamingOff')}</span>
          </div>
          <SquareSwitch isOn={isRoaming} onChange={handleRoamingToggle} />
        </div>

        {/* Action Button */}
        <div className="mt-6">
            <Link 
                to="/connection"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 text-sm transition-colors rounded-none"
            >
                {t('viewConnection')}
            </Link>
        </div>

      </div>
    </Card>
  );
};
