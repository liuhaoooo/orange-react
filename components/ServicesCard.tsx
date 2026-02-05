
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from '../utils/GlobalStateContext';
import servicesBgSvg from '../assets/services-bg.svg';

interface ServicesCardProps {
  onOpenLogin?: () => void;
  onShowPin?: () => void;
  onShowPuk?: () => void;
  className?: string;
}

export const ServicesCard: React.FC<ServicesCardProps> = ({ 
  onOpenLogin, 
  onShowPin, 
  onShowPuk, 
  className = "" 
}) => {
  const { t } = useLanguage();
  const { isLoggedIn, globalData } = useGlobalState();
  const statusInfo = globalData.statusInfo;
  const connectionSettings = globalData.connectionSettings;

  const isPukLocked = connectionSettings?.lock_puk_flag === '1' || statusInfo?.lock_puk_flag === '1';
  const isPinLocked = connectionSettings?.lock_pin_flag === '1' || statusInfo?.lock_pin_flag === '1';

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
      <Card className={`overflow-hidden flex flex-col ${className}`}>
        <CardHeader title={t('services')} />
        <div className="flex-1 bg-white flex flex-col items-center p-6 text-center justify-center">
             <div className="w-full max-w-[200px] mb-6 relative">
                 <img 
                    src={servicesBgSvg} 
                    alt="Services" 
                    className="w-full h-auto"
                 />
             </div>
             
             <p className="text-black mb-8 text-base leading-tight px-2">
               {t('ussdLoginMsg')}
             </p>
             
             <button 
                onClick={onOpenLogin}
                className="border border-black px-8 py-2.5 font-bold text-base text-black hover:bg-gray-100 transition-colors"
             >
                {t('loginAsAdminBtn')}
             </button>
        </div>
        <div className="p-6 pt-0 bg-white mt-auto">
            <Link 
                to="/services"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
            >
                {t('viewServices')}
            </Link>
        </div>
      </Card>
    );
  }

  // State: Logged In BUT Locked
  if (isLoggedIn && (isPukLocked || isPinLocked)) {
    return (
        <Card className={`overflow-hidden flex flex-col ${className}`}>
            <CardHeader title={t('services')} />
            <div className="flex-1 bg-white flex flex-col items-center p-6 text-center justify-center">
                 <div className="w-full max-w-[200px] mb-6 relative">
                     <img 
                        src={servicesBgSvg} 
                        alt="Services Locked" 
                        className="w-full h-auto"
                     />
                 </div>
                 <p className="text-black mb-6 text-base leading-tight px-2">
                   {t('ussdLoginMsg')}
                 </p>
                 
                 <button 
                    onClick={isPukLocked ? onShowPuk : onShowPin}
                    className="border-2 border-black px-6 py-2 font-bold text-sm text-black hover:bg-gray-50 transition-colors mb-4 uppercase"
                 >
                    {isPukLocked ? t('pukCodeRequired') : t('pinCodeRequired')}
                 </button>
            </div>
            {/* Always show View Services at bottom of card */}
           <div className="p-6 pt-0 bg-white mt-auto">
              <Link 
                to="/services"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
              >
                {t('viewServices')}
              </Link>
           </div>
        </Card>
    );
  }

  // State: Logged In & Unlocked
  return (
    <Card className={`overflow-hidden flex flex-col ${className}`}>
        <CardHeader title={t('services')} />
        <div className="flex-1 bg-white flex flex-col w-full relative">
           {/* Service List */}
           <div className="w-full">
              {menuItems.map((item, index) => (
                <div 
                    key={item.id}
                    className={`w-full py-4 px-5 text-start font-bold text-base border-b border-gray-200 text-black ${index === 0 ? 'bg-gray-100' : 'bg-white'}`}
                >
                    {item.label}
                </div>
              ))}
           </div>
           
           {/* View Services Button */}
           <div className="mt-auto p-6">
              <Link 
                to="/services"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
              >
                {t('viewServices')}
              </Link>
           </div>
        </div>
    </Card>
  );
};
