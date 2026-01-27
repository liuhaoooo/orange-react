
import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssid: string;
  password?: string;
  authType?: string; // '0'=Open, '2'=WPA2, '3'=WPA/WPA2, '4'=WPA3(SAE)
}

export const QrModal: React.FC<QrModalProps> = ({ 
  isOpen, 
  onClose, 
  ssid, 
  password = '', 
  authType = '3' 
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Generate WIFI URI Scheme
  const getQrData = () => {
    // Determine Type
    // '4' is WPA3 -> SAE
    // '0' is Open -> nopass
    // Others -> WPA
    let typeStr = 'WPA';
    if (authType === '4' || authType === '5') typeStr = 'SAE'; // WPA3 or Mixed WPA3
    if (authType === '0') typeStr = 'nopass';

    // Escape special characters ; and \ with backslash
    const escSsid = ssid.replace(/[;\\]/g, "\\$&");
    const escPass = password.replace(/[;\\]/g, "\\$&");

    // Standard Format: WIFI:T:<type>;S:<ssid>;P:<password>;;
    // For 'nopass', P field is omitted.
    
    // User Example Logic:
    // WIFI:T:${authenticationType=='4'? "SAE" : "WPA"};S:${ssid...};P:${password...};${authenticationType=='4'? ";" : ""}
    
    // Implementation:
    let uri = `WIFI:T:${typeStr};S:${escSsid};`;
    if (typeStr !== 'nopass') {
        uri += `P:${escPass};`;
    }
    // Always end with ; (or ;; for standard compliance, user logic implies conditional ;)
    uri += ';'; 
    
    return uri;
  };

  const qrData = getQrData();
  // Using a higher resolution and margin for better scanning
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(qrData)}`;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm shadow-2xl relative animate-fade-in rounded-none">
        {/* Header/Close Button container */}
        <div className="relative p-6 pb-2 text-center">
             <h2 className="text-xl font-bold text-black break-all">{ssid}</h2>
             <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-gray-500 hover:text-black transition-colors"
             >
                <X size={20} />
             </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 flex flex-col items-center">
            {/* QR Code Image */}
            <div className="mb-6">
                <img 
                    src={qrUrl}
                    alt="QR Code" 
                    className="w-48 h-48 object-contain bg-white"
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
