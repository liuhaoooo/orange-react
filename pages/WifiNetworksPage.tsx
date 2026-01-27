
import React, { useState, useMemo } from 'react';
import { Settings, User, QrCode } from 'lucide-react';
import { useNavigate } from '../utils/GlobalStateContext';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { SquareSwitch } from '../components/UIComponents';
import { QrModal } from '../components/QrModal';
import { updateWifiConfig, fetchWifiSettings, WifiSettingsResponse } from '../utils/api';

interface WifiNetworksPageProps {
  onOpenSettings: () => void;
  onEditSsid: (network: any) => void;
  onOpenDevices: (ssid?: string) => void;
}

interface PageWifiNetwork {
  id: string;
  name: string;
  isMerged: boolean;
  
  // Merged
  enabled24?: boolean;
  enabled5?: boolean;
  key24?: string;
  key5?: string;
  
  // Split
  frequencyLabel?: string;
  enabled?: boolean;
  switchKey?: string;

  clients: number;
}

export const WifiNetworksPage: React.FC<WifiNetworksPageProps> = ({ onOpenSettings, onEditSsid, onOpenDevices }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  
  // Prefer wifiSettings (CMD 587) as it is more detailed, fallback to connectionSettings (CMD 585)
  const settings = globalData.wifiSettings || globalData.connectionSettings || {};
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState({ ssid: '', password: '', authType: '3' });
  // Loading counter
  const [loadingIds, setLoadingIds] = useState<Record<string, number>>({});

  const networks: PageWifiNetwork[] = useMemo(() => {
    const list: PageWifiNetwork[] = [];
    
    // Main WiFi Logic
    if (settings.main_wifiPriority === '1') {
        list.push({
            id: 'main_merged',
            name: settings.main_wifi_ssid_24g || 'Main Wi-Fi',
            isMerged: true,
            enabled24: settings.main_wifi_switch_24g === '1',
            enabled5: settings.main_wifi_switch_5g === '1',
            key24: 'main_wifi_switch_24g',
            key5: 'main_wifi_switch_5g',
            clients: 0
        });
    } else {
        list.push({
            id: 'main_24',
            name: settings.main_wifi_ssid_24g || 'Main 2.4GHz',
            isMerged: false,
            frequencyLabel: '2.4GHz',
            enabled: settings.main_wifi_switch_24g === '1',
            switchKey: 'main_wifi_switch_24g',
            clients: 0
        });
        list.push({
            id: 'main_5',
            name: settings.main_wifi_ssid_5g || 'Main 5GHz',
            isMerged: false,
            frequencyLabel: '5GHz',
            enabled: settings.main_wifi_switch_5g === '1',
            switchKey: 'main_wifi_switch_5g',
            clients: 0
        });
    }

    // Guest WiFi Logic
    if (settings.guest_wifiPriority === '1') {
        list.push({
            id: 'guest_merged',
            name: settings.guest_wifi_ssid_24g || 'Guest Wi-Fi',
            isMerged: true,
            enabled24: settings.guest_wifi_switch_24g === '1',
            enabled5: settings.guest_wifi_switch_5g === '1',
            key24: 'guest_wifi_switch_24g',
            key5: 'guest_wifi_switch_5g',
            clients: 0
        });
    } else {
        list.push({
            id: 'guest_24',
            name: settings.guest_wifi_ssid_24g || 'Guest 2.4GHz',
            isMerged: false,
            frequencyLabel: '2.4GHz',
            enabled: settings.guest_wifi_switch_24g === '1',
            switchKey: 'guest_wifi_switch_24g',
            clients: 0
        });
        list.push({
            id: 'guest_5',
            name: settings.guest_wifi_ssid_5g || 'Guest 5GHz',
            isMerged: false,
            frequencyLabel: '5GHz',
            enabled: settings.guest_wifi_switch_5g === '1',
            switchKey: 'guest_wifi_switch_5g',
            clients: 0
        });
    }
    return list;
  }, [settings]);

  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenSettings();
    } else {
      action();
    }
  };

  const handleSettingsClick = () => {
    if (!isLoggedIn) {
        onOpenSettings();
        return;
    }
    navigate('/settings', { 
        state: { sectionId: 'wifi', subTabId: 'adv_settings_24' } 
    });
  };

  const performUpdate = async (
    prefix: 'main' | 'guest',
    band: '24g' | '5g',
    newEnabledState: boolean,
    loadingKey: string
  ) => {
      setLoadingIds(prev => ({ ...prev, [loadingKey]: (prev[loadingKey] || 0) + 1 }));
      
      const s = globalData.wifiSettings || globalData.connectionSettings || {};
      
      const ssidKey = `${prefix}_wifi_ssid_${band}`;
      const passKey = `${prefix}_password_${band}`;
      const authKey = `${prefix}_authenticationType_${band}`;
      const broadcastKey = `${prefix}_wifi_broadcast_${band}`;
      const priorityKey = `${prefix}_wifiPriority`; 
      
      const payload = {
          is5g: band === '5g',
          isGuest: prefix === 'guest',
          wifiOpen: newEnabledState ? '1' : '0',
          ssid: s[ssidKey] || '',
          key: s[passKey] || '',
          authenticationType: s[authKey] || '3',
          broadcast: s[broadcastKey] || '1',
          wifiSames: s[priorityKey] || '0'
      };

      try {
          const res = await updateWifiConfig(payload);
          if (res.success) {
               const switchKey = `${prefix}_wifi_switch_${band}`;
               const updates = { [switchKey]: newEnabledState ? '1' : '0' };

               if (globalData.wifiSettings) {
                   updateGlobalData('wifiSettings', { ...globalData.wifiSettings, ...updates });
               }
               if (globalData.connectionSettings) {
                   updateGlobalData('connectionSettings', { ...globalData.connectionSettings, ...updates });
               }
               
               fetchWifiSettings().then(res => {
                   if (res && res.success !== false) {
                       updateGlobalData('wifiSettings', res);
                   }
               });
          }
      } catch (e) {
          console.error("Failed to update wifi", e);
      } finally {
          setLoadingIds(prev => ({ ...prev, [loadingKey]: Math.max(0, (prev[loadingKey] || 1) - 1) }));
      }
  };

  const toggleSplitNetwork = (net: PageWifiNetwork) => {
      handleInteraction(() => {
        const parts = net.id.split('_');
        const prefix = parts[0] as 'main' | 'guest';
        const band = parts[1] === '5' ? '5g' : '24g';
        const newState = !net.enabled;
        performUpdate(prefix, band, newState, net.id);
      });
  };

  const toggleMergedNetwork = (net: PageWifiNetwork) => {
      handleInteraction(async () => {
         const isAnyOn = net.enabled24 || net.enabled5;
         const newState = !isAnyOn;
         const prefix = net.id.startsWith('guest') ? 'guest' : 'main';
         await Promise.all([
             performUpdate(prefix, '24g', newState, net.id),
             performUpdate(prefix, '5g', newState, net.id)
         ]);
      });
  };

  const toggleMergedBand = (net: PageWifiNetwork, bandKey: '24' | '5') => {
    handleInteraction(() => {
        const prefix = net.id.startsWith('guest') ? 'guest' : 'main';
        const band = bandKey === '5' ? '5g' : '24g';
        const current = bandKey === '5' ? net.enabled5 : net.enabled24;
        const newState = !current;
        performUpdate(prefix, band, newState, net.id);
    });
  };

  const openQr = (net: PageWifiNetwork) => {
      handleInteraction(() => {
          const isGuest = net.id.startsWith('guest');
          const prefix = isGuest ? 'guest' : 'main';
          
          const is5gOnly = net.id.endsWith('_5') && !net.isMerged;
          const band = is5gOnly ? '5g' : '24g';

          const ssidKey = `${prefix}_wifi_ssid_${band}`;
          const passKey = `${prefix}_password_${band}`;
          const authKey = `${prefix}_authenticationType_${band}`;

          setQrData({
              ssid: settings[ssidKey] || net.name,
              password: settings[passKey] || '',
              authType: settings[authKey] || '3'
          });
          setIsQrModalOpen(true);
      });
  };

  const FreqCheckbox = ({ label, checked, onChange, disabled }: { label: string, checked: boolean, onChange: () => void, disabled?: boolean }) => (
      <div 
        className={`flex items-center me-4 ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
        onClick={() => !disabled && onChange()}
      >
          <div className={`w-4 h-4 border flex items-center justify-center me-1.5 ${checked ? 'border-gray-400 bg-gray-100' : 'border-gray-300 bg-white'}`}>
             {checked && <div className="w-2.5 h-2.5 bg-gray-400" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)', backgroundColor: '#9ca3af' }}></div>}
          </div>
          <span className={`text-sm ${checked ? 'text-gray-400' : 'text-gray-300'}`}>{label}</span>
      </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold text-black">{t('wifiNetworks')}</h1>
         <button 
           onClick={handleSettingsClick}
           className="bg-orange hover:bg-orange-dark text-black px-4 py-2 font-bold text-sm flex items-center transition-colors border border-orange"
         >
            <Settings size={16} className="me-2" />
            {t('settings')}
         </button>
      </div>

      <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="border border-gray-300 max-h-[600px] overflow-y-auto">
              {networks.map((net, index) => {
                  const isLoading = (loadingIds[net.id] || 0) > 0;
                  
                  return (
                  <div 
                      key={net.id} 
                      className={`flex items-center p-4 min-h-[90px] ${index !== networks.length - 1 ? 'border-b border-gray-200' : ''}`}
                  >
                      <div className="me-4 relative shrink-0 cursor-pointer" onClick={() => handleInteraction(() => onOpenDevices(net.name))}>
                           <div className="bg-gray-100 p-2 rounded-sm">
                              <User className="w-6 h-6 text-black fill-current" />
                           </div>
                           <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                              {net.clients}
                           </div>
                      </div>

                      <div className="flex-1 min-w-0 pe-4">
                          <div 
                              className="font-bold text-black text-sm mb-1 cursor-pointer hover:text-orange transition-colors"
                              onClick={() => handleInteraction(() => onEditSsid({ ...net, frequency: net.frequencyLabel || (net.isMerged ? '2.4GHz' : '') }))}
                          >
                              {net.name}
                          </div>
                          
                          {net.isMerged ? (
                              <div className="flex items-center">
                                  <FreqCheckbox 
                                    label="2.4 GHz" 
                                    checked={!!net.enabled24} 
                                    onChange={() => toggleMergedBand(net, '24')}
                                    disabled={isLoading}
                                  />
                                  <FreqCheckbox 
                                    label="5 GHz" 
                                    checked={!!net.enabled5} 
                                    onChange={() => toggleMergedBand(net, '5')}
                                    disabled={isLoading}
                                  />
                              </div>
                          ) : (
                              <div className="flex items-center">
                                  <span className="text-xs text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded-sm">
                                      {net.frequencyLabel}
                                  </span>
                              </div>
                          )}
                      </div>

                      <div className="flex items-center space-x-4 rtl:space-x-reverse shrink-0">
                           {((net.isMerged && (net.enabled24 || net.enabled5)) || (!net.isMerged && net.enabled)) && (
                            <QrCode 
                              className="w-6 h-6 cursor-pointer text-black hover:text-orange transition-colors"
                              onClick={() => openQr(net)}
                            />
                           )}
                           <SquareSwitch 
                            isOn={net.isMerged ? (!!net.enabled24 || !!net.enabled5) : !!net.enabled} 
                            onChange={() => net.isMerged ? toggleMergedNetwork(net) : toggleSplitNetwork(net)}
                            isLoading={isLoading} 
                           />
                      </div>
                  </div>
              )})}
          </div>
      </div>

      <QrModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        ssid={qrData.ssid}
        password={qrData.password}
        authType={qrData.authType}
      />
    </div>
  );
};
