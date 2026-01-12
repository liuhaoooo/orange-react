
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';

interface ServicesCardProps {
  onOpenLogin?: () => void;
  className?: string;
}

export const ServicesCard: React.FC<ServicesCardProps> = ({ onOpenLogin, className = "" }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();

  const menuItems = [
    { id: 'recharge', label: t('rechargeByCard') },
    { id: 'buy_pass', label: t('buyAPass') },
    { id: 'credit_transfer', label: t('creditTransfer') },
    { id: 'fidelite', label: t('orangeFidelite') },
    { id: 'google', label: t('googleSearch') },
  ];

  // State: Not Logged In
  if (!isLoggedIn) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader title={t('services')} />
        <div className="flex-1 bg-white flex flex-col items-center p-6 text-center justify-center">
             <p className="text-black mb-8 text-sm sm:text-base leading-tight px-2">
               {t('ussdLoginMsg')}
             </p>
             
             <button 
                onClick={onOpenLogin}
                className="border border-black px-6 py-2 font-bold text-sm text-black hover:bg-gray-100 transition-colors"
             >
                {t('loginAsAdminBtn')}
             </button>
        </div>
      </Card>
    );
  }

  // State: Logged In
  return (
    <Card className={`overflow-hidden flex flex-col ${className}`}>
        <CardHeader title={t('services')} />
        <div className="flex-1 bg-white flex flex-col w-full relative">
           {/* Service List */}
           <div className="w-full">
              {menuItems.map((item, index) => (
                <div 
                    key={item.id}
                    className={`w-full py-3 px-4 text-start font-bold text-sm border-b border-gray-200 text-black ${index === 0 ? 'bg-gray-100' : 'bg-white'}`}
                >
                    {item.label}
                </div>
              ))}
           </div>
           
           {/* View Services Button */}
           <div className="mt-auto p-4">
              <Link 
                to="/services"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 text-sm transition-colors"
              >
                {t('viewServices')}
              </Link>
           </div>
        </div>
    </Card>
  );
};
