
import React, { useState, useMemo } from 'react';
import { Settings, User, QrCode } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { SquareSwitch } from '../components/UIComponents';
import { QrModal } from '../components/QrModal';
import { updateConnectionSettings, fetchConnectionSettings, fetchWifiSettings } from '../utils/api';

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
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  
  // Prefer wifiSettings (CMD 587) as it is more detailed, fallback to connectionSettings (CMD 585)
  // Both now return flat objects
  const settings = globalData.wifiSettings || globalData.connectionSettings || {};
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

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

  const updateSettings = async (updates: Record<string, string>, loadingKey: string) => {
    setLoadingIds(prev => ({ ...prev, [loadingKey]: true }));
    try {
        const res = await updateConnectionSettings(updates);
        if (res.success) {
             // Update local cache optimistically
             if (globalData.wifiSettings) {
                 updateGlobalData('wifiSettings', { ...globalData.wifiSettings, ...updates });
             }
             if (globalData.connectionSettings) {
                 updateGlobalData('connectionSettings', { ...globalData.connectionSettings, ...updates });
             }
             
             // Refresh Data from Server (CMD 587)
             fetchWifiSettings().then(res => {
                 if (res && res.success !== false) {
                     updateGlobalData('wifiSettings', res);
                 }
             });
        }
    } catch (e) {
        console.error("Failed to update wifi", e);
    } finally {
        setLoadingIds(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const toggleSplitNetwork = (net: PageWifiNetwork) => {
      handleInteraction(() => {
        const newVal = net.enabled ? '0' : '1';
        if (net.switchKey) {
            updateSettings({ [net.switchKey]: newVal }, net.id);
        }
      });
  };

  const toggleMergedNetwork = (net: PageWifiNetwork) => {
      handleInteraction(() => {
         const isAnyOn = net.enabled24 || net.enabled5;
         const newVal = isAnyOn ? '0' : '1';
         const updates: Record<string, string> = {};
         if (net.key24) updates[net.key24] = newVal;
         if (net.key5) updates[net.key5] = newVal;
         updateSettings(updates, net.id);
      });
  };

  const toggleMergedBand = (net: PageWifiNetwork, band: '24' | '5') => {
    handleInteraction(() => {
        const key = band === '24' ? net.key24 : net.key5;
        const current = band === '24' ? net.enabled24 : net.enabled5;
        const newVal = current ? '0' : '1';
        if (key) {
            updateSettings({ [key]: newVal }, net.id);
        }
    });
  };

  const openQr = (name: string) => {
      handleInteraction(() => {
          setSelectedNetwork(name);
          setIsQrModalOpen(true);
      });
  };

  const FreqCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
      <div 
        className="flex items-center me-4 cursor-pointer"
        onClick={onChange}
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
           onClick={onOpenSettings}
           className="bg-orange hover:bg-orange-dark text-black px-4 py-2 font-bold text-sm flex items-center transition-colors border border-orange"
         >
            <Settings size={16} className="me-2" />
            {t('settings')}
         </button>
      </div>

      <div className="bg-white p-6 shadow-sm border border-gray-200">
          <div className="border border-gray-300 max-h-[600px] overflow-y-auto">
              {networks.map((net, index) => (
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
                                  />
                                  <FreqCheckbox 
                                    label="5 GHz" 
                                    checked={!!net.enabled5} 
                                    onChange={() => toggleMergedBand(net, '5')}
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
                              onClick={() => openQr(net.name)}
                            />
                           )}
                           <SquareSwitch 
                            isOn={net.isMerged ? (!!net.enabled24 || !!net.enabled5) : !!net.enabled} 
                            onChange={() => net.isMerged ? toggleMergedNetwork(net) : toggleSplitNetwork(net)}
                            isLoading={loadingIds[net.id]} 
                           />
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <QrModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        networkName={selectedNetwork} 
      />
    </div>
  );
};
