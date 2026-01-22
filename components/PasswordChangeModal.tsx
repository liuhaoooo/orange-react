
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { modifyPassword } from '../utils/api';
import { useLanguage } from '../utils/i18nContext';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setErrorMsg('');
        setIsLoading(false);
    }
  }, [isOpen]);

  const getStrength = (pass: string) => {
      if (!pass || pass.length === 0) return 0;
      if (pass.length < 8) return 1; // Weak
      if (pass.length < 12) return 2; // Medium
      return 3; // Strong
  };
  const strength = getStrength(password);

  const handleSubmit = async () => {
    if (!password) {
        setErrorMsg(t('emptyError'));
        return;
    }
    if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
        const res = await modifyPassword('admin', password);
        
        // Logic based on specific message values as requested
        if (res.message === 'success') {
            onSuccess();
        } else if (res.message === 'ERROR') {
            setErrorMsg(t('pwdModificationFailed'));
        } else if (res.message === 'passwd same') {
            setErrorMsg(t('pwdSameAsOld'));
        } else if (res.message === 'username passwd same') {
            setErrorMsg(t('pwdSameAsUser'));
        } else {
            // Fallback for other errors
            setErrorMsg(res.message || t('pwdModificationFailed'));
        }
    } catch (e) {
        setErrorMsg('An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black">Password</h2>
          <button 
            onClick={onClose} 
            className="text-black hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
           <p className="mb-6 text-sm text-black leading-snug">
             The administrator password allows you to modify the settings of your device. Your password should consist of numbers, letters, or characters.
           </p>

           <div className="mb-4">
              <label className="block font-bold text-sm mb-1 text-black">Login</label>
              <input 
                type="text" 
                value="admin" 
                disabled 
                className="w-full border border-gray-300 p-2 text-sm text-black bg-gray-50" 
              />
           </div>

           <div className="mb-4">
              <label className="block font-bold text-sm mb-1 text-black">Password</label>
              <div className="relative w-full">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-black p-2 pr-10 text-sm outline-none focus:border-orange text-black font-medium" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
              
              {/* Strength Meter */}
              <div className="flex mt-3 h-2 w-full max-w-[200px]">
                 <div className={`flex-1 me-1 transition-colors ${strength >= 1 ? 'bg-orange' : 'bg-gray-200'}`}></div>
                 <div className={`flex-1 me-1 transition-colors ${strength >= 2 ? 'bg-orange' : 'bg-gray-200'}`}></div>
                 <div className={`flex-1 transition-colors ${strength >= 3 ? 'bg-orange' : 'bg-gray-200'}`}></div>
              </div>
              <div className="text-end text-xs text-black mt-1">
                 {strength === 0 ? 'Password Weak' : strength === 1 ? 'Password Weak' : strength === 2 ? 'Password Medium' : 'Password Strong'}
              </div>
           </div>

           <div className="mb-6">
              <label className="block font-bold text-sm mb-1 text-black">Confirm password</label>
              <div className="relative w-full">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 p-2 pr-10 text-sm outline-none focus:border-orange text-black font-medium" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
           </div>

           {errorMsg && (
              <div className="mb-4 text-red-500 text-sm font-bold">
                  {errorMsg}
              </div>
           )}

           <div className="flex justify-end space-x-3 rtl:space-x-reverse">
             <button 
               onClick={onClose}
               disabled={isLoading}
               className="px-6 py-2 border-2 border-black bg-white text-black font-bold text-sm hover:bg-gray-50 transition-colors h-10 min-w-[100px]"
             >
               Later
             </button>
             <button 
               onClick={handleSubmit}
               disabled={isLoading}
               className="px-6 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors"
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
