
import React, { useState } from 'react';
import { Card, CardHeader, SquareSwitch } from './UIComponents';
import { Clock, ArrowUpDown, Router, Battery, Users } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';

interface ConnectionCardProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ onOpenSettings, onManageDevices }) => {
  const [isConnected, setIsConnected] = useState(true);
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

  const handleManageDevices = () => {
    if (!isLoggedIn) {
      onOpenSettings();
      return;
    }
    onManageDevices();
  };

  return (
    <Card>
      <CardHeader title={t('connection')} onSettingsClick={onOpenSettings} />
      
      {/* Toggles */}
      <div className="p-4 space-y-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg text-black">{t('connected')}</div>
            <div className="text-xs text-black">{t('dataIs')} {isConnected ? t('on') : t('off')}</div>
          </div>
          <SquareSwitch 
            isOn={isConnected} 
            onChange={handleConnectionToggle} 
          />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-bold text-lg text-black">{t('roaming')}</div>
            <div className="text-xs text-black">{t('roamingIs')} {isRoaming ? t('on') : t('off')}</div>
          </div>
          <SquareSwitch 
            isOn={isRoaming} 
            onChange={handleRoamingToggle} 
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 text-xs border-b border-gray-200">
        <div className="flex items-center p-3 border-e border-gray-200">
          <Clock className="w-5 h-5 me-2 text-black shrink-0" />
          <div>
            <div className="font-bold text-black">{t('timeElapsed')}</div>
            <div className="text-black">145:07:50</div>
          </div>
        </div>
        <div className="flex items-center p-3">
          <ArrowUpDown className="w-5 h-5 me-2 text-black shrink-0" />
          <div>
            <div className="font-bold text-black">{t('dataUsage')}</div>
            <div className="text-black">1.20 GB</div>
          </div>
        </div>
      </div>

      {/* Graphical Info Rows */}
      <div className="flex-1 flex flex-col">
        {/* Network */}
        <div className="flex h-[80px] border-b border-gray-200">
          <div className="w-1/2 p-3 bg-gray-50 flex flex-col justify-center">
            <span className="font-bold text-sm text-black">{t('network')}</span>
            <span className="text-sm text-black">5G</span>
          </div>
          <div className="w-1/2 bg-yellow-400 relative overflow-hidden flex items-center justify-center">
             {/* Abstract Router graphic */}
             <Router className="text-yellow-900 w-10 h-10 opacity-50" />
             <div className="absolute top-2 right-2 flex space-x-0.5 items-end rtl:right-auto rtl:left-2">
                <div className="w-1 h-2 bg-yellow-800"></div>
                <div className="w-1 h-3 bg-yellow-800"></div>
                <div className="w-1 h-5 bg-yellow-800"></div>
             </div>
          </div>
        </div>

        {/* Battery */}
        <div className="flex h-[80px] border-b border-gray-200">
          <div className="w-1/2 p-3 bg-gray-50 flex flex-col justify-center">
            <span className="font-bold text-sm text-black">{t('battery')}</span>
            <span className="text-sm text-black">100%</span>
          </div>
          <div className="w-1/2 bg-green-500 flex items-center justify-center">
             <Battery className="text-green-900 w-10 h-10 fill-current opacity-60" />
          </div>
        </div>

        {/* Connected Users */}
        <div className="flex h-[80px] border-b border-gray-200">
          <div className="w-1/2 p-3 bg-gray-50 flex flex-col justify-center">
            <span className="font-bold text-sm text-black">{t('connected')}</span>
            <span className="text-sm text-black">1</span>
          </div>
          <div className="w-1/2 bg-purple-400 flex items-center justify-center">
            <Users className="text-purple-900 w-10 h-10 opacity-60" />
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-4 mt-auto">
        <button 
          onClick={handleManageDevices}
          className="w-full border border-black py-2 text-sm font-bold hover:bg-gray-100 transition-colors text-black"
        >
          {t('manageDevices')}
        </button>
      </div>
    </Card>
  );
};
