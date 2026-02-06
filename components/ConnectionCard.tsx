import React, { useState } from 'react';
import { Card, CardHeader, SignalStrengthIcon, BatteryStatusIcon, SquareSwitch } from './UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from '../utils/GlobalStateContext';
import { setDialMode, setRoamingEnable } from '../utils/api';

interface ConnectionCardProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ onOpenSettings, onManageDevices, onShowPin, onShowPuk }) => {
  const { t } = useLanguage();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  const [switching, setSwitching] = useState<string | null>(null);

  const statusInfo = globalData.statusInfo;
  const connectionSettings = globalData.connectionSettings;

  const isConnected = statusInfo?.network_status === '1';
  const signalLevel = parseInt(statusInfo?.signal_lvl || '0', 10);
  const networkType = statusInfo?.network_type_str || t('noNetwork');
  const batteryStatus = statusInfo?.battery_status || '0';
  const batteryLevel = statusInfo?.battery_level || '0';
  const chargeStatus = statusInfo?.battery_charge_status || '0';
  const roamingEnabled = statusInfo?.roamingEnable === '1';
  const mobileDataEnabled = statusInfo?.dialMode === '1'; 
  
  const handleDataSwitch = async () => {
      if (!isLoggedIn) {
          onOpenSettings();
          return;
      }
      
      const newMode = statusInfo?.dialMode === '1' ? '0' : '1';
      setSwitching('data');
      try {
          const res = await setDialMode(newMode as '0' | '1');
          if (res && res.success) {
              // Optimistic update
              updateGlobalData('statusInfo', { ...statusInfo, dialMode: newMode });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setSwitching(null);
      }
  };

  const handleRoamingSwitch = async () => {
      if (!isLoggedIn) {
          onOpenSettings();
          return;
      }
      
      const newState = !roamingEnabled;
      setSwitching('roaming');
      try {
          const res = await setRoamingEnable(newState ? '1' : '0');
          if (res && res.success) {
              updateGlobalData('statusInfo', { ...statusInfo, roamingEnable: newState ? '1' : '0' });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setSwitching(null);
      }
  };

  // Check for PIN/PUK locks
  const isPinLocked = connectionSettings?.lock_pin_flag === '1';
  const isPukLocked = connectionSettings?.lock_puk_flag === '1';
  const simStatus = connectionSettings?.sim_status; // '1' is ready

  let statusText = isConnected ? t('connected') : t('notConnected');
  let statusColor = isConnected ? 'text-green-600' : 'text-gray-500';

  if (simStatus !== '1') {
      statusText = t('noSimAvailable');
      statusColor = 'text-red-500';
  } else if (isPukLocked) {
      statusText = t('pukCodeRequired');
      statusColor = 'text-red-500';
  } else if (isPinLocked) {
      statusText = t('pinCodeRequired');
      statusColor = 'text-red-500';
  }

  // Data Usage: Sum of 4 flows -> Auto convert KB/MB/GB
  const formatDataUsage = () => {
    if (!statusInfo) return "0.00 MB";
    const totalMb = 
      parseFloat(statusInfo.roam_dl_mon_flow || "0") + 
      parseFloat(statusInfo.roam_ul_mon_flow || "0") + 
      parseFloat(statusInfo.ul_mon_flow || "0") + 
      parseFloat(statusInfo.dl_mon_flow || "0");
    
    if (isNaN(totalMb)) return "0.00 MB";

    if (totalMb >= 1024) {
      return `${(totalMb / 1024).toFixed(2)} GB`;
    } else if (totalMb < 1 && totalMb > 0) {
      return `${(totalMb * 1024).toFixed(2)} KB`;
    }
    return `${totalMb.toFixed(2)} MB`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader 
        title={t('connection')} 
        extraIcons={
            <div className="flex items-center space-x-2">
                <SignalStrengthIcon level={signalLevel} className="h-5 w-6" barWidth="w-1" />
                <BatteryStatusIcon status={batteryStatus} level={batteryLevel} chargeStatus={chargeStatus} size={24} />
            </div>
        }
      />
      
      <div className="flex-1 p-6 flex flex-col justify-between">
        {/* Status Section */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className={`font-bold text-xl mb-1 ${statusColor}`}>{statusText}</h3>
                <p className="text-gray-500 text-sm font-bold">{networkType}</p>
                {/* Roaming Indicator */}
                {roamingEnabled && <span className="text-xs bg-gray-200 px-1 rounded text-gray-600 mt-1 inline-block">R</span>}
            </div>
            
            {/* Action Button for Locked State */}
            {(isPinLocked || isPukLocked) && isLoggedIn && (
                <button 
                    onClick={isPukLocked ? onShowPuk : onShowPin}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-sm transition-colors"
                >
                    {t('unlock')}
                </button>
            )}
        </div>

        {/* Switches */}
        <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
                <span className="font-bold text-black">{t('dataIs')}</span>
                <div className="flex items-center">
                    <span className="me-3 font-bold text-sm">{statusInfo?.dialMode === '1' ? t('on') : t('off')}</span>
                    <SquareSwitch 
                        isOn={statusInfo?.dialMode === '1'} 
                        onChange={handleDataSwitch} 
                        isLoading={switching === 'data'} 
                        disabled={isPinLocked || isPukLocked || !isLoggedIn}
                    />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-bold text-black">{t('roamingIs')}</span>
                <div className="flex items-center">
                    <span className="me-3 font-bold text-sm">{roamingEnabled ? t('on') : t('off')}</span>
                    <SquareSwitch 
                        isOn={roamingEnabled} 
                        onChange={handleRoamingSwitch} 
                        isLoading={switching === 'roaming'} 
                        disabled={isPinLocked || isPukLocked || !isLoggedIn}
                    />
                </div>
            </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
            <div>
                <div className="text-gray-500 font-bold mb-1">{t('timeElapsed')}</div>
                <div className="text-black font-bold text-lg">
                    {statusInfo?.time_elapsed 
                        ? (() => {
                            const sec = parseInt(statusInfo.time_elapsed);
                            const h = Math.floor(sec / 3600);
                            const m = Math.floor((sec % 3600) / 60);
                            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                        })() 
                        : "00:00"}
                </div>
            </div>
            <div>
                <div className="text-gray-500 font-bold mb-1">{t('dataUsage')}</div>
                <div className="text-black font-bold text-lg">{formatDataUsage()}</div>
            </div>
        </div>

        {/* Footer Link */}
        <div className="pt-4 border-t border-gray-100 mt-auto">
             <Link 
                to="/connection"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
            >
                {t('viewConnection')}
            </Link>
        </div>
      </div>
    </Card>
  );
};