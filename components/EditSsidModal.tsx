
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { SquareSwitch } from './UIComponents';
import { WifiNetwork } from '../types';

interface EditSsidModalProps {
  isOpen: boolean;
  onClose: () => void;
  network?: WifiNetwork;
  onSave?: (updatedNetwork: WifiNetwork) => void;
}

export const EditSsidModal: React.FC<EditSsidModalProps> = ({ isOpen, onClose, network, onSave }) => {
  const { t } = useLanguage();
  const [optimization, setOptimization] = useState(false);
  const [broadcast, setBroadcast] = useState(true);
  const [ssid, setSsid] = useState('');
  const [authType, setAuthType] = useState('WPA3-PSK');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  
  // Calculate password strength simple logic for demo
  const getStrength = (pass: string) => {
      if (pass.length === 0) return 0;
      if (pass.length < 8) return 1; // Weak
      if (pass.length < 12) return 2; // Medium
      return 3; // Strong
  };
  const strength = getStrength(password);

  useEffect(() => {
    if (isOpen && network) {
      setSsid(network.name);
      // Reset other mock fields to defaults or simulate fetched values
      setOptimization(false);
      setBroadcast(true);
      setAuthType('WPA3-PSK');
      setPassword('password123'); // Mock password
    }
  }, [isOpen, network]);

  if (!isOpen || !network) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">{t('editSsid')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
            
            {/* 5GHz Optimization */}
            <div className="flex items-center justify-between">
                <label className="font-bold text-sm text-black w-1/3">{t('optimization5g')}</label>
                <div className="flex-1">
                    <SquareSwitch isOn={optimization} onChange={() => setOptimization(!optimization)} />
                </div>
            </div>

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
                        <option value="WPA2-PSK">WPA2-PSK</option>
                        <option value="WPA3-PSK">WPA3-PSK</option>
                        <option value="WPA/WPA2-PSK">WPA/WPA2-PSK</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
            </div>

            {/* Wi-Fi Password */}
            <div className="flex items-start justify-between">
                <label className="font-bold text-sm text-black w-1/3 mt-2">
                    <span className="text-red-500 me-1">*</span>{t('wifiPassword')}
                </label>
                <div className="flex-1 flex flex-col">
                    <div className="relative w-full border border-gray-300 rounded-sm bg-white">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
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

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end">
            <button 
                onClick={onClose}
                className="px-10 py-2 border-2 border-black text-black font-bold text-sm hover:bg-gray-100 transition-colors uppercase"
            >
                {t('confirm')}
            </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
