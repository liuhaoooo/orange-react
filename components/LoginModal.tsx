
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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useLanguage();
  const { setIsLoggedIn } = useGlobalState();
  
  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setUsername('admin');
      setPassword('');
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen]);

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
        // Display the specific error message returned by the API
        setErrorMsg(result.message || 'Login failed. Please check your credentials.');
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
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={isLoading}
              className={`w-full border bg-white p-2 text-sm outline-none text-black ${errorMsg ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
            />
          </div>

          {errorMsg && <p className="text-red-500 text-xs mb-4 text-start">{errorMsg}</p>}

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
