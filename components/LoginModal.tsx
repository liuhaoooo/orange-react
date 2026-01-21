
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useLanguage();
  const { setIsLoggedIn } = useGlobalState();
  
  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const formatLockTime = (seconds?: string) => {
    if (!seconds) return "00:00";
    const totalSec = parseInt(seconds, 10);
    if (isNaN(totalSec)) return "00:00";
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!username || !password) {
      setErrorMsg(t('emptyError'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await login(username, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        onClose();
      } else {
        // Handle specific API failure states
        if (result.login_fail2 === 'fail') {
             // Account Locked
             const timeStr = formatLockTime(result.login_time);
             setErrorMsg(`The account has been locked, there is still left: ${timeStr}`);
        } else if (result.login_fail === 'fail') {
             // Incorrect Credentials with Counter
             setErrorMsg(`The username or password is incorrect.Number of consecutive errors:${result.login_times}`);
        } else if (result.message === 'The account has been logged in on other terminal. Please try again later.') {
             // Already Logged In (passed from api.ts as message)
             setErrorMsg(result.message);
        } else {
             // General Fallback
             setErrorMsg(result.message || 'Login failed. Please check your credentials.');
        }
      }
    } catch (e) {
      setErrorMsg('An unexpected error occurred.');
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
            <input 
              type="password" 
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={isLoading}
              className={`w-full border bg-white p-2 text-sm outline-none text-black ${errorMsg ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
            />
          </div>

          {errorMsg && <p className="text-red-500 text-xs mb-4 text-start font-bold">{errorMsg}</p>}

          <div className="flex justify-end rtl:justify-start">
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-2 border border-black text-sm font-bold hover:bg-gray-100 transition-colors uppercase text-black flex items-center"
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
