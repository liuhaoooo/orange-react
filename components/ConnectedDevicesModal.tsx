
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { SquareSwitch } from './UIComponents';

interface ConnectedDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterSsid?: string;
}

interface Device {
  id: number;
  host: string;
  mac: string;
  ip: string;
  access: boolean;
  ssid: string; // Added to associate device with a network
}

// Mock data with SSIDs matching WifiCard
const initialOnlineDevices: Device[] = [
  { id: 1, host: 'unknown', mac: '9E:8D:08:D2:BE:E9', ip: '192.168.0.165', access: true, ssid: 'Flybox-KAV1' },
  { id: 2, host: 'Pixel-7', mac: 'AA:BB:CC:DD:EE:FF', ip: '192.168.0.170', access: true, ssid: '!OFlybox-liuhao-test-5G' },
];

const initialOfflineDevices: Device[] = [
  { id: 3, host: 'DAV-b3c9b1399c', mac: '72:BB:C1:CD:66:45', ip: '192.168.0.168', access: true, ssid: 'Flybox-KAV1' },
  { id: 4, host: 'DESKTOP-F64P62B', mac: '3C:91:80:4A:BB:3B', ip: '192.168.0.172', access: true, ssid: 'Flybox-KAV1' },
  { id: 5, host: 'iPad-Pro', mac: '11:22:33:44:55:66', ip: '192.168.0.180', access: true, ssid: '!OFlybox-liuhao-test-5G' },
];

export const ConnectedDevicesModal: React.FC<ConnectedDevicesModalProps> = ({ isOpen, onClose, filterSsid }) => {
  const { t } = useLanguage();
  const [onlineDevices, setOnlineDevices] = useState<Device[]>([]);
  const [offlineDevices, setOfflineDevices] = useState<Device[]>([]);

  // Effect to filter devices when modal opens or filter changes
  useEffect(() => {
    if (isOpen) {
      if (filterSsid) {
        setOnlineDevices(initialOnlineDevices.filter(d => d.ssid === filterSsid));
        setOfflineDevices(initialOfflineDevices.filter(d => d.ssid === filterSsid));
      } else {
        setOnlineDevices(initialOnlineDevices);
        setOfflineDevices(initialOfflineDevices);
      }
    }
  }, [isOpen, filterSsid]);

  if (!isOpen) return null;

  const toggleOnlineAccess = (id: number) => {
    setOnlineDevices(prev => prev.map(d => d.id === id ? { ...d, access: !d.access } : d));
  };

  const toggleOfflineAccess = (id: number) => {
    setOfflineDevices(prev => prev.map(d => d.id === id ? { ...d, access: !d.access } : d));
  };

  const renderTableHeader = () => (
    <thead className="text-black font-bold text-sm">
      <tr>
        <th className="px-6 py-4 font-normal text-start w-[80px]">{t('no')}</th>
        <th className="px-6 py-4 font-normal text-start">{t('host')}</th>
        <th className="px-6 py-4 font-normal text-start">{t('macAddress')}</th>
        <th className="px-6 py-4 font-normal text-start">{t('ipAddress')}</th>
        <th className="px-6 py-4 font-normal text-start">{t('internetAccess')}</th>
        <th className="px-6 py-4 font-normal text-end"></th>
      </tr>
    </thead>
  );

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-black">{t('manageDevices')}</h2>
            {filterSsid && (
              <span className="text-sm text-gray-500 font-medium">Network: {filterSsid}</span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-auto flex-1 pb-6">
          
          {/* Online Devices Table */}
          {onlineDevices.length > 0 ? (
            <table className="w-full text-sm text-left rtl:text-right text-black table-fixed">
              {renderTableHeader()}
              <tbody className="divide-y divide-gray-100">
                {onlineDevices.map((device, index) => (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium truncate">{device.host}</td>
                    <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                    <td className="px-6 py-4">{device.ip}</td>
                    <td className="px-6 py-4">
                      <SquareSwitch isOn={device.access} onChange={() => toggleOnlineAccess(device.id)} />
                    </td>
                    <td className="px-6 py-4 text-end">
                      <button className="border border-gray-300 p-1.5 hover:bg-gray-100 rounded-sm inline-flex items-center justify-center">
                        <Pencil size={14} className="text-blue-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
             <div className="px-6 py-8 text-center text-gray-500 italic">No online devices found for this network.</div>
          )}

          {/* Offline Devices Header */}
          <div className="px-6 py-4 mt-4">
             <h3 className="font-bold text-lg text-black">{t('offlineDevices')}</h3>
          </div>

          {/* Offline Devices Table */}
          {offlineDevices.length > 0 ? (
            <table className="w-full text-sm text-left rtl:text-right text-black table-fixed">
              {renderTableHeader()}
              <tbody className="divide-y divide-gray-100">
                {offlineDevices.map((device, index) => (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium truncate">{device.host}</td>
                    <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                    <td className="px-6 py-4">{device.ip}</td>
                    <td className="px-6 py-4">
                      <SquareSwitch isOn={device.access} onChange={() => toggleOfflineAccess(device.id)} />
                    </td>
                    <td className="px-6 py-4 text-end flex justify-end space-x-2 rtl:space-x-reverse">
                      <button className="border border-gray-300 p-1.5 hover:bg-gray-100 rounded-sm inline-flex items-center justify-center">
                        <Pencil size={14} className="text-blue-500" />
                      </button>
                      <button className="border border-gray-300 p-1.5 hover:bg-gray-100 rounded-sm inline-flex items-center justify-center">
                        <Trash2 size={14} className="text-blue-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-4 text-center text-gray-500 italic">No offline devices found.</div>
          )}
          
        </div>
      </div>
    </div>,
    document.body
  );
};
