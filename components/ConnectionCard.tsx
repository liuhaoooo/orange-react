
import React, { useState } from 'react';
import { Card, CardHeader, SquareSwitch, SignalStrengthIcon, BatteryStatusIcon } from './UIComponents';
import { Timer, ArrowUpDown, TabletSmartphone } from 'lucide-react';
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
    {/* Fixed height container (h-12 = 48px) increased from h-10 */}
    <div className="text-orange mb-3 h-12 w-full flex flex-col items-center justify-center">
        {topText && <div className="text-orange font-bold text-sm leading-none">{topText}</div>}
        {icon}
    </div>
    <div className="text-base text-black leading-tight mb-1">{label}</div>
    <div className="font-bold text-black text-lg">{value}</div>
  </div>
);

export const ConnectionCard: React.FC<ConnectionCardProps> = ({ onOpenSettings, onManageDevices }) => {
  const [isConnected, setIsConnected] = useState(false); // UI toggle, separated from API status for now
  const [isRoaming, setIsRoaming] = useState(false); // UI toggle
  const { t } = useLanguage();
  const { isLoggedIn, globalData } = useGlobalState();
  const statusInfo = globalData.statusInfo;

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

  // Battery Display Value logic: If status != 1 (No Battery), show --
  const getBatteryValue = () => {
    if (!statusInfo) return "0 %";
    if (statusInfo.battery_status !== '1') return "--";
    return `${statusInfo.battery_level} %`;
  };

  return (
    <Card className="h-full">
      <CardHeader title={t('connection')} />
      
      {/* Top Stats Row */}
      <div className="p-4 pt-8 pb-8 flex justify-between items-start border-b border-gray-200">
          <StatItem 
            icon={<Timer size={44} strokeWidth={1.5} />} 
            label={t('timeElapsed')} 
            value={statusInfo ? formatTime(statusInfo.time_elapsed) : "00:00:00"} 
          />
          <StatItem 
            icon={<ArrowUpDown size={44} strokeWidth={1.5} />} 
            label={t('dataUsage')} 
            value={formatDataUsage()} 
          />
          <StatItem 
            icon={<SignalStrengthIcon level={signalLevel} className="h-full w-14" />} 
            label={t('network')} 
            value={statusInfo?.network_type_str || t('noNetwork')} 
          />
          <StatItem 
            icon={
              <BatteryStatusIcon 
                status={statusInfo?.battery_status || '0'}
                chargeStatus={statusInfo?.battery_charge_status || '0'}
                level={statusInfo?.battery_level || '0'}
                size={44}
              />
            } 
            label={t('battery')} 
            value={getBatteryValue()} 
          />
          <StatItem 
            icon={<TabletSmartphone size={44} strokeWidth={1.5} />} 
            label={t('connected')} 
            value={getConnectedCount()} 
          />
      </div>

      {/* Toggles Section */}
      <div className="flex-1 flex flex-col p-6 pt-4">
        
        {/* Connection Toggle */}
        <div className="flex justify-between items-center py-5 border-b border-gray-200">
          <div className="flex flex-col items-start">
             <span className="font-bold text-black text-base">{getConnectionBoldText()}</span>
             <span className={`text-sm ${getConnectionSmallText().includes(t('on')) ? 'text-gray-500' : 'text-orange'}`}>
                {getConnectionSmallText()}
             </span>
          </div>
          <SquareSwitch isOn={isConnected} onChange={handleConnectionToggle} />
        </div>

        {/* Roaming Toggle */}
        <div className="flex justify-between items-center py-5 border-b border-gray-200">
          <div className="flex flex-col items-start">
             <span className="font-bold text-black text-base">{t('roaming')}</span>
             <span className="text-sm text-black">{getRoamingSmallText()}</span>
          </div>
          <SquareSwitch isOn={isRoaming} onChange={handleRoamingToggle} />
        </div>

        {/* Action Button */}
        <div className="mt-8">
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
