import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface RoamingNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const RoamingNoticeModal: React.FC<RoamingNoticeModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black flex items-center pe-4">
            <AlertTriangle className="text-yellow-500 fill-yellow-500 text-white w-6 h-6 me-3 shrink-0" />
            {t('youre_now_roaming_on_a_foreigner_network')}
          </h2>
          <button onClick={onClose} className="text-black hover:text-gray-600 transition-colors shrink-0">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-1">
          <p className="text-base text-black mb-8">
            {t('this_connection_may_add_supplementary_fees')}
          </p>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              onClick={onClose}
              className="px-8 py-2 border border-black bg-white text-black font-bold text-sm hover:bg-gray-50 transition-colors h-10"
            >
              {t('ok')}
            </button>
            <button
              onClick={onOpenSettings}
              className="px-8 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm transition-colors h-10"
            >
              {t('wa_settings')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

