
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, SquareSwitch } from './UIComponents';
import { User, QrCode } from 'lucide-react';
import { WifiNetwork } from '../types';
import { useLanguage } from '../utils/i18nContext';
import { QrModal } from './QrModal';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';
import { updateConnectionSettings, fetchConnectionSettings } from '../utils/api';

interface WifiCardProps {
  onManageDevices: (ssid: string) => void;
  onOpenLogin: () => void;
  onEditSsid: (network: WifiNetwork) => void;
}

const FreqCheckbox = ({ label, checked }: { label: string, checked: boolean }) => (
  <div className="flex items-center me-4">
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

// Extended interface to store the API key for toggling
interface MappedWifiNetwork extends WifiNetwork {
    switchKey: string;
}

export const WifiCard: React.FC<WifiCardProps> = ({ onManageDevices, onOpenLogin, onEditSsid }) => {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  
  const { t } = useLanguage();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  const settings = globalData.connectionSettings || {};

  // Map API data to UI structure
  const networks: MappedWifiNetwork[] = useMemo(() => {
    return [
      {
        id: 'main_24',
        name: settings.main_wifi_ssid_24g || 'Main 2.4GHz',
        frequency: '2.4GHz',
        clients: 0, // Client count not available in 585
        hasQr: true,
        enabled: settings.main_wifi_switch_24g === '1',
        has24: true,
        has5: false,
        switchKey: 'main_wifi_switch_24g'
      },
      {
        id: 'main_5',
        name: settings.main_wifi_ssid_5g || 'Main 5GHz',
        frequency: '5GHz',
        clients: 0,
        hasQr: true,
        enabled: settings.main_wifi_switch_5g === '1',
        has24: false,
        has5: true,
        switchKey: 'main_wifi_switch_5g'
      },
      {
        id: 'guest_24',
        name: settings.guest_wifi_ssid_24g || 'Guest 2.4GHz',
        frequency: '2.4GHz',
        clients: 0,
        hasQr: true,
        enabled: settings.guest_wifi_switch_24g === '1',
        has24: true,
        has5: false,
        switchKey: 'guest_wifi_switch_24g'
      },
      {
        id: 'guest_5',
        name: settings.guest_wifi_ssid_5g || 'Guest 5GHz',
        frequency: '5GHz',
        clients: 0,
        hasQr: true,
        enabled: settings.guest_wifi_switch_5g === '1',
        has24: false,
        has5: true,
        switchKey: 'guest_wifi_switch_5g'
      }
    ];
  }, [settings]);

  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenLogin();
    } else {
      action();
    }
  };

  const toggleNetwork = async (network: MappedWifiNetwork) => {
    handleInteraction(async () => {
      setLoadingIds(prev => ({ ...prev, [network.id]: true }));
      const newVal = network.enabled ? '0' : '1';
      
      try {
          const payload = { [network.switchKey]: newVal };
          const res = await updateConnectionSettings(payload);
          
          if (res.success) {
               // Optimistically update
               if (settings) {
                   updateGlobalData('connectionSettings', { ...settings, [network.switchKey]: newVal });
               }
               // Refresh to ensure consistency
               fetchConnectionSettings().then(data => {
                   if (data && data.success) {
                       updateGlobalData('connectionSettings', data);
                   }
               });
          }
      } catch (e) {
          console.error("Failed to toggle wifi", e);
      } finally {
          setLoadingIds(prev => ({ ...prev, [network.id]: false }));
      }
    });
  };

  const openQrModal = (name: string) => {
    handleInteraction(() => {
      setSelectedNetwork(name);
      setIsQrModalOpen(true);
    });
  };

  const closeQrModal = () => {
      setIsQrModalOpen(false);
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader title={t('wifiNetworks')} />
        
        <div className="flex flex-col flex-1 relative">
          <div className="w-full">
            {networks.map((net) => (
              <div key={net.id} className="flex items-center p-4 border-b border-gray-200 min-h-[90px]">
                {/* Icon - Static display */}
                <div 
                  className="relative me-4"
                >
                  <User className="w-8 h-8 text-black fill-current" />
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold rtl:right-auto rtl:-left-1">
                    {net.clients}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pe-2">
                  <div className="font-bold text-base truncate text-black text-start mb-1">
                      {net.name}
                  </div>
                  <div className="flex items-center mt-1">
                      <FreqCheckbox label="2.4 GHz" checked={!!net.has24} />
                      <FreqCheckbox label="5 GHz" checked={!!net.has5} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4 shrink-0 rtl:space-x-reverse">
                  {/* QR Code visibility logic: Show if network is enabled AND it has QR capability */}
                  {net.enabled && net.hasQr && (
                      <QrCode 
                          className="w-6 h-6 cursor-pointer text-black hover:text-orange transition-colors" 
                          onClick={() => openQrModal(net.name)}
                      />
                  )}
                  <SquareSwitch 
                    isOn={net.enabled} 
                    onChange={() => toggleNetwork(net)}
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
        onClose={closeQrModal} 
        networkName={selectedNetwork} 
      />
    </>
  );
};
