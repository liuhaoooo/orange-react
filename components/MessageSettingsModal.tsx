
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { SquareSwitch } from './UIComponents';
import { useGlobalState } from '../utils/GlobalStateContext';
import { updateConnectionSettings, fetchConnectionSettings } from '../utils/api';
import { useLanguage } from '../utils/i18nContext';

interface MessageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessageSettingsModal: React.FC<MessageSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { globalData, updateGlobalData } = useGlobalState();
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // CMD 585/1020 'sms_sw'. '1' = Enabled, '0' = Disabled.
      const currentSw = globalData.connectionSettings?.sms_sw;
      setSmsEnabled(currentSw === '0' ? false : true);
    }
  }, [isOpen, globalData.connectionSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await updateConnectionSettings({ sms_sw: smsEnabled ? '1' : '0' });
      
      // Update global state locally immediately for responsiveness
      const currentSettings = globalData.connectionSettings || {};
      updateGlobalData('connectionSettings', { ...currentSettings, sms_sw: smsEnabled ? '1' : '0' });

      if (res && res.success) {
         // Refresh in background to ensure sync
         fetchConnectionSettings().then(newSettings => {
             if (newSettings && newSettings.success !== false) {
                 updateGlobalData('connectionSettings', newSettings);
             }
         });
         onClose();
      } else {
          // Even if API doesn't return standard success true, we might want to close if it's a known quirk, 
          // but let's assume it works like others.
          onClose();
      }
    } catch (e) {
      console.error("Failed to save message settings", e);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">{t('settings')}</h2>
          <button 
            onClick={onClose} 
            className="text-black hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 pb-8">
           <div className="flex items-center mb-16">
              <label className="font-bold text-sm text-black w-48">Message Function</label>
              <SquareSwitch isOn={smsEnabled} onChange={() => setSmsEnabled(!smsEnabled)} />
           </div>

           <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="px-12 py-2 border-2 border-black bg-[#f2f2f2] hover:bg-gray-200 text-black font-bold text-sm transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
              </button>
           </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
