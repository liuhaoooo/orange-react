
import React, { useState } from 'react';
import { Settings, Timer, ArrowUpDown, Battery, TabletSmartphone, Link as LinkIcon, Globe, Monitor, Smartphone } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { SquareSwitch, Card } from '../components/UIComponents';

interface ConnectionPageProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
}

const StatBox: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  topText?: string 
}> = ({ icon, label, value, topText }) => (
  <div className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-[200px] shadow-sm">
    <div className="text-orange mb-4 flex flex-col items-center">
        {topText && <div className="text-orange font-bold text-sm leading-none mb-1">{topText}</div>}
        {icon}
    </div>
    <div className="text-base text-gray-800 leading-tight mb-2">{label}</div>
    <div className="font-bold text-black text-xl">{value}</div>
  </div>
);

export const ConnectionPage: React.FC<ConnectionPageProps> = ({ onOpenSettings, onManageDevices }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();
  const [isConnected, setIsConnected] = useState(false);
  const [isRoaming, setIsRoaming] = useState(false);

  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenSettings();
    } else {
      action();
    }
  };

  const handleConnectionToggle = () => handleInteraction(() => setIsConnected(!isConnected));
  const handleRoamingToggle = () => handleInteraction(() => setIsRoaming(!isRoaming));
  const handleManageDevicesClick = () => handleInteraction(() => onManageDevices());

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-black">{t('connection')}</h1>
         <button 
           onClick={onOpenSettings}
           className="border border-black bg-white hover:bg-gray-50 text-black px-4 py-2 font-bold text-sm flex items-center transition-colors"
         >
            <Settings size={16} className="me-2" />
            {t('settings')}
         </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
          <StatBox 
            icon={<Timer size={60} strokeWidth={1.5} />} 
            label={t('timeElapsed')} 
            value="00:05:34" 
          />
          <StatBox 
            icon={<ArrowUpDown size={60} strokeWidth={1.5} />} 
            label={t('dataUsage')} 
            value="50 MB" 
          />
          <StatBox 
            icon={null} 
            topText="----" 
            label={t('network')} 
            value={t('noNetwork')} 
          />
          <StatBox 
            icon={<Battery size={60} strokeWidth={1.5} className="rotate-0" />} 
            label={t('battery')} 
            value="100 %" 
          />
          <StatBox 
            icon={<TabletSmartphone size={60} strokeWidth={1.5} />} 
            label={t('connected')} 
            value="8" 
          />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Connection & Roaming Toggles (Spans 3/5) */}
        <Card className="lg:col-span-3 border border-gray-200">
             {/* Connection Row */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 min-h-[120px]">
                <div className="flex items-center">
                   <div className="bg-gray-100 p-2.5 rounded-sm me-5">
                      <LinkIcon size={32} className="text-black" />
                   </div>
                   <div className="flex flex-col items-start">
                        <span className="font-bold text-black text-lg mb-1">{isConnected ? t('connected') : t('notConnected')}</span>
                        <span className={`text-sm ${!isConnected ? 'text-orange' : 'text-gray-500'}`}>
                            {isConnected ? `${t('dataIs')} ${t('on')}` : t('pinCodeRequired')}
                        </span>
                    </div>
                </div>
                <SquareSwitch isOn={isConnected} onChange={handleConnectionToggle} />
            </div>

            {/* Roaming Row */}
            <div className="flex justify-between items-center p-6 min-h-[120px]">
                <div className="flex items-center">
                   <div className="bg-gray-100 p-2.5 rounded-sm me-5">
                      <Globe size={32} className="text-black" />
                   </div>
                   <div className="flex flex-col items-start">
                        <span className="font-bold text-black text-lg mb-1">{t('roaming')}</span>
                        <span className="text-sm text-black">{isRoaming ? `${t('roamingIs')} ${t('on')}` : t('roamingOff')}</span>
                    </div>
                </div>
                <SquareSwitch isOn={isRoaming} onChange={handleRoamingToggle} />
            </div>
        </Card>

        {/* Devices Card (Spans 2/5) */}
        <Card className="lg:col-span-2 border border-gray-200 p-6 flex flex-col justify-between h-full min-h-[240px]">
             <div>
               <h2 className="font-bold text-xl mb-4 text-black">{t('devices')}</h2>
               <div className="flex items-start mb-6">
                  <div className="flex items-end me-5 text-black shrink-0 relative">
                      <Monitor size={56} strokeWidth={1.2} />
                      <Smartphone size={36} strokeWidth={1.2} className="absolute -right-2 -bottom-0.5 fill-white bg-white border-2 border-white rounded-md" />
                  </div>
                  <p className="text-sm text-gray-700 leading-tight pt-1">
                    {t('manageAccessDesc')}
                  </p>
               </div>
             </div>
             
             <button 
                onClick={handleManageDevicesClick}
                className="bg-orange hover:bg-orange-dark text-black font-bold py-3 px-6 text-sm transition-colors w-full rounded-none"
            >
                {t('manageDevices')}
            </button>
        </Card>

      </div>
    </div>
  );
};
