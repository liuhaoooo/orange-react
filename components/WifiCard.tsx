
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
  { id: '1', name: 'Orange Airbox3', frequency: '2.4GHz', clients: 20, hasQr: true, enabled: true, has24: true, has5: true },
  { id: '2', name: 'Orange Airbox55', frequency: '5GHz', clients: 5, hasQr: true, enabled: true, has24: false, has5: true },
  { id: '3', name: 'Orange Airbox87469', frequency: '2.4GHz', clients: 5, hasQr: true, enabled: true, has24: true, has5: false },
];

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
                    onChange={() => toggleNetwork(net.id)} 
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
