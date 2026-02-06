import React, { useState } from 'react';
import { SignalStrengthIcon, BatteryStatusIcon, SquareSwitch } from '../components/UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { setDialMode, setRoamingEnable } from '../utils/api';
import { Loader2 } from 'lucide-react';

interface ConnectionPageProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

export const ConnectionPage: React.FC<ConnectionPageProps> = ({ onOpenSettings, onManageDevices, onShowPin, onShowPuk }) => {
  const { t } = useLanguage();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  const [switching, setSwitching] = useState<string | null>(null);

  const statusInfo = globalData.statusInfo || {};
  const connectionSettings = globalData.connectionSettings || {};

  const isConnected = statusInfo.network_status === '1';
  const signalLevel = parseInt(statusInfo.signal_lvl || '0', 10);
  const networkType = statusInfo.network_type_str || t('noNetwork');
  const batteryStatus = statusInfo.battery_status || '0';
  const batteryLevel = statusInfo.battery_level || '0';
  const chargeStatus = statusInfo.battery_charge_status || '0';
  const roamingEnabled = statusInfo.roamingEnable === '1';
  
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

  const handleDataSwitch = async () => {
      if (!isLoggedIn) {
          onOpenSettings();
          return;
      }
      
      const newMode = statusInfo.dialMode === '1' ? '0' : '1';
      setSwitching('data');
      try {
          const res = await setDialMode(newMode as '0' | '1');
          if (res && res.success) {
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
  const isPinLocked = connectionSettings.lock_pin_flag === '1';
  const isPukLocked = connectionSettings.lock_puk_flag === '1';
  const simStatus = connectionSettings.sim_status; 

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

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-black mb-6">{t('connection')}</h1>
      
      <div className="bg-white shadow-sm border border-gray-200 p-6 md:p-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-200">
              <div className="mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                      <h2 className={`text-2xl font-bold ${statusColor} me-4`}>{statusText}</h2>
                      {/* SIM Lock Actions */}
                      {(isPinLocked || isPukLocked) && isLoggedIn && (
                        <button 
                            onClick={isPukLocked ? onShowPuk : onShowPin}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded-sm transition-colors text-sm"
                        >
                            {t('unlock')}
                        </button>
                      )}
                  </div>
                  <p className="text-xl font-bold text-gray-500">{networkType}</p>
              </div>
              
              <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-500 font-bold mb-1">{t('network')}</span>
                      <SignalStrengthIcon level={signalLevel} className="h-8 w-10" barWidth="w-1.5" />
                  </div>
                  <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-500 font-bold mb-1">{t('battery')}</span>
                      <BatteryStatusIcon status={batteryStatus} level={batteryLevel} chargeStatus={chargeStatus} size={32} />
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              
              {/* Switches */}
              <div className="space-y-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-bold text-black text-lg">{t('dataIs')}</span>
                      <div className="flex items-center">
                          <span className="me-4 font-bold text-base text-gray-600">{statusInfo.dialMode === '1' ? t('on') : t('off')}</span>
                          <SquareSwitch 
                              isOn={statusInfo.dialMode === '1'} 
                              onChange={handleDataSwitch} 
                              isLoading={switching === 'data'} 
                              disabled={isPinLocked || isPukLocked || !isLoggedIn}
                          />
                      </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="font-bold text-black text-lg">{t('roamingIs')}</span>
                      <div className="flex items-center">
                          <span className="me-4 font-bold text-base text-gray-600">{roamingEnabled ? t('on') : t('off')}</span>
                          <SquareSwitch 
                              isOn={roamingEnabled} 
                              onChange={handleRoamingSwitch} 
                              isLoading={switching === 'roaming'} 
                              disabled={isPinLocked || isPukLocked || !isLoggedIn}
                          />
                      </div>
                  </div>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                  <div className="flex justify-between items-center py-3">
                      <span className="font-bold text-gray-500 text-lg">{t('timeElapsed')}</span>
                      <span className="font-bold text-black text-xl">
                        {statusInfo.time_elapsed 
                            ? (() => {
                                const sec = parseInt(statusInfo.time_elapsed);
                                const h = Math.floor(sec / 3600);
                                const m = Math.floor((sec % 3600) / 60);
                                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                            })() 
                            : "00:00"}
                      </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                      <span className="font-bold text-gray-500 text-lg">{t('dataUsage')}</span>
                      <span className="font-bold text-black text-xl">{formatDataUsage()}</span>
                  </div>
              </div>

          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => isLoggedIn ? onManageDevices() : onOpenSettings()}
                className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 text-base transition-colors rounded-none"
              >
                  {t('manageDevices')}
              </button>
          </div>

      </div>
    </div>
  );
};