
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { redirectSms } from '../utils/api';
import { useLanguage } from '../utils/i18nContext';

interface RedirectWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const RedirectWarningModal: React.FC<RedirectWarningModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black flex items-center">
             <AlertTriangle className="text-yellow-500 fill-yellow-500 text-white w-6 h-6 me-2" />
             {t('common_alert')}
          </h2>
          <button onClick={onClose} className="text-black hover:text-gray-600 transition-colors">
            <X size={24} strokeWidth={4} />
          </button>
        </div>
        <div className="px-8 pb-8 pt-2">
          <p className="mb-8 text-base text-black">
            {t('this_connection_may_add_supplementary_fees')}
          </p>
          <div className="flex justify-end">
             <button 
               onClick={onConfirm}
               className="px-8 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors"
             >
               {t('ok')}
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface RedirectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedirectConfigModal: React.FC<RedirectConfigModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
        setPhone('');
        setEnabled(false);
        setIsLoading(false);
        setErrorMsg('');
        setSuccessMsg('');
    }
  }, [isOpen]);

  const isValidPhoneNumber = (val: string) => {
    if (!val) return false;
    
    // Split by semicolon for multiple numbers
    const parts = val.split(';');
    let hasValidNumber = false;

    for (const part of parts) {
        if (part === '') continue; // Skip empty parts (e.g. trailing semicolon)
        hasValidNumber = true;

        // Check for valid characters and structure: optional + then digits
        if (!/^(\+?[0-9]+)$/.test(part)) return false;

        // Check length (excluding +), max 20
        const digits = part.replace('+', '');
        if (digits.length > 20) return false;
    }
    
    return hasValidNumber;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Only allow digits, +, and ;
      if (/^[0-9+;]*$/.test(val)) {
          setPhone(val);
          setErrorMsg('');
      }
  };

  const handleSave = async () => {
      if (!isValidPhoneNumber(phone)) {
          setErrorMsg(t('sms_hint_mobile_number_format'));
          return;
      }

      setIsLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
          const res = await redirectSms(enabled, phone);
          
          if (res.success && res.message === "") {
              setSuccessMsg(t('common_success'));
              setTimeout(() => {
                  onClose();
              }, 1000);
          } else {
              setErrorMsg(res.message || t('common_failed'));
          }
      } catch (e) {
          console.error(e);
          setErrorMsg(t('error_message'));
      } finally {
          setIsLoading(false);
      }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black">{t('redirect_my_messages_to_handset')}</h2>
          <button onClick={onClose} disabled={isLoading || !!successMsg} className="text-black hover:text-gray-600 transition-colors">
            <X size={24} strokeWidth={4} />
          </button>
        </div>
        <div className="px-8 pb-8">
            <div className="mb-6">
                <label className="block font-bold text-sm mb-2 text-black">{t('sms_mobile_number')}</label>
                <input 
                    type="text" 
                    value={phone}
                    onChange={handleInputChange}
                    disabled={isLoading || !!successMsg}
                    className={`w-full border p-2 text-sm text-black h-10 outline-none font-bold ${errorMsg ? 'border-red-500' : 'border-gray-400 focus:border-orange'}`}
                />
                {errorMsg && (
                    <p className="text-red-500 text-xs mt-2 leading-snug">
                        {errorMsg}
                    </p>
                )}
                {successMsg && (
                    <p className="text-green-600 text-sm font-bold mt-2 leading-snug">
                        {successMsg}
                    </p>
                )}
            </div>
            
            <div className="flex items-center mb-8 cursor-pointer" onClick={() => !isLoading && !successMsg && setEnabled(!enabled)}>
                <div className={`w-6 h-6 border flex items-center justify-center me-3 transition-colors ${(isLoading || !!successMsg) ? 'opacity-50' : ''} ${enabled ? 'bg-orange border-orange' : 'bg-white border-gray-400'}`}>
                    {enabled && <Check className="text-white w-5 h-5" strokeWidth={3} />}
                </div>
                <span className="text-sm text-black">{t('sms_forward_automatically')}</span>
            </div>

            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                <button 
                    onClick={onClose}
                    disabled={isLoading || !!successMsg}
                    className="px-6 py-2 border border-black bg-white text-black font-bold text-sm hover:bg-gray-50 transition-colors h-10 min-w-[100px]"
                >
                    {t('back')}
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isLoading || !!successMsg}
                    className="px-6 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors"
                >
                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : t('save')}
                </button>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
