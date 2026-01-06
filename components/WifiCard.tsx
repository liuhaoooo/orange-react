import React, { useState } from 'react';
import { Card, CardHeader, SquareSwitch } from './UIComponents';
import { User, QrCode } from 'lucide-react';
import { WifiNetwork } from '../types';
import { useLanguage } from '../utils/i18nContext';

const initialNetworks: WifiNetwork[] = [
  { id: '1', name: 'Flybox-KAV1', frequency: '2.4GHz', clients: 0, hasQr: true, enabled: true },
  { id: '2', name: '!OFlybox-liuhao-test-5G', frequency: '5GHz', clients: 1, hasQr: false, enabled: true },
  { id: '3', name: 'Flybox-KAV1-GUEST', frequency: '2.4GHz', clients: 0, hasQr: false, enabled: false, isGuest: true },
  { id: '4', name: 'Flybox-KAV1-GUEST-5G', frequency: '5GHz', clients: 0, hasQr: false, enabled: false, isGuest: true },
];

export const WifiCard: React.FC = () => {
  const [networks, setNetworks] = useState<WifiNetwork[]>(initialNetworks);
  const { t } = useLanguage();

  const toggleNetwork = (id: string) => {
    setNetworks(prev => prev.map(net => 
      net.id === id ? { ...net, enabled: !net.enabled } : net
    ));
  };

  return (
    <Card>
      <CardHeader title={t('wifiNetworks')} />
      
      <div className="flex flex-col">
        {networks.map((net) => (
          <div key={net.id} className="flex items-center p-3 border-b border-gray-200 min-h-[80px]">
            {/* Icon */}
            <div className="relative me-3">
              <User className="w-6 h-6 text-black fill-current" />
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold rtl:right-auto rtl:-left-1">
                {net.clients}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pe-2">
              <div className="font-bold text-sm truncate text-black text-start">{net.name}</div>
              <div className="text-xs text-black text-start">{net.frequency}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 shrink-0 rtl:space-x-reverse">
              {net.hasQr && <QrCode className="w-5 h-5 cursor-pointer text-black hover:text-orange" />}
              <SquareSwitch 
                isOn={net.enabled} 
                onChange={() => toggleNetwork(net.id)} 
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};