
import React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
}

export const AlertModal: React.FC<AlertModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  message,
  type = 'info'
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const isLoading = type === 'loading';

  const getHeaderIcon = () => {
      switch(type) {
          case 'warning': return <AlertTriangle className="text-yellow-500 fill-yellow-500 text-white w-6 h-6 me-2" />;
          case 'error': return <XCircle className="text-red-500 w-6 h-6 me-2" />;
          case 'success': return <CheckCircle className="text-green-600 w-6 h-6 me-2" />;
          default: return null;
      }
  };

  const getTitle = () => {
      if (title) return title;
      switch(type) {
          case 'warning': return 'Warning';
          case 'error': return 'Error';
          case 'success': return 'Success';
          case 'loading': return 'Processing';
          default: return 'Information';
      }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center">
             {getHeaderIcon()}
             <h2 className="text-xl font-bold text-black">{getTitle()}</h2>
          </div>
          {!isLoading && (
            <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
                <X size={24} />
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center mb-6">
              {isLoading && <Loader2 className="w-12 h-12 text-orange animate-spin mb-4" />}
              <p className="text-sm text-black leading-relaxed font-medium text-center">
                {message}
              </p>
          </div>
          {!isLoading && (
            <div className="flex justify-end">
                <button 
                onClick={onClose}
                className="px-8 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm transition-colors uppercase h-10 min-w-[100px]"
                >
                {t('ok')}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
