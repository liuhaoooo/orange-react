import React from 'react';
import { X, Wifi, Monitor, Smartphone } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface ConnectedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockDevices = [
  { id: 1, name: 'iPhone-13-Pro', ip: '192.168.1.102', mac: 'A1:B2:C3:D4:E5:F6', type: 'wifi', duration: '02:15:00' },
  { id: 2, name: 'MacBook-Air', ip: '192.168.1.105', mac: '11:22:33:44:55:66', type: 'wifi', duration: '05:30:22' },
  { id: 3, name: 'Desktop-PC', ip: '192.168.1.100', mac: 'AA:BB:CC:DD:EE:FF', type: 'lan', duration: '24:00:00+ ' },
];

export const ConnectedDevicesModal: React.FC<ConnectedDevicesModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">{t('connectedDevices')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-auto">
          <table className="w-full text-sm text-left rtl:text-right text-black">
            <thead className="bg-gray-100 text-black font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">{t('deviceName')}</th>
                <th className="px-6 py-4">{t('ipAddress')}</th>
                <th className="px-6 py-4">{t('macAddress')}</th>
                <th className="px-6 py-4 text-center">{t('type')}</th>
                <th className="px-6 py-4 text-end">{t('duration')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockDevices.map((device) => (
                <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{device.name}</td>
                  <td className="px-6 py-4">{device.ip}</td>
                  <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                  <td className="px-6 py-4 text-center">
                    {device.type === 'wifi' ? (
                      <Wifi size={18} className="inline text-blue-500" />
                    ) : (
                      <Monitor size={18} className="inline text-green-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-end">{device.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mockDevices.length === 0 && (
             <div className="p-8 text-center text-black">{t('noDevices')}</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rtl:justify-start">
           <button 
              onClick={onClose}
              className="px-6 py-2 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors uppercase"
            >
              {t('close')}
            </button>
        </div>
      </div>
    </div>
  );
};