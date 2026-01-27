
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Pencil, Trash2, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { SquareSwitch } from './UIComponents';
import { useGlobalState } from '../utils/GlobalStateContext';
import { updateDeviceHostname, fetchStatusInfo } from '../utils/api';

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
  ssid: string; // Used for filtering, mapped from interface if available
}

export const ConnectedDevicesModal: React.FC<ConnectedDevicesModalProps> = ({ isOpen, onClose, filterSsid }) => {
  const { t } = useLanguage();
  const { globalData, updateGlobalData } = useGlobalState();
  const [onlineDevices, setOnlineDevices] = useState<Device[]>([]);
  const [offlineDevices, setOfflineDevices] = useState<Device[]>([]);

  // Editing State - Using MAC address for stability across list updates
  const [editingMac, setEditingMac] = useState<string | null>(null);
  const [editHostname, setEditHostname] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Effect 1: Reset editing state only when modal opens fresh
  useEffect(() => {
    if (isOpen) {
      setEditingMac(null);
      setEditHostname('');
    }
  }, [isOpen]);

  // Effect 2: Update lists when data updates, preserving editing state
  useEffect(() => {
    if (isOpen) {
      const statusInfo = globalData.statusInfo || {};
      
      // --- Process Online Devices (dhcp_list_info) ---
      let rawOnlineList: any[] = [];
      if (Array.isArray(statusInfo.dhcp_list_info)) {
        rawOnlineList = statusInfo.dhcp_list_info;
      }
      
      const mappedOnline = rawOnlineList.map((d: any, index: number) => ({
        id: index,
        host: d.hostname || t('unknown'),
        mac: d.mac || '',
        ip: d.ip || '',
        access: true, // Defaulting to true as API access control is not yet implemented
        ssid: d.interface || '', // Use interface as a proxy for SSID
      }));

      // --- Process Offline Devices (offline_history_list_info) ---
      let rawOfflineList: any[] = [];
      if (Array.isArray(statusInfo.offline_history_list_info)) {
        rawOfflineList = statusInfo.offline_history_list_info;
      }

      const mappedOffline = rawOfflineList.map((d: any, index: number) => ({
        id: index + 1000, // Offset IDs
        host: d.hostname || t('unknown'),
        mac: d.mac || '',
        ip: d.ip || '',
        access: true, 
        ssid: '', // Offline devices might not have interface info
      }));

      setOnlineDevices(mappedOnline);
      setOfflineDevices(mappedOffline);
    }
  }, [isOpen, filterSsid, globalData.statusInfo, t]);

  if (!isOpen) return null;

  const toggleOnlineAccess = (id: number) => {
    // Logic to toggle access would go here (likely a separate API call)
    setOnlineDevices(prev => prev.map(d => d.id === id ? { ...d, access: !d.access } : d));
  };

  const toggleOfflineAccess = (id: number) => {
    setOfflineDevices(prev => prev.map(d => d.id === id ? { ...d, access: !d.access } : d));
  };

  const startEditing = (device: Device) => {
      setEditingMac(device.mac);
      setEditHostname(device.host);
  };

  const cancelEditing = () => {
      setEditingMac(null);
      setEditHostname('');
  };

  const saveHostname = async (device: Device) => {
      if (!editHostname.trim()) return; // Validation?
      
      setIsSaving(true);
      try {
          const res = await updateDeviceHostname(device.mac, editHostname);
          if (res && res.success) {
              // Optimistic update
              setOnlineDevices(prev => prev.map(d => d.id === device.id ? { ...d, host: editHostname } : d));
              setEditingMac(null);
              
              // Trigger background refresh
              const statusData = await fetchStatusInfo();
              if (statusData && statusData.success) {
                  updateGlobalData('statusInfo', statusData);
              }
          } else {
              console.error("Update failed:", res);
          }
      } catch (e) {
          console.error("Failed to update hostname", e);
      } finally {
          setIsSaving(false);
      }
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
              <span className="text-sm text-gray-500 font-medium hidden">Network: {filterSsid}</span>
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
                {onlineDevices.map((device, index) => {
                  const isEditing = editingMac === device.mac;
                  return (
                    <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium truncate" title={device.host}>
                          {isEditing ? (
                              <input 
                                type="text" 
                                value={editHostname}
                                onChange={(e) => setEditHostname(e.target.value)}
                                className="w-full border border-gray-300 p-1 text-sm outline-none focus:border-orange rounded-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveHostname(device);
                                    if (e.key === 'Escape') cancelEditing();
                                }}
                              />
                          ) : (
                              device.host
                          )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                      <td className="px-6 py-4">{device.ip}</td>
                      <td className="px-6 py-4">
                        <SquareSwitch isOn={device.access} onChange={() => toggleOnlineAccess(device.id)} />
                      </td>
                      <td className="px-6 py-4 text-end">
                        {isEditing ? (
                            <div className="flex justify-end space-x-2">
                                <button 
                                    onClick={() => saveHostname(device)}
                                    disabled={isSaving}
                                    className="border border-green-500 bg-green-50 p-1.5 hover:bg-green-100 rounded-sm inline-flex items-center justify-center text-green-600"
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                </button>
                                <button 
                                    onClick={cancelEditing}
                                    disabled={isSaving}
                                    className="border border-red-300 bg-red-50 p-1.5 hover:bg-red-100 rounded-sm inline-flex items-center justify-center text-red-500"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => startEditing(device)}
                                className="border border-gray-300 p-1.5 hover:bg-gray-100 rounded-sm inline-flex items-center justify-center"
                            >
                                <Pencil size={14} className="text-blue-500" />
                            </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
             <div className="px-6 py-8 text-center text-gray-500 italic">{t('noDevices')}</div>
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
                    <td className="px-6 py-4 font-medium truncate" title={device.host}>{device.host}</td>
                    <td className="px-6 py-4 font-mono text-xs">{device.mac}</td>
                    <td className="px-6 py-4">{device.ip}</td>
                    <td className="px-6 py-4">
                      <SquareSwitch isOn={device.access} onChange={() => toggleOfflineAccess(device.id)} />
                    </td>
                    <td className="px-6 py-4 text-end flex justify-end space-x-2 rtl:space-x-reverse">
                      {/* Offline devices edit logic - keeping placeholder for now as per requirement focusing on online */}
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
