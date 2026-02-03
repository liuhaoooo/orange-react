
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SimPinConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void>;
  remainingAttempts: string;
  isLoading?: boolean;
}

export const SimPinConfigModal: React.FC<SimPinConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  remainingAttempts,
  isLoading = false
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setShowPin(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (pin) {
        onConfirm(pin);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300 rounded-[2px]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">PIN Verification</h2>
          <button 
            onClick={onClose} 
            className="text-black hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* Input Row */}
          <div className="flex flex-col sm:flex-row sm:items-center mb-8">
             <label className="font-bold text-sm text-black mb-2 sm:mb-0 sm:w-1/3 flex flex-wrap items-center">
                <span className="text-red-500 me-1">*</span>
                <span>PIN Verification</span>
                <span className="font-normal text-gray-500 text-xs ms-1 block w-full sm:w-auto mt-0.5 sm:mt-0">
                    (Remaining times.{remainingAttempts})
                </span>
             </label>
             <div className="sm:w-2/3 relative">
                <input 
                    type={showPin ? "text" : "password"} 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    disabled={isLoading}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
             </div>
          </div>

          {/* Warning Box */}
          <div className="bg-[#fff7e6] border-l-4 border-[#b45309]/0 p-4 mb-8 flex items-start rounded-[2px]">
             <AlertCircle className="text-[#b45309] fill-[#b45309] text-white w-5 h-5 me-3 shrink-0 mt-0.5" />
             <p className="text-[#b45309] text-sm leading-snug">
                (When the number of PIN code errors exceeds the maximum number allowed by the SIM card, you need to solve the PUK to reset the PIN code, please confirm and then set.)
             </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-4">
             <button 
               onClick={onClose}
               disabled={isLoading}
               className="px-8 py-2 bg-[#eeeeee] border-2 border-transparent hover:border-gray-300 text-black font-bold text-sm transition-colors min-w-[120px] rounded-[2px]"
             >
               Cancel
             </button>
             <button 
               onClick={handleConfirm}
               disabled={isLoading || !pin}
               className={`px-8 py-2 bg-[#eeeeee] border-2 border-transparent hover:border-gray-300 text-black font-bold text-sm transition-colors min-w-[120px] flex items-center justify-center rounded-[2px] ${(!pin || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Confirm'}
             </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
