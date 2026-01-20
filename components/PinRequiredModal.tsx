
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { unlockSimPin, disablePinLock } from '../utils/api';

interface PinRequiredModalProps {
  isOpen: boolean;
  onClose: () => void; // Usually just to dismiss locally, though it might persist
  onSuccess: () => void;
  remainingAttempts?: string;
}

export const PinRequiredModal: React.FC<PinRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  remainingAttempts 
}) => {
  const [pin, setPin] = useState('');
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
        setPin('');
        setErrorMsg('');
        setIsLoading(false);
        // dontAskAgain state can persist or reset, reseting for safety
        setDontAskAgain(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!pin) {
        setErrorMsg('PIN cannot be empty.');
        return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
        let res;
        if (dontAskAgain) {
            // "Don't ask me again" implies disabling the PIN lock feature
            res = await disablePinLock(pin);
        } else {
            // Standard unlock for this session
            res = await unlockSimPin(pin);
        }

        if (res.success) {
            onSuccess();
        } else {
            setErrorMsg(res.message || 'Incorrect PIN code.');
        }
    } catch (e) {
        setErrorMsg('An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black">PIN code required</h2>
          <button 
            onClick={onClose} 
            className="text-black hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8">
          <div className="mb-4">
            <label className="block font-bold text-sm mb-2 text-black text-start">
               Enter your PIN code <span className="text-gray-500 font-normal">(remaining attempts: {remainingAttempts || '3'})</span>
            </label>
            <input 
              type="password" 
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border-2 border-black p-2 text-sm outline-none focus:border-orange text-black font-medium" 
            />
          </div>
          
          <div className="flex items-center mb-8">
             <input 
                type="checkbox" 
                id="dontAsk"
                className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange cursor-pointer"
                checked={dontAskAgain}
                onChange={(e) => setDontAskAgain(e.target.checked)}
             />
             <label htmlFor="dontAsk" className="ms-2 text-sm text-black cursor-pointer">Don't ask me again</label>
          </div>
          
          {errorMsg && (
              <div className="mb-4 text-red-500 text-sm font-bold text-end">
                  {errorMsg}
              </div>
          )}

          <div className="flex justify-end">
             <button 
               onClick={handleSubmit}
               disabled={isLoading}
               className="px-8 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors"
             >
               {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Ok'}
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
