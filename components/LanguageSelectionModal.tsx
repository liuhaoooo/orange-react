
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage, languageAllList } from '../utils/i18nContext';
import { setLanguageSelection } from '../utils/api';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  defaultLanguage?: string;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({ 
  isOpen, 
  onSuccess,
  defaultLanguage = 'en'
}) => {
  const { t, setLanguage: setAppLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // If the incoming defaultLanguage matches one of our supported codes, use it
      // Handle case-insensitivity as API might return uppercase (e.g. 'CN')
      const normalizedDefault = (defaultLanguage || '').toLowerCase();
      const match = languageAllList.find(l => l.value.toLowerCase() === normalizedDefault);
      
      if (match) {
        setSelectedLang(match.value);
        setAppLanguage(match.value as any);
      } else {
        setSelectedLang('en');
        setAppLanguage('en');
      }
    }
  }, [isOpen, defaultLanguage, setAppLanguage]);

  const handleSelect = (val: string) => {
    setSelectedLang(val);
    setAppLanguage(val as any);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const res = await setLanguageSelection(selectedLang);
      if (res && res.success) {
        onSuccess();
      } else {
        // Fallback: even if it fails, maybe we should let them through or show error?
        // Requirement implies we just send packet. We will assume success and trigger refresh.
        console.warn('Language set response not success', res);
        onSuccess();
      }
    } catch (e) {
      console.error('Failed to set language', e);
      // In case of error, still try to proceed so user isn't locked out forever
      onSuccess(); 
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-2xl relative animate-fade-in p-8 rounded-[6px]">
        
        <h2 className="text-2xl font-bold text-black mb-6 text-center">{t('selectLanguage')}</h2>
        
        <div className="space-y-3 mb-8">
            {languageAllList.map((lang) => (
                <div 
                    key={lang.value}
                    onClick={() => handleSelect(lang.value)}
                    className={`
                        flex items-center justify-between px-5 py-4 cursor-pointer border-2 rounded-[6px] transition-all
                        ${selectedLang === lang.value 
                            ? 'border-orange bg-orange/5 text-black' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                    `}
                >
                    <span className="font-bold text-sm">{lang.name}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedLang === lang.value ? 'border-orange' : 'border-gray-300'}`}>
                        {selectedLang === lang.value && (
                            <div className="w-2.5 h-2.5 rounded-full bg-orange" />
                        )}
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full bg-orange hover:bg-orange-dark text-black font-bold py-3.5 text-base transition-colors rounded-[6px] flex items-center justify-center uppercase shadow-md"
        >
            {isLoading && <Loader2 className="animate-spin w-5 h-5 me-2" />}
            {t('ok')}
        </button>

      </div>
    </div>,
    document.body
  );
};
