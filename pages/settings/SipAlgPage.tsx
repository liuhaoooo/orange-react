import React from 'react';
import { useLanguage } from '../../utils/i18nContext';

export const SipAlgPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="bg-white border border-gray-200 rounded-[6px] p-8 text-center text-gray-500">
        {t('sipAlg')} Configuration (Coming Soon)
      </div>
    </div>
  );
};
