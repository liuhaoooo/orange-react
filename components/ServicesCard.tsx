
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';
import { Cpu, Smartphone, Tablet, Signal } from 'lucide-react';

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

  // Illustration reused from ServicesPage
  const LockStateIllustration = () => (
    <div className="relative w-full h-32 flex justify-center items-center mb-6">
        {/* SIM Card (Top Center) */}
        <div className="absolute top-0 transform -translate-y-2 flex flex-col items-center z-10">
            <Signal className="w-10 h-10 text-orange mb-1 rotate-180 transform opacity-50" strokeWidth={3} />
            <div className="w-16 h-12 bg-black rounded-md flex items-center justify-center border-2 border-white shadow-md relative">
                 <Cpu className="text-white w-8 h-8" />
                 {/* Lock overlay if locked */}
                 <div className="absolute -bottom-2 -right-2 bg-orange p-0.5 rounded-sm border border-white">
                     <div className="w-2.5 h-3.5 border-2 border-white rounded-t-lg bg-transparent mx-auto mb-0.5"></div>
                     <div className="w-3.5 h-2.5 bg-white rounded-sm"></div>
                 </div>
            </div>
            {/* Signal rays downwards */}
            <div className="flex space-x-4 mt-2">
                 <div className="w-1 h-1 bg-orange rounded-full animate-ping"></div>
                 <div className="w-1 h-1 bg-orange rounded-full animate-ping delay-75"></div>
                 <div className="w-1 h-1 bg-orange rounded-full animate-ping delay-150"></div>
            </div>
        </div>
        
        {/* Devices (Bottom) */}
        <div className="absolute bottom-0 flex justify-between w-56 items-end px-2">
             <div className="flex flex-col items-center transform -rotate-6">
                <Smartphone className="w-12 h-20 text-[#e8ae79] fill-[#e8ae79]" strokeWidth={1} />
                <div className="w-5 h-14 bg-[#e8ae79] opacity-30 absolute bottom-0 -z-10 transform skew-x-12"></div>
             </div>
             
             <div className="flex flex-col items-center z-20">
                <Smartphone className="w-10 h-16 text-black fill-white border-2 border-black rounded-lg" strokeWidth={2} />
             </div>

             <div className="flex flex-col items-center transform rotate-6">
                <Tablet className="w-16 h-12 text-[#8a6d55] fill-[#8a6d55]" strokeWidth={1} />
             </div>
        </div>
    </div>
  );

  // State: Not Logged In
  if (!isLoggedIn) {
    return (
      <Card className={`overflow-hidden flex flex-col ${className}`}>
        <CardHeader title={t('services')} />
        <div className="flex-1 bg-white flex flex-col items-center p-6 text-center justify-center">
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
                 <LockStateIllustration />
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
