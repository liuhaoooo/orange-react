
import React, { useState } from 'react';
import { Delete } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';

interface ServicesPageProps {
  onOpenSettings: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenSettings }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();
  const [screenText, setScreenText] = useState('');
  const [inputText, setInputText] = useState('');
  const [activeMenu, setActiveMenu] = useState('');

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

  // Login Gate View
  if (!isLoggedIn) {
      return (
          <div className="w-full">
             <h1 className="text-3xl font-bold text-black mb-6">{t('services')}</h1>
             <div className="w-full h-[400px] flex items-center justify-center bg-white border border-gray-200 shadow-sm">
                 <div className="text-center p-8">
                     <p className="mb-4 font-bold text-lg">{t('ussdLoginMsg')}</p>
                     <button 
                        onClick={onOpenSettings}
                        className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 transition-colors"
                     >
                        {t('loginAsAdminBtn')}
                     </button>
                 </div>
             </div>
          </div>
      )
  }

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
            
            <div className="w-full max-w-2xl">
                
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
                        <Delete size={20} className="text-black transform rotate-180" />
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
