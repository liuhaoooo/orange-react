
import React, { useState } from 'react';
import { Delete } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import servicesBgSvg from '../assets/services-bg.png';

interface ServicesPageProps {
  onOpenSettings: () => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenSettings, onShowPin, onShowPuk }) => {
  const { t } = useLanguage();
  const { isLoggedIn, globalData } = useGlobalState();
  const [screenText, setScreenText] = useState('');
  const [inputText, setInputText] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  
  const statusInfo = globalData.statusInfo;
  const connectionSettings = globalData.connectionSettings;

  // Determine lock state
  const isPukLocked = connectionSettings?.lock_puk_flag === '1' || statusInfo?.lock_puk_flag === '1';
  const isPinLocked = connectionSettings?.lock_pin_flag === '1' || statusInfo?.lock_pin_flag === '1';

  // Authentication check wrapper
  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenSettings();
    } else {
      action();
    }
  };

  const handleKeyPress = (key: string) => {
      handleInteraction(() => {
          setInputText(prev => prev + key);
      });
  };

  const handleBackspace = () => {
    handleInteraction(() => {
      setInputText(prev => prev.slice(0, -1));
    });
  };

  const handleCancel = () => {
      handleInteraction(() => {
        setInputText('');
      });
  };

  const handleSend = () => {
      handleInteraction(() => {
        if (!inputText) return;
        setScreenText(prev => prev + (prev ? '\n' : '') + `> ${inputText}`);
        setInputText('');
      });
  };

  const menuItems = [
    { id: 'recharge', label: t('rechargeByCard') },
    { id: 'buy_pass', label: t('buyAPass') },
    { id: 'credit_transfer', label: t('creditTransfer') },
    { id: 'fidelite', label: t('orangeFidelite') },
    { id: 'google', label: t('googleSearch') },
  ];

  // Locked State View (Priority over USSD)
  if (isLoggedIn && (isPukLocked || isPinLocked)) {
    return (
        <div className="w-full">
             <h1 className="text-3xl font-bold text-black mb-6">{t('services')}</h1>
             <div className="w-full min-h-[500px] flex items-center justify-center bg-white border border-gray-200 shadow-sm flex-col">
                 <div className="text-center p-8 max-w-md w-full flex flex-col items-center">
                     <div className="w-full max-w-[200px] mb-8 relative">
                         <img 
                            src={servicesBgSvg} 
                            alt="Services Locked" 
                            className="w-full h-auto"
                         />
                     </div>
                     
                     <p className="mb-8 text-black text-base leading-tight">
                         {t('ussdLoginMsg')}
                     </p>
                     
                     <button 
                        onClick={isPukLocked ? onShowPuk : onShowPin}
                        className="w-full max-w-[280px] bg-white border-2 border-black hover:bg-gray-50 text-black font-bold py-3 px-6 transition-colors mb-4 text-base"
                     >
                        {isPukLocked ? t('pukCodeRequired') : t('pinCodeRequired')}
                     </button>
                 </div>
             </div>
        </div>
    );
  }

  // Login Gate View
  if (!isLoggedIn) {
      return (
          <div className="w-full">
             <h1 className="text-3xl font-bold text-black mb-6">{t('services')}</h1>
             <div className="w-full min-h-[500px] flex items-center justify-center bg-white border border-gray-200 shadow-sm flex-col">
                 <div className="text-center p-8 max-w-md w-full flex flex-col items-center">
                     <div className="w-full max-w-[280px] mb-8 relative">
                         <img 
                            src={servicesBgSvg} 
                            alt="Services Login" 
                            className="w-full h-auto"
                         />
                     </div>

                     <p className="mb-8 font-bold text-lg">{t('ussdLoginMsg')}</p>
                     <button 
                        onClick={onOpenSettings}
                        className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-8 transition-colors w-full max-w-[200px]"
                     >
                        {t('loginAsAdminBtn')}
                     </button>
                 </div>
             </div>
          </div>
      )
  }

  // Main USSD Interface
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-black mb-6">{t('services')}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0">
             <div className="bg-white border border-gray-200">
                {menuItems.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => handleInteraction(() => setActiveMenu(item.id))}
                        className={`w-full text-start px-4 py-3 font-bold text-sm border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors ${activeMenu === item.id ? 'text-orange bg-gray-50' : 'text-black'}`}
                    >
                        {item.label}
                    </button>
                ))}
             </div>
        </div>

        {/* Right Content Area - Virtual Keyboard */}
        <div className="flex-1 bg-white border border-gray-200 p-6 pt-4">
            <h3 className="font-bold text-black text-lg mb-4">{t('useKeyboard')}</h3>
            
            <div className="w-full">
                
                {/* Screen Display */}
                <div className="border border-gray-300 h-48 mb-4 p-2 text-sm font-mono overflow-y-auto bg-white shadow-inner text-black whitespace-pre-wrap">
                    {screenText}
                </div>

                {/* Input Controls Row */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 border border-gray-300 px-3 flex items-center bg-white font-bold text-black h-10 min-w-0">
                        {inputText}
                    </div>
                    
                    <button 
                        onClick={handleBackspace}
                        className="w-16 border border-black flex items-center justify-center hover:bg-gray-100 transition-colors bg-white h-10"
                    >
                        <Delete size={20} className="text-black" />
                    </button>

                    <button 
                        onClick={handleCancel}
                        className="w-24 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors h-10"
                    >
                        {t('cancel')}
                    </button>

                    <button 
                        onClick={handleSend}
                        className="w-24 bg-orange hover:bg-orange-dark text-black font-bold text-sm transition-colors h-10"
                    >
                        {t('send')}
                    </button>
                </div>

                {/* Keypad Grid (4 columns as per screenshot) */}
                <div className="grid grid-cols-4 gap-4">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#'].map((key) => (
                        <button 
                            key={key}
                            onClick={() => handleKeyPress(key)}
                            className="bg-white border-2 border-black h-10 text-sm font-bold text-black hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        >
                            {key}
                        </button>
                    ))}
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};
