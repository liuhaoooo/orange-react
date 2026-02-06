import React from 'react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Card, CardHeader, SignalStrengthIcon, BatteryStatusIcon } from '../components/UIComponents';
import { Settings } from 'lucide-react';
import { useNavigate } from '../utils/GlobalStateContext';
import timeElapsedSvg from '../assets/time_elapsed.svg';
import dataUsageSvg from '../assets/data_usage.svg';
import connectedSvg from '../assets/connected.svg';
import batterySvg from '../assets/battery.svg';

interface ConnectionPageProps {
  onOpenSettings: () => void;
  onManageDevices: () => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

export const ConnectionPage: React.FC<ConnectionPageProps> = ({ onOpenSettings, onManageDevices, onShowPin, onShowPuk }) => {
  const { t } = useLanguage();
  const { isLoggedIn, globalData } = useGlobalState();
  const navigate = useNavigate();
  const statusInfo = globalData.statusInfo;

  const handleSettingsClick = () => {
    if (!isLoggedIn) {
        onOpenSettings();
        return;
    }
    navigate('/settings', { 
        state: { sectionId: 'network', subTabId: 'network_config' } 
    });
  };

  const getBatteryValue = () => {
    if (!statusInfo) return "0 %";
    if (statusInfo.battery_status !== '1') return t('noBattery');
    return `${statusInfo.battery_level} %`;
  };

  const formatTime = (secondsStr?: string) => {
    if (!secondsStr) return "00:00:00";
    const totalSeconds = parseInt(secondsStr, 10);
    if (isNaN(totalSeconds)) return "00:00:00";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const formatDataUsage = () => {
    if (!statusInfo) return "0.00 MB";
    const total = 
      parseFloat(statusInfo.roam_dl_mon_flow || "0") + 
      parseFloat(statusInfo.roam_ul_mon_flow || "0") + 
      parseFloat(statusInfo.ul_mon_flow || "0") + 
      parseFloat(statusInfo.dl_mon_flow || "0");
    return `${total.toFixed(2)} MB`;
  };

  const getConnectedCount = () => {
    if (!statusInfo || !statusInfo.dhcp_list_info) return "0";
    if (Array.isArray(statusInfo.dhcp_list_info)) {
        return statusInfo.dhcp_list_info.length.toString();
    }
    return "0";
  };

  const signalLevel = parseInt(statusInfo?.signal_lvl || '0', 10);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-black">{t('connection')}</h1>
         <button 
           onClick={handleSettingsClick}
           className="bg-white border border-black px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-gray-50 transition-colors"
         >
            <Settings size={16} className="me-2" />
            {t('settings')}
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Status Card */}
          <Card className="h-full">
              <CardHeader title={t('networkStatus')} />
              <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="font-bold text-gray-500">{t('network')}</span>
                      <div className="flex items-center">
                          <span className="font-bold text-black me-2">{statusInfo?.network_type_str || t('noNetwork')}</span>
                          <SignalStrengthIcon level={signalLevel} className="h-6 w-8" barWidth="w-1" />
                      </div>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <span className="font-bold text-gray-500">{t('connection')}</span>
                      <span className={`font-bold ${statusInfo?.network_status === '1' ? 'text-green-600' : 'text-gray-400'}`}>
                          {statusInfo?.network_status === '1' ? t('connected') : t('notConnected')}
                      </span>
                  </div>
              </div>
          </Card>

          {/* Stats Card */}
          <Card className="h-full">
              <CardHeader title={t('dashboard')} /> 
              <div className="p-6 grid grid-cols-1 gap-6">
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
                      <div className="flex items-center">
                          <img src={timeElapsedSvg} alt="Time" className="w-10 h-10 me-4" />
                          <div className="flex flex-col">
                              <span className="text-gray-500 text-xs font-bold uppercase">{t('timeElapsed')}</span>
                              <span className="text-black font-bold text-lg">{formatTime(statusInfo?.time_elapsed)}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
                      <div className="flex items-center">
                          <img src={dataUsageSvg} alt="Data" className="w-10 h-10 me-4" />
                          <div className="flex flex-col">
                              <span className="text-gray-500 text-xs font-bold uppercase">{t('dataUsage')}</span>
                              <span className="text-black font-bold text-lg">{formatDataUsage()}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm">
                      <div className="flex items-center">
                          <img src={batterySvg} alt="Battery" className="w-10 h-10 me-4" />
                          <div className="flex flex-col">
                              <span className="text-gray-500 text-xs font-bold uppercase">{t('battery')}</span>
                              <span className="text-black font-bold text-lg">{getBatteryValue()}</span>
                          </div>
                      </div>
                      <BatteryStatusIcon 
                        status={statusInfo?.battery_status || '0'} 
                        chargeStatus={statusInfo?.battery_charge_status || '0'} 
                        level={statusInfo?.battery_level || '0'} 
                        size={32}
                      />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-sm cursor-pointer hover:bg-gray-100 transition-colors" onClick={onManageDevices}>
                      <div className="flex items-center">
                          <img src={connectedSvg} alt="Devices" className="w-10 h-10 me-4" />
                          <div className="flex flex-col">
                              <span className="text-gray-500 text-xs font-bold uppercase">{t('connectedDevices')}</span>
                              <span className="text-black font-bold text-lg">{getConnectedCount()}</span>
                          </div>
                      </div>
                  </div>

              </div>
          </Card>
      </div>
    </div>
  );
};