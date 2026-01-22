
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { login } from '../utils/api';
import { useGlobalState } from '../utils/GlobalStateContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockCountdown, setLockCountdown] = useState<number | null>(null);
  const { t } = useLanguage();
  const { setIsLoggedIn } = useGlobalState();
  
  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setShowPassword(false);
      setErrorMsg('');
      setIsLoading(false);
      setLockCountdown(null);
    }
  }, [isOpen]);

  // Handle Countdown Timer
  useEffect(() => {
    if (lockCountdown === null) return;

    if (lockCountdown <= 0) {
        // Countdown finished
        setLockCountdown(null);
        setErrorMsg(''); // Clear the lock message
        return;
    }

    const timer = setInterval(() => {
        setLockCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [lockCountdown]);

  // Update Error Message dynamically based on countdown
  useEffect(() => {
      if (lockCountdown !== null) {
          const m = Math.floor(lockCountdown / 60);
          const s = lockCountdown % 60;
          const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          setErrorMsg(t('accountLockedTime', timeStr));
      }
  }, [lockCountdown, t]);

  const handleSubmit = async () => {
    if (!username || !password) {
      setErrorMsg(t('emptyError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setLockCountdown(null); // Reset countdown on new attempt

    try {
      const result = await login(username, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        onClose();
      } else {
        // Handle specific API failure states
        if (result.login_fail2 === 'fail') {
             // Account Locked - Start Countdown
             const seconds = parseInt(result.login_time || '0', 10);
             if (!isNaN(seconds) && seconds > 0) {
                 setLockCountdown(seconds);
             } else {
                 setErrorMsg(t('accountLocked'));
             }
        } else if (result.login_fail === 'fail') {
             // Incorrect Credentials with Counter
             setErrorMsg(t('loginIncorrect', result.login_times || '0'));
        } else if (result.message === 'The account has been logged in on other terminal. Please try again later.') {
             // Already Logged In
             setErrorMsg(t('alreadyLoggedIn'));
        } else {
             // General Fallback
             setErrorMsg(result.message || t('loginFailedGeneral'));
        }
      }
    } catch (e) {
      setErrorMsg(t('loginUnexpected'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-xl font-bold text-black">{t('connection')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black" disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 text-black">
          <p className="font-bold text-sm mb-6 text-black">{t('featureAdmin')}</p>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1 text-black text-start">{t('login')}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className={`w-full border bg-white p-2 text-sm outline-none text-black ${errorMsg ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1 text-black text-start">{t('passwordLabel')}</label>
            <div className="relative w-full">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  autoComplete="new-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  disabled={isLoading}
                  className={`w-full border bg-white p-2 pr-10 text-sm outline-none text-black ${errorMsg ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-xs mb-4 text-start font-bold">{errorMsg}</p>}

          <div className="flex justify-end rtl:justify-start">
            <button 
              onClick={handleSubmit}
              disabled={isLoading || (lockCountdown !== null && lockCountdown > 0)}
              className={`px-8 py-2 border border-black text-sm font-bold transition-colors uppercase text-black flex items-center ${(isLoading || (lockCountdown !== null && lockCountdown > 0)) ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
              {isLoading && <Loader2 className="animate-spin w-4 h-4 me-2" />}
              {t('ok')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
