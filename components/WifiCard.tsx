
import React, { useState } from 'react';
import { Card, CardHeader, SquareSwitch } from './UIComponents';
import { User, QrCode } from 'lucide-react';
import { WifiNetwork } from '../types';
import { useLanguage } from '../utils/i18nContext';
import { QrModal } from './QrModal';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';

interface WifiCardProps {
  onManageDevices: (ssid: string) => void;
  onOpenLogin: () => void;
  onEditSsid: (network: WifiNetwork) => void;
}

const initialNetworks: WifiNetwork[] = [
  { id: '1', name: 'Flybox-KAV1', frequency: '2.4GHz', clients: 3, hasQr: true, enabled: true },
  { id: '2', name: '!OFlybox-liuhao-test-5G', frequency: '5GHz', clients: 2, hasQr: true, enabled: true },
  { id: '3', name: 'Flybox-KAV1-GUEST', frequency: '2.4GHz', clients: 0, hasQr: true, enabled: false, isGuest: true },
  { id: '4', name: 'Flybox-KAV1-GUEST-5G', frequency: '5GHz', clients: 0, hasQr: true, enabled: false, isGuest: true },
];

export const WifiCard: React.FC<WifiCardProps> = ({ onManageDevices, onOpenLogin, onEditSsid }) => {
  const [networks, setNetworks] = useState<WifiNetwork[]>(initialNetworks);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();

  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenLogin();
    } else {
      action();
    }
  };

  const toggleNetwork = (id: string) => {
    handleInteraction(() => {
      setNetworks(prev => prev.map(net => 
        net.id === id ? { ...net, enabled: !net.enabled } : net
      ));
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
              <div key={net.id} className="flex items-center p-3 border-b border-gray-200 min-h-[80px]">
                {/* Icon - Static display */}
                <div 
                  className="relative me-3"
                >
                  <User className="w-6 h-6 text-black fill-current" />
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold rtl:right-auto rtl:-left-1">
                    {net.clients}
                  </div>
                </div>

                {/* Info - Static display */}
                <div className="flex-1 min-w-0 pe-2">
                  <div className="font-bold text-sm truncate text-black text-start">
                      {net.name}
                  </div>
                  <div className="text-xs text-black text-start">{net.frequency}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 shrink-0 rtl:space-x-reverse">
                  {/* QR Code visibility logic: Show if network is enabled AND it has QR capability */}
                  {net.enabled && net.hasQr && (
                      <QrCode 
                          className="w-5 h-5 cursor-pointer text-black hover:text-orange transition-colors" 
                          onClick={() => openQrModal(net.name)}
                      />
                  )}
                  <SquareSwitch 
                    isOn={net.enabled} 
                    onChange={() => toggleNetwork(net.id)} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-4">
              <Link 
                to="/wifi"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 text-sm transition-colors rounded-none"
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
