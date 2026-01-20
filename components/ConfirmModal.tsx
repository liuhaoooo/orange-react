
import React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isLoading 
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">{title || t('deleteConfirmation')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black" disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-black mb-8 leading-relaxed">
            {message || t('deleteMessageConfirm')}
          </p>
          
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-black text-sm font-bold hover:bg-gray-100 transition-colors text-black uppercase"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm transition-colors flex items-center uppercase"
            >
              {isLoading && <Loader2 className="animate-spin w-4 h-4 me-2" />}
              {t('confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
