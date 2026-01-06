
import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkName: string;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, networkName }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm shadow-2xl relative animate-fade-in rounded-none">
        {/* Header/Close Button container */}
        <div className="relative p-6 pb-2 text-center">
             <h2 className="text-xl font-bold text-black">{networkName}</h2>
             <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-gray-500 hover:text-black transition-colors"
             >
                <X size={20} />
             </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 flex flex-col items-center">
            {/* QR Code Image - Using a generator to make it realistic based on the network name */}
            <div className="mb-6">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WIFI:S:${networkName};T:WPA;P:password;;`} 
                    alt="QR Code" 
                    className="w-48 h-48 object-contain"
                />
            </div>
            
            <p className="text-center text-sm text-gray-800 leading-snug">
                {t('scanQrText')}
            </p>
        </div>
      </div>
    </div>,
    document.body
  );
};
