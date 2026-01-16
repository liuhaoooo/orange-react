
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, SquareSwitch } from './UIComponents';
import { User, QrCode } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { QrModal } from './QrModal';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';
import { updateConnectionSettings, fetchConnectionSettings, fetchWifiSettings } from '../utils/api';

interface WifiCardProps {
  onManageDevices: (ssid: string) => void;
  onOpenLogin: () => void;
  onEditSsid: (network: any) => void;
}

// Interactive Checkbox for Merged Mode
const FreqCheckbox = ({ 
    label, 
    checked, 
    onChange, 
    disabled 
}: { 
    label: string, 
    checked: boolean, 
    onChange?: () => void,
    disabled?: boolean
}) => (
  <div 
    className={`flex items-center me-4 ${!disabled && onChange ? 'cursor-pointer' : ''}`}
    onClick={() => !disabled && onChange && onChange()}
  >
      <div className={`w-4 h-4 border flex items-center justify-center me-2 ${checked ? 'border-gray-400 bg-gray-100' : 'border-gray-300 bg-white'}`}>
         {checked && (
             <div 
                className="w-2.5 h-2.5 bg-gray-500" 
                style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }}
             />
         )}
      </div>
      <span className={`text-sm font-bold ${checked ? 'text-gray-500' : 'text-gray-300'}`}>{label}</span>
  </div>
);

interface MappedNetwork {
    id: string;
    name: string; // Display Name (SSID)
    isMerged: boolean;
    
    // For Merged
    enabled24?: boolean;
    enabled5?: boolean;
    key24?: string;
    key5?: string;
    
    // For Split
    frequencyLabel?: string;
    enabled?: boolean;
    switchKey?: string;

    clients: number;
    hasQr: boolean;
}

export const WifiCard: React.FC<WifiCardProps> = ({ onManageDevices, onOpenLogin, onEditSsid }) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  
  const { t } = useLanguage();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  
  // Prefer wifiSettings (CMD 587) as it is more detailed, fallback to connectionSettings (CMD 585)
  const settings = globalData.wifiSettings || globalData.connectionSettings || {};

  // Dynamic Data Mapping based on Priority
  const networks: MappedNetwork[] = useMemo(() => {
    const list: MappedNetwork[] = [];
    
    // --- Main WiFi Logic ---
    if (settings.main_wifiPriority === '1') {
        // Merged Row
        list.push({
            id: 'main_merged',
            name: settings.main_wifi_ssid_24g || 'Main Wi-Fi',
            isMerged: true,
            enabled24: settings.main_wifi_switch_24g === '1',
            enabled5: settings.main_wifi_switch_5g === '1',
            key24: 'main_wifi_switch_24g',
            key5: 'main_wifi_switch_5g',
            clients: 0,
            hasQr: true
        });
    } else {
        // Split Rows
        list.push({
            id: 'main_24',
            name: settings.main_wifi_ssid_24g || 'Main 2.4GHz',
            isMerged: false,
            frequencyLabel: '2.4GHz',
            enabled: settings.main_wifi_switch_24g === '1',
            switchKey: 'main_wifi_switch_24g',
            clients: 0,
            hasQr: true
        });
        list.push({
            id: 'main_5',
            name: settings.main_wifi_ssid_5g || 'Main 5GHz',
            isMerged: false,
            frequencyLabel: '5GHz',
            enabled: settings.main_wifi_switch_5g === '1',
            switchKey: 'main_wifi_switch_5g',
            clients: 0,
            hasQr: true
        });
    }

    // --- Guest WiFi Logic ---
    if (settings.guest_wifiPriority === '1') {
        // Merged Row
        list.push({
            id: 'guest_merged',
            name: settings.guest_wifi_ssid_24g || 'Guest Wi-Fi',
            isMerged: true,
            enabled24: settings.guest_wifi_switch_24g === '1',
            enabled5: settings.guest_wifi_switch_5g === '1',
            key24: 'guest_wifi_switch_24g',
            key5: 'guest_wifi_switch_5g',
            clients: 0,
            hasQr: true
        });
    } else {
        // Split Rows
        list.push({
            id: 'guest_24',
            name: settings.guest_wifi_ssid_24g || 'Guest 2.4GHz',
            isMerged: false,
            frequencyLabel: '2.4GHz',
            enabled: settings.guest_wifi_switch_24g === '1',
            switchKey: 'guest_wifi_switch_24g',
            clients: 0,
            hasQr: true
        });
        list.push({
            id: 'guest_5',
            name: settings.guest_wifi_ssid_5g || 'Guest 5GHz',
            isMerged: false,
            frequencyLabel: '5GHz',
            enabled: settings.guest_wifi_switch_5g === '1',
            switchKey: 'guest_wifi_switch_5g',
            clients: 0,
            hasQr: true
        });
    }

    return list;
  }, [settings]);

  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenLogin();
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

               fetchWifiSettings().then(data => {
                   if (data && data.success !== false) {
                       updateGlobalData('wifiSettings', data);
                   }
               });
          }
      } catch (e) {
          console.error("Failed to update wifi", e);
      } finally {
          setLoadingIds(prev => ({ ...prev, [loadingKey]: false }));
      }
  };

  // Toggle Single Switch (Split Mode)
  const toggleSplitNetwork = (net: MappedNetwork) => {
    handleInteraction(() => {
      const newVal = net.enabled ? '0' : '1';
      if (net.switchKey) {
          updateSettings({ [net.switchKey]: newVal }, net.id);
      }
    });
  };

  // Toggle Merged Switch (Controls Both)
  const toggleMergedNetwork = (net: MappedNetwork) => {
    handleInteraction(() => {
       const isAnyOn = net.enabled24 || net.enabled5;
       const newVal = isAnyOn ? '0' : '1';
       
       const updates: Record<string, string> = {};
       if (net.key24) updates[net.key24] = newVal;
       if (net.key5) updates[net.key5] = newVal;
       
       updateSettings(updates, net.id);
    });
  };

  // Toggle Individual Band in Merged Mode
  const toggleMergedBand = (net: MappedNetwork, band: '24' | '5') => {
      handleInteraction(() => {
          const key = band === '24' ? net.key24 : net.key5;
          const current = band === '24' ? net.enabled24 : net.enabled5;
          const newVal = current ? '0' : '1';
          
          if (key) {
              updateSettings({ [key]: newVal }, net.id);
          }
      });
  };

  const openQrModal = (name: string) => {
    handleInteraction(() => {
      setSelectedNetwork(name);
      setIsQrModalOpen(true);
    });
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader title={t('wifiNetworks')} />
        
        <div className="flex flex-col flex-1 relative">
          <div className="w-full">
            {networks.map((net) => (
              <div key={net.id} className="flex items-center p-4 border-b border-gray-200 min-h-[90px]">
                {/* Icon */}
                <div className="relative me-4 shrink-0">
                  <User className="w-8 h-8 text-black fill-current" />
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold rtl:right-auto rtl:-left-1">
                    {net.clients}
                  </div>
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0 pe-2">
                  <div className="font-bold text-base truncate text-black text-start mb-1">
                      {net.name}
                  </div>
                  
                  {net.isMerged ? (
                      /* Merged Mode: Show Checkboxes */
                      <div className="flex items-center mt-1">
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
                      /* Split Mode: Show Label Only */
                      <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded-sm">
                              {net.frequencyLabel}
                          </span>
                      </div>
                  )}
                </div>

                {/* Actions Area */}
                <div className="flex items-center space-x-4 shrink-0 rtl:space-x-reverse">
                  {/* QR: Show if enabled. For merged, if any is enabled. */}
                  {((net.isMerged && (net.enabled24 || net.enabled5)) || (!net.isMerged && net.enabled)) && net.hasQr && (
                      <QrCode 
                          className="w-6 h-6 cursor-pointer text-black hover:text-orange transition-colors" 
                          onClick={() => openQrModal(net.name)}
                      />
                  )}
                  
                  {/* Switch */}
                  <SquareSwitch 
                    isOn={net.isMerged ? (!!net.enabled24 || !!net.enabled5) : !!net.enabled} 
                    onChange={() => net.isMerged ? toggleMergedNetwork(net) : toggleSplitNetwork(net)}
                    isLoading={loadingIds[net.id]} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-6">
              <Link 
                to="/wifi"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
              >
                {t('viewWifiNetworks')}
              </Link>
           </div>
        </div>
      </Card>
      
      <QrModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        networkName={selectedNetwork} 
      />
    </>
  );
};
