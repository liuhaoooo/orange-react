
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X } from 'lucide-react';
import { setAutoUpgrade } from '../utils/api';

interface SoftwareUpdateModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const SoftwareUpdateModal: React.FC<SoftwareUpdateModalProps> = ({ isOpen, onSuccess }) => {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default states as shown in screenshot
      setAutoUpdate(true);
      setPrivacyAccepted(false);
      setIsLoading(false);
      setShowWarning(false);
    }
  }, [isOpen]);

  const submitSettings = async (enable: boolean) => {
    setIsLoading(true);
    try {
        // Send CMD 240 as requested
        const res = await setAutoUpgrade(enable ? '1' : '0');
        
        if (res && (res.success || res.result === 'success')) {
            onSuccess();
        } else {
            console.warn("API returned unsuccessful response for auto update settings", res);
            onSuccess(); // Proceed anyway to avoid blocking
        }
    } catch (e) {
        console.error("Failed to save auto update settings", e);
        onSuccess();
    } finally {
        setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (!privacyAccepted) return;

    if (autoUpdate) {
        submitSettings(true);
    } else {
        setShowWarning(true);
    }
  };

  // Warning Modal Handlers
  const handleWarningEnable = () => {
      // User changed mind, wants to enable
      submitSettings(true);
  };

  const handleWarningCancel = () => {
      // User confirms they want to proceed without auto-update (Cancel the enabling)
      // Request says: click Cancel -> autoValue: "0"
      submitSettings(false);
  };
  
  const closeWarning = () => {
      setShowWarning(false);
  };

  if (!isOpen) return null;

  return (
    <>
        {createPortal(
            <div className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
                {/* Header */}
                <div className="p-5 pb-2">
                <h2 className="text-xl font-bold text-black">Software update</h2>
                </div>

                {/* Content */}
                <div className="px-5 pb-8 pt-4">
                {/* Auto-update Option */}
                <div className="mb-6">
                    <div className="flex items-center mb-2">
                        <div 
                            className={`w-4 h-4 border flex items-center justify-center me-2 cursor-pointer ${autoUpdate ? 'bg-orange border-orange' : 'bg-white border-gray-400'}`}
                            onClick={() => setAutoUpdate(!autoUpdate)}
                        >
                            {autoUpdate && <div className="text-white font-bold text-xs">✓</div>}
                        </div>
                        <label 
                            className="text-black font-bold text-sm cursor-pointer"
                            onClick={() => setAutoUpdate(!autoUpdate)}
                        >
                            Auto-update
                        </label>
                    </div>
                    <p className="text-gray-600 text-sm leading-snug">
                        Auto-update feature allows you to automatically get the latest version of the software and ensure the best experience with your device.
                    </p>
                </div>

                {/* Privacy Notice Option */}
                <div className="mb-4">
                    <div className="flex items-center mb-2">
                        <div 
                            className={`w-4 h-4 border flex items-center justify-center me-2 cursor-pointer ${privacyAccepted ? 'bg-orange border-orange' : 'bg-white border-gray-400'}`}
                            onClick={() => setPrivacyAccepted(!privacyAccepted)}
                        >
                            {privacyAccepted && <div className="text-white font-bold text-xs">✓</div>}
                        </div>
                        <label 
                            className="text-black text-sm cursor-pointer font-bold"
                            onClick={() => setPrivacyAccepted(!privacyAccepted)}
                        >
                            I have read and I accept the updated <span className="underline decoration-1">Privacy Notice</span>.
                        </label>
                    </div>
                    <p className="text-gray-600 text-sm leading-snug font-bold">
                        You can consult the Orange personal data protection notice from the configuration interface of your equipment
                    </p>
                </div>

                <div className="flex justify-end mt-8">
                    <button 
                    onClick={handleFinish}
                    disabled={!privacyAccepted || isLoading}
                    className={`px-8 py-2 font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors text-white ${
                        !privacyAccepted 
                            ? 'bg-[#c3c3c3] cursor-not-allowed' // Gray out if disabled
                            : 'bg-[#ffca99] hover:bg-orange' // Light orange/active orange
                    }`}
                    >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Finish'}
                    </button>
                </div>
                </div>
            </div>
            </div>,
            document.body
        )}

        {/* Warning Modal Overlay */}
        {showWarning && createPortal(
            <div className="fixed inset-0 bg-black/70 z-[10001] flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
                    <div className="flex justify-between items-start p-6 pb-2">
                        <h2 className="text-xl font-bold text-black">Auto-update is not enabled</h2>
                        <button onClick={closeWarning} className="text-black hover:text-gray-600">
                            <X size={24} strokeWidth={4} />
                        </button>
                    </div>
                    <div className="px-6 pb-8 pt-2">
                        <p className="mb-4 text-sm text-black">Your device will encounter the following problems:</p>
                        <ol className="list-decimal list-outside ms-4 text-sm text-black space-y-4 mb-8 ps-2">
                            <li>Will not be able to update to the latest software version.</li>
                            <li>Will not be able to update the operational data, affecting Internet quality.</li>
                        </ol>
                        <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                            <button 
                                onClick={handleWarningEnable}
                                disabled={isLoading}
                                className="px-8 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors"
                            >
                                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Enable'}
                            </button>
                            <button 
                                onClick={handleWarningCancel}
                                disabled={isLoading}
                                className="px-8 py-2 border-2 border-black bg-white text-black font-bold text-sm hover:bg-gray-50 transition-colors h-10 min-w-[100px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )}
    </>
  );
};
