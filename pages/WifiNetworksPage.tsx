
import React, { useState } from 'react';
import { Settings, User, QrCode, Wifi } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { SquareSwitch } from '../components/UIComponents';
import { QrModal } from '../components/QrModal';

interface WifiNetworksPageProps {
  onOpenSettings: () => void;
  onEditSsid: (network: any) => void;
  onOpenDevices: (ssid?: string) => void;
}

interface PageWifiNetwork {
  id: string;
  name: string;
  clients: number;
  has24: boolean;
  has5: boolean;
  enabled: boolean;
  description?: string;
}

const mockNetworks: PageWifiNetwork[] = [
  { id: '1', name: 'Orange Airbox3', clients: 20, has24: true, has5: true, enabled: true },
  { id: '2', name: 'Orange Airbox55', clients: 5, has24: false, has5: true, enabled: true },
  { id: '3', name: 'Orange Airbox87469', clients: 5, has24: true, has5: false, enabled: true },
  { id: '4', name: 'Guest wifi network 1', clients: 20, has24: true, has5: true, enabled: true, description: 'guestWifiDesc' },
  { id: '5', name: 'Guest wifi network 2', clients: 5, has24: true, has5: true, enabled: true, description: 'guestWifiDesc' },
];

export const WifiNetworksPage: React.FC<WifiNetworksPageProps> = ({ onOpenSettings, onEditSsid, onOpenDevices }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();
  const [networks, setNetworks] = useState(mockNetworks);
  const [extenderEnabled, setExtenderEnabled] = useState(false);
  
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');

  // Authentication check wrapper
  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenSettings();
    } else {
      action();
    }
  };

  const toggleNetwork = (id: string) => {
      handleInteraction(() => {
        setNetworks(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n));
      });
  };

  const openQr = (name: string) => {
      handleInteraction(() => {
          setSelectedNetwork(name);
          setIsQrModalOpen(true);
      });
  };

  const FreqCheckbox = ({ label, checked }: { label: string, checked: boolean }) => (
      <div className="flex items-center me-4">
          <div className={`w-4 h-4 border flex items-center justify-center me-1.5 ${checked ? 'border-gray-400 bg-gray-100' : 'border-gray-300 bg-white'}`}>
             {checked && <div className="w-2.5 h-2.5 bg-gray-400" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)', backgroundColor: '#9ca3af' }}></div>}
          </div>
          <span className={`text-sm ${checked ? 'text-gray-400' : 'text-gray-300'}`}>{label}</span>
      </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
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

      {/* Login Gate */}
      {!isLoggedIn ? (
          <div className="w-full h-[400px] flex items-center justify-center bg-white border border-gray-200 shadow-sm">
             <div className="text-center p-8">
                 <p className="mb-4 font-bold text-lg">{t('loginAsAdminMsg')}</p>
                 <button 
                    onClick={onOpenSettings}
                    className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 transition-colors"
                 >
                    {t('loginAsAdminBtn')}
                 </button>
             </div>
          </div>
      ) : (
        /* Authenticated Content */
        <div className="bg-white p-6 shadow-sm border border-gray-200">
            {/* List Container */}
            <div className="border border-gray-300 max-h-[600px] overflow-y-auto mb-6">
                {networks.map((net, index) => (
                    <div 
                        key={net.id} 
                        className={`flex items-center p-4 min-h-[90px] ${index !== networks.length - 1 ? 'border-b border-gray-200' : ''}`}
                    >
                        {/* Icon */}
                        <div className="me-4 relative shrink-0 cursor-pointer" onClick={() => onOpenDevices(net.name)}>
                             <div className="bg-gray-100 p-2 rounded-sm">
                                <User className="w-6 h-6 text-black fill-current" />
                             </div>
                             <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                                {net.clients}
                             </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 pe-4">
                            <div 
                                className="font-bold text-black text-sm mb-1 cursor-pointer hover:text-orange transition-colors"
                                onClick={() => onEditSsid({ ...net, frequency: net.has5 ? '5GHz' : '2.4GHz' })} // simplified mapping
                            >
                                {net.name}
                            </div>
                            {net.description && (
                                <div className="text-xs text-black mb-1 truncate">
                                    {t(net.description)}
                                </div>
                            )}
                            <div className="flex items-center">
                                <FreqCheckbox label="2.4 GHz" checked={net.has24} />
                                <FreqCheckbox label="5 GHz" checked={net.has5} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4 rtl:space-x-reverse shrink-0">
                             <QrCode 
                                className="w-6 h-6 cursor-pointer text-black hover:text-orange transition-colors"
                                onClick={() => openQr(net.name)}
                             />
                             <SquareSwitch isOn={net.enabled} onChange={() => toggleNetwork(net.id)} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Extender Section */}
            <div className="border border-gray-300 p-4 flex justify-between items-center">
                <div className="flex items-center">
                     <div className="bg-gray-100 p-2 rounded-sm me-4">
                        <Wifi className="w-6 h-6 text-black" />
                     </div>
                     <span className="font-bold text-black text-sm">{t('wifiExtender')}</span>
                </div>
                <SquareSwitch isOn={extenderEnabled} onChange={() => handleInteraction(() => setExtenderEnabled(!extenderEnabled))} />
            </div>
        </div>
      )}

      <QrModal 
        isOpen={isQrModalOpen} 
        onClose={() => setIsQrModalOpen(false)} 
        networkName={selectedNetwork} 
      />
    </div>
  );
};
