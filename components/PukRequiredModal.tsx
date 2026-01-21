
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { unlockSimPuk, fetchConnectionSettings } from '../utils/api';
import { useGlobalState } from '../utils/GlobalStateContext';

interface PukRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  remainingAttempts?: string;
}

export const PukRequiredModal: React.FC<PukRequiredModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  remainingAttempts 
}) => {
  const [puk, setPuk] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [errors, setErrors] = useState<{puk?: boolean; newPin?: boolean; confirmPin?: boolean}>({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { updateGlobalData } = useGlobalState();

  useEffect(() => {
    if (isOpen) {
        setPuk('');
        setNewPin('');
        setConfirmPin('');
        setErrors({});
        setErrorMsg('');
        setIsLoading(false);
    }
  }, [isOpen]);

  const validate = () => {
      const newErrors: {puk?: boolean; newPin?: boolean; confirmPin?: boolean} = {};
      let isValid = true;

      if (!puk) {
          newErrors.puk = true;
          isValid = false;
      }
      if (!newPin) {
          newErrors.newPin = true;
          isValid = false;
      }
      if (!confirmPin) {
          newErrors.confirmPin = true;
          isValid = false;
      }

      setErrors(newErrors);
      return isValid;
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    
    if (!validate()) {
        return;
    }

    if (newPin !== confirmPin) {
        setErrorMsg('New PIN and confirm PIN do not match.');
        return;
    }

    setIsLoading(true);

    try {
        const res = await unlockSimPuk(puk, newPin);

        if (res.success && res.message === '0') {
            onSuccess();
        } else {
            setErrorMsg('Operation failed. Please check PUK code.');
            // Refresh attempts
            fetchConnectionSettings().then(settings => {
                 if (settings && settings.success !== false) {
                     updateGlobalData('connectionSettings', settings);
                 }
            }).catch(() => {});
        }
    } catch (e) {
        setErrorMsg('An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = (hasError?: boolean) => `w-full border-2 p-2 text-sm outline-none font-medium text-black rounded-[4px] ${hasError ? 'border-[#ff0000]' : 'border-gray-300 focus:border-orange'}`;
  const errorTextClass = "text-[#ff0000] text-sm mt-1";

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-xl font-bold text-black">PUK code required.</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-black transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2">
          
          {/* PUK Input */}
          <div className="mb-4">
            <label className="block font-bold text-sm mb-1 text-black text-start">
               <span className="text-[#ff0000] me-1">*</span>PUK code required. {remainingAttempts ? `(${remainingAttempts})` : ''}
            </label>
            <input 
              type="text" 
              value={puk}
              onChange={(e) => setPuk(e.target.value)}
              className={inputClass(errors.puk)}
            />
            {errors.puk && <div className={errorTextClass}>can not be empty.</div>}
          </div>

          {/* New PIN Input */}
          <div className="mb-4">
            <label className="block font-bold text-sm mb-1 text-black text-start">
               <span className="text-[#ff0000] me-1">*</span>New PIN Code
            </label>
            <div className="relative w-full">
                <input 
                  type={showNewPin ? "text" : "password"} 
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className={`${inputClass(errors.newPin)} pr-10`}
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showNewPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {errors.newPin && <div className={errorTextClass}>can not be empty.</div>}
          </div>

          {/* Confirm PIN Input */}
          <div className="mb-6">
            <label className="block font-bold text-sm mb-1 text-black text-start">
               <span className="text-[#ff0000] me-1">*</span>New PIN Code confirmed
            </label>
            <div className="relative w-full">
                <input 
                  type={showConfirmPin ? "text" : "password"} 
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className={`${inputClass(errors.confirmPin)} pr-10`}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showConfirmPin ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            {errors.confirmPin && <div className={errorTextClass}>can not be empty.</div>}
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
               className="px-8 py-2 border-2 border-black bg-[#f2f2f2] hover:bg-gray-200 text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors uppercase"
             >
               {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'OK'}
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
