


import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { SquareSwitch } from './UIComponents';
import { WifiNetwork } from '../types';
import { fetchWifiSettings, updateWifiConfig, WifiSettingsResponse } from '../utils/api';
import { useGlobalState } from '../utils/GlobalStateContext';

interface EditSsidModalProps {
  isOpen: boolean;
  onClose: () => void;
  network?: WifiNetwork;
  onSave?: (updatedNetwork: WifiNetwork) => void;
}

const AUTH_OPTIONS = [
    { value: "0", name: "OPEN" },
    { value: "2", name: "WPA2-PSK" },
    { value: "3", name: "WPA/WPA2-PSK" },
    { value: "4", name: "WPA3-PSK" },
    { value: "5", name: "WPA2/WPA3-PSK" }
];

export const EditSsidModal: React.FC<EditSsidModalProps> = ({ isOpen, onClose, network }) => {
  const { t } = useLanguage();
  const { updateGlobalData, globalData } = useGlobalState();
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [optimization, setOptimization] = useState(false);
  const [broadcast, setBroadcast] = useState(true);
  const [ssid, setSsid] = useState('');
  const [authType, setAuthType] = useState('3');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Keep track of the original switch state (enabled/disabled) to preserve it during save
  const [wifiOpen, setWifiOpen] = useState('1');

  // Context Info
  const [networkPrefix, setNetworkPrefix] = useState<'main' | 'guest'>('main');
  const [networkBand, setNetworkBand] = useState<'24g' | '5g'>('24g');
  const [showOptimizationSwitch, setShowOptimizationSwitch] = useState(true);

  const getStrength = (pass: string) => {
      if (!pass || pass.length === 0) return 0;
      if (pass.length < 8) return 1; // Weak
      if (pass.length < 12) return 2; // Medium
      return 3; // Strong
  };
  const strength = getStrength(password);

  useEffect(() => {
    if (isOpen && network) {
      setLoading(true);
      setShowPassword(false);

      // Determine context from network ID
      // main_merged, main_24, main_5
      // guest_merged, guest_24, guest_5
      
      const isGuest = network.id.startsWith('guest');
      const isMerged = network.id.includes('merged');
      const is5g = network.id.includes('_5'); // matches 'main_5', 'guest_5'
      
      const prefix = isGuest ? 'guest' : 'main';
      // Merged networks use 2.4G fields, Split 5G uses 5G fields
      const band = (is5g && !isMerged) ? '5g' : '24g';
      
      // Optimization switch (Priority) usually controls Merged mode. 
      // It is a global toggle for the "Main" or "Guest" network group.
      // We show it when editing 2.4G (Merged/Split) to allow toggling optimization.
      const showOpt = !is5g || isMerged;

      setNetworkPrefix(prefix);
      setNetworkBand(band);
      setShowOptimizationSwitch(showOpt);

      fetchWifiSettings().then(res => {
        // CMD 587 returns flat response object
        if (res && res.success !== false) {
           const data = res;
           
           // Optimization Switch corresponds to wifiPriority (e.g., main_wifiPriority)
           const priorityKey = `${prefix}_wifiPriority` as keyof WifiSettingsResponse;
           setOptimization(data[priorityKey] === '1');

           // Other fields
           // SSID Input: main_wifi_ssid_24g or main_wifi_ssid_5g
           const ssidKey = `${prefix}_wifi_ssid_${band}` as keyof WifiSettingsResponse;
           // SSID Broadcast Switch: main_wifi_broadcast_24g
           const broadcastKey = `${prefix}_wifi_broadcast_${band}` as keyof WifiSettingsResponse;
           // Authentication Type: main_authenticationType_24g
           const authKey = `${prefix}_authenticationType_${band}` as keyof WifiSettingsResponse;
           // Wi-Fi Password: main_password_24g
           const passKey = `${prefix}_password_${band}` as keyof WifiSettingsResponse;
           // Wifi Open Status
           const switchKey = `${prefix}_wifi_switch_${band}` as keyof WifiSettingsResponse;

           setSsid((data[ssidKey] as string) || '');
           setBroadcast((data[broadcastKey] as string) === '1');
           setAuthType((data[authKey] as string) || '3');
           setPassword((data[passKey] as string) || '');
           setWifiOpen((data[switchKey] as string) || '1');
        }
        setLoading(false);
      });
    }
  }, [isOpen, network]);

  const handleSave = async () => {
      setIsSaving(true);
      
      const prefix = networkPrefix;
      const band = networkBand;

      const payload = {
          is5g: band === '5g',
          isGuest: prefix === 'guest',
          wifiOpen: wifiOpen,
          ssid: ssid,
          broadcast: broadcast ? '1' : '0',
          key: password,
          authenticationType: authType,
          wifiSames: showOptimizationSwitch ? (optimization ? '1' : '0') : undefined
      };

      try {
          const res = await updateWifiConfig(payload);
          
          if (res.success) {
              // Refresh global settings to reflect changes immediately in UI
              // Update optimistic cache based on input fields
              const updates: Record<string, string> = {};
              
              if (showOptimizationSwitch) {
                   updates[`${prefix}_wifiPriority`] = optimization ? '1' : '0';
              }
              updates[`${prefix}_wifi_ssid_${band}`] = ssid;
              updates[`${prefix}_wifi_broadcast_${band}`] = broadcast ? '1' : '0';
              updates[`${prefix}_authenticationType_${band}`] = authType;
              updates[`${prefix}_password_${band}`] = password;

              const currentSettings = globalData.connectionSettings || {};
              updateGlobalData('connectionSettings', { ...currentSettings, ...updates });
              
              // Also refresh for real
              fetchWifiSettings().then(data => {
                  if (data && data.success !== false) {
                       updateGlobalData('wifiSettings', data);
                  }
              });

              onClose();
          }
      } catch (error) {
          console.error("Failed to save wifi settings", error);
      } finally {
          setIsSaving(false);
      }
  };

  if (!isOpen || !network) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">{t('editSsid')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black" disabled={isSaving}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
            <div className="h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange" size={40} />
            </div>
        ) : (
        <div className="p-8 space-y-6">
            
            {/* 5GHz Optimization (Priority) */}
            {showOptimizationSwitch && (
                <div className="flex items-center justify-between">
                    <label className="font-bold text-sm text-black w-1/3">{t('optimization5g')}</label>
                    <div className="flex-1">
                        <SquareSwitch isOn={optimization} onChange={() => setOptimization(!optimization)} />
                    </div>
                </div>
            )}

            {/* SSID Broadcast */}
            <div className="flex items-center justify-between">
                <label className="font-bold text-sm text-black w-1/3">{t('ssidBroadcast')}</label>
                <div className="flex-1">
                    <SquareSwitch isOn={broadcast} onChange={() => setBroadcast(!broadcast)} />
                </div>
            </div>

            {/* SSID Input */}
            <div className="flex items-center justify-between">
                <label className="font-bold text-sm text-black w-1/3">
                    <span className="text-red-500 me-1">*</span>{t('ssid')}
                </label>
                <div className="flex-1">
                    <input 
                        type="text" 
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-orange text-black rounded-sm"
                    />
                </div>
            </div>

            {/* Authentication Type */}
            <div className="flex items-center justify-between">
                <label className="font-bold text-sm text-black w-1/3">{t('authType')}</label>
                <div className="flex-1 relative">
                    <select 
                        value={authType}
                        onChange={(e) => setAuthType(e.target.value)}
                        className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-orange text-black rounded-sm appearance-none bg-white cursor-pointer"
                    >
                        {AUTH_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
            </div>

            {/* Wi-Fi Password */}
            {authType !== '0' && (
                <div className="flex items-start justify-between">
                    <label className="font-bold text-sm text-black w-1/3 mt-2">
                        <span className="text-red-500 me-1">*</span>{t('wifiPassword')}
                    </label>
                    <div className="flex-1 flex flex-col">
                        <div className="relative w-full border border-gray-300 rounded-sm bg-white">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                autoComplete="new-password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 pr-10 text-sm outline-none text-black bg-transparent"
                            />
                            <button 
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        
                        {/* Strength Meter */}
                        <div className="flex mt-1 h-5 text-center text-xs text-black border border-gray-300 border-t-0">
                            <div className={`flex-1 flex items-center justify-center transition-colors ${strength >= 1 ? 'bg-[#c0c0c0]' : 'bg-[#e0e0e0]'}`}>
                                {t('weak')}
                            </div>
                            <div className={`flex-1 flex items-center justify-center transition-colors ${strength >= 2 ? 'bg-[#c0c0c0]' : 'bg-[#e0e0e0]'}`}>
                                {t('medium')}
                            </div>
                            <div className={`flex-1 flex items-center justify-center transition-colors ${strength >= 3 ? 'bg-[#00aa00] text-white' : 'bg-[#e0e0e0]'}`}>
                                {t('strong')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
        )}

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end">
            <button 
                onClick={handleSave}
                disabled={isSaving || loading}
                className="px-10 py-2 border-2 border-black text-black font-bold text-sm hover:bg-gray-100 transition-colors uppercase flex items-center"
            >
                {isSaving && <Loader2 className="animate-spin w-4 h-4 me-2" />}
                {t('confirm')}
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
