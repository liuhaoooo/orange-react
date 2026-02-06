
import React, { useState } from 'react';
import { Settings, Link as LinkIcon, Globe, Monitor, Smartphone } from 'lucide-react';
import { useNavigate } from '../utils/GlobalStateContext';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { SquareSwitch, Card, SignalStrengthIcon, BatteryStatusIcon } from '../components/UIComponents';
import { setDialMode, setRoamingEnable, fetchConnectionSettings } from '../utils/api';
import timeElapsedSvg from '../assets/time_elapsed.svg';
import dataUsageSvg from '../assets/data_usage.svg';
import connectedSvg from '../assets/connected.svg';

interface ConnectionPageProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

const StatBox: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  topText?: string 
}> = ({ icon, label, value, topText }) => (
  <div className="bg-white border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-[200px] shadow-sm">
    {/* Fixed height container (h-[60px]) to match large icon size and ensure alignment across grid */}
    <div className="text-orange mb-4 h-[60px] w-full flex flex-col items-center justify-center">
        {topText && <div className="text-orange font-bold text-sm leading-none">{topText}</div>}
        {icon}
    </div>
    <div className="text-base text-gray-800 leading-tight mb-2">{label}</div>
    <div className="font-bold text-black text-xl">{value}</div>
  </div>
);

export const ConnectionPage: React.FC<ConnectionPageProps> = ({ onOpenSettings, onManageDevices, onShowPin, onShowPuk }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  
  const statusInfo = globalData.statusInfo;
  const connectionSettings = globalData.connectionSettings;

  const [isConnLoading, setIsConnLoading] = useState(false);
  const [isRoamLoading, setIsRoamLoading] = useState(false);

  // Determine switch state from CMD 1020 data
  const isConnected = connectionSettings?.dialMode === '1';
  const isRoaming = connectionSettings?.roamingEnable === '1';

  const handleInteraction = (action: () => void, checkSimLocks: boolean = false) => {
    if (!isLoggedIn) {
      onOpenSettings();
      return;
    }

    if (checkSimLocks) {
        // 1. Check PUK Lock (Highest Priority)
        if (connectionSettings?.lock_puk_flag === '1') {
            onShowPuk();
            return;
        }

        // 2. Check PIN Lock
        if (connectionSettings?.lock_pin_flag === '1') {
            onShowPin();
            return;
        }
    }

    action();
  };

  const handleConnectionToggle = () => handleInteraction(async () => {
    setIsConnLoading(true);
    const newVal = isConnected ? '0' : '1';
    
    try {
        const res = await setDialMode(newVal);
        if (res.success) {
            // Optimistic Update
            if (connectionSettings) {
                updateGlobalData('connectionSettings', { ...connectionSettings, dialMode: newVal });
            }
             // Refresh data to be sure
             fetchConnectionSettings().then(data => {
                if(data && data.dialMode) {
                    updateGlobalData('connectionSettings', data);
                }
             });
        }
    } catch (e) {
        console.error("Failed to update dialMode", e);
    } finally {
        setIsConnLoading(false);
    }
  }, true);

  const handleRoamingToggle = () => handleInteraction(async () => {
    setIsRoamLoading(true);
    const newVal = isRoaming ? '0' : '1';

    try {
        const res = await setRoamingEnable(newVal);
        if (res.success) {
            // Optimistic Update
            if (connectionSettings) {
                updateGlobalData('connectionSettings', { ...connectionSettings, roamingEnable: newVal });
            }
             // Refresh data to be sure
             fetchConnectionSettings().then(data => {
                if(data && data.roamingEnable) {
                    updateGlobalData('connectionSettings', data);
                }
             });
        }
    } catch (e) {
        console.error("Failed to update roamingEnable", e);
    } finally {
        setIsRoamLoading(false);
    }
  }, true);

  const handleManageDevicesClick = () => handleInteraction(() => onManageDevices(), false);

  const handleSettingsClick = () => {
    if (!isLoggedIn) {
        onOpenSettings();
        return;
    }
    // Navigate to Settings -> Network -> APN Settings
    navigate('/settings', { 
        state: { sectionId: 'network', subTabId: 'apn_settings' } 
    });
  };

  // --- Logic for status texts ---

  const getConnectionBoldText = () => {
    if (statusInfo?.network_status === "1") return t('connected');
    return t('notConnected');
  };

  const getConnectionSmallText = () => {
    if (!statusInfo) return `${t('dataIs')} ${isConnected ? t('on') : t('off')}`;
    
    if (statusInfo.flightMode === "1") return t('flightModeOn');
    if (statusInfo.lock_puk_flag === "1") return t('pukCodeRequired');
    if (statusInfo.lock_pin_flag === "1") return t('pinCodeRequired');
    if (statusInfo.sim_status !== "1") return t('noSimAvailable');
    if (statusInfo.wan_network_status !== "1" && !statusInfo.network_type_str) return t('noAvailableNetwork');
    if (!statusInfo.network_type_str) return t('noInternetConnection');
    
    // Fallback based on switch
    return `${t('dataIs')} ${isConnected ? t('on') : t('off')}`;
  };

  const getRoamingSmallText = () => {
    if (!statusInfo) return `${t('roamingIs')} ${isRoaming ? t('on') : t('off')}`;
    
    if (statusInfo.flightMode === "1") return t('flightModeOn');
    if (statusInfo.lock_puk_flag === "1") return t('pukCodeRequired');
    if (statusInfo.lock_pin_flag === "1") return t('pinCodeRequired');
    if (statusInfo.sim_status !== "1") return t('noSimAvailable');
    if (statusInfo.wan_network_status !== "1" && !statusInfo.network_type_str) return t('noAvailableNetwork');
    if (!statusInfo.network_type_str) return t('noInternetConnection');

    // Fallback based on switch
    return `${t('roamingIs')} ${isRoaming ? t('on') : t('off')}`;
  };

  // --- Format Data ---
  
  // Time Elapsed: Seconds to HH:MM:SS
  const formatTime = (secondsStr: string) => {
    if (!secondsStr) return "00:00:00";
    const totalSeconds = parseInt(secondsStr, 10);
    if (isNaN(totalSeconds)) return "00:00:00";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Data Usage: Sum of 4 flows -> Fixed to 2 decimals + MB
  const formatDataUsage = () => {
    if (!statusInfo) return "0.00 MB";
    const total = 
      parseFloat(statusInfo.roam_dl_mon_flow || "0") + 
      parseFloat(statusInfo.roam_ul_mon_flow || "0") + 
      parseFloat(statusInfo.ul_mon_flow || "0") + 
      parseFloat(statusInfo.dl_mon_flow || "0");
    return `${total.toFixed(2)} MB`;
  };

  // Connected Devices Count
  const getConnectedCount = () => {
    if (!statusInfo || !statusInfo.dhcp_list_info) return "0";
    if (Array.isArray(statusInfo.dhcp_list_info)) {
        return statusInfo.dhcp_list_info.length.toString();
    }
    return "0";
  };

  const signalLevel = parseInt(statusInfo?.signal_lvl || '0', 10);

  // Battery Display Value logic
  const getBatteryValue = () => {
    if (!statusInfo) return "0 %";
    if (statusInfo.battery_status !== '1') return "--";
    return `${statusInfo.battery_level} %`;
  };

  return (
    <div className="w-full">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-black">{t('connection')}</h1>
         <button 
           onClick={handleSettingsClick}
           className="border border-black bg-white hover:bg-gray-50 text-black px-4 py-2 font-bold text-sm flex items-center transition-colors"
         >
            <Settings size={16} className="me-2" />
            {t('settings')}
         </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
          <StatBox 
            icon={<img src={timeElapsedSvg} alt="Time Elapsed" className="w-[60px] h-[60px]" />} 
            label={t('timeElapsed')} 
            value={statusInfo ? formatTime(statusInfo.time_elapsed) : "00:00:00"} 
          />
          <StatBox 
            icon={<img src={dataUsageSvg} alt="Data Usage" className="w-[60px] h-[60px]" />} 
            label={t('dataUsage')} 
            value={formatDataUsage()} 
          />
          <StatBox 
            icon={<SignalStrengthIcon level={signalLevel} className="h-full w-16" barWidth="w-2" />} 
            label={t('network')} 
            value={statusInfo?.network_type_str || t('noNetwork')} 
          />
          <StatBox 
            icon={
                <BatteryStatusIcon 
                    status={statusInfo?.battery_status || '0'}
                    chargeStatus={statusInfo?.battery_charge_status || '0'}
                    level={statusInfo?.battery_level || '0'}
                    size={60}
                />
            } 
            label={t('battery')} 
            value={getBatteryValue()} 
          />
          <StatBox 
            icon={<img src={connectedSvg} alt="Connected" className="w-[60px] h-[60px]" />} 
            label={t('connected')} 
            value={getConnectedCount()} 
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
                        <span className="font-bold text-black text-lg mb-1">{getConnectionBoldText()}</span>
                        <span className="text-sm text-gray-500">
                            {getConnectionSmallText()}
                        </span>
                    </div>
                </div>
                <SquareSwitch 
                    isOn={isConnected} 
                    onChange={handleConnectionToggle} 
                    isLoading={isConnLoading}
                />
            </div>

            {/* Roaming Row */}
            <div className="flex justify-between items-center p-6 min-h-[120px]">
                <div className="flex items-center">
                   <div className="bg-gray-100 p-2.5 rounded-sm me-5">
                      <Globe size={32} className="text-black" />
                   </div>
                   <div className="flex flex-col items-start">
                        <span className="font-bold text-black text-lg mb-1">{t('roaming')}</span>
                        {/* Changed text-black to text-gray-500 */}
                        <span className="text-sm text-gray-500">{getRoamingSmallText()}</span>
                    </div>
                </div>
                <SquareSwitch 
                    isOn={isRoaming} 
                    onChange={handleRoamingToggle} 
                    isLoading={isRoamLoading}
                />
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
