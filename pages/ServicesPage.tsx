
import React, { useState, useEffect } from 'react';
import { Delete, Loader2 } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState, useLocation, useNavigate } from '../utils/GlobalStateContext';
import servicesBgSvg from '../assets/services-bg.svg';
import { getServicesByPlmn, PlmnServiceItem } from '../utils/services/plmnServices';
import { apiRequest } from '../utils/api';
import { useAlert } from '../utils/AlertContext';

interface ServicesPageProps {
  onOpenSettings: () => void;
  onShowPin: () => void;
  onShowPuk: () => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onOpenSettings, onShowPin, onShowPuk }) => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, globalData } = useGlobalState();
  const [screenText, setScreenText] = useState('');
  const [inputText, setInputText] = useState('');
  const [activeMenu, setActiveMenu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelDisabled, setIsCancelDisabled] = useState(true);
  
  const statusInfo = globalData.statusInfo;
  const connectionSettings = globalData.connectionSettings;

  // Determine lock state
  const isPukLocked = connectionSettings?.lock_puk_flag === '1' || statusInfo?.lock_puk_flag === '1';
  const isPinLocked = connectionSettings?.lock_pin_flag === '1' || statusInfo?.lock_pin_flag === '1';

  const plmn = statusInfo?.PLMN || '';
  const menuItems = getServicesByPlmn(plmn);

  const hex2char = (hex: string) => {
    let result = '';
    let n = parseInt(hex, 16);
    if (n <= 0xffff) {
      result += String.fromCharCode(n);
    } else if (n <= 0x10ffff) {
      n -= 0x10000;
      result +=
        String.fromCharCode(0xd800 | (n >> 10)) +
        String.fromCharCode(0xdc00 | (n & 0x3ff));
    }
    return result;
  };

  const decodeMessage = (str: string) => {
    if (!str) return '';
    let specialCharsIgnoreWrap = ['0009', '0000'];
    let specials = specialCharsIgnoreWrap;
    return str.replace(/([A-Fa-f0-9]{1,4})/g, (parens) => {
      if (!specials.includes(parens)) {
        return hex2char(parens);
      } else {
        return '';
      }
    });
  };

  const executeUssd = async (item: PlmnServiceItem | { subcmd?: string; ussd_code?: string }, isCancel = false) => {
    setIsLoading(true);
    try {
      const payload = {
        cmd: 560,
        subcmd: item.subcmd || "0",
        ussd_code: item.ussd_code || "",
        timeout: 30000,
        method: 'POST'
      };
      const res = await apiRequest(560, 'POST', payload);
      
      if (res && res.success && res.ret === '0') {
        if (isCancel) {
          setScreenText("Cancel successful");
          setIsCancelDisabled(true);
        } else {
          setScreenText(decodeMessage(res.message));
          
          if (res.ussd_st === '0' || res.ussd_st === '2') {
            setIsCancelDisabled(true);
          } else if (res.ussd_st === '1') {
            setIsCancelDisabled(false);
          } else {
            const ussdStMap: Record<string, string> = {
              "3": "Other local client has responded",
              "4": "Operation not supported",
              "5": "Network time out",
            };
            setScreenText(ussdStMap[res.ussd_st] || "Unsupported USSD code");
          }
        }
      } else {
        const retMap: Record<string, string> = {
          "500": "General error!",
          "501": "The current state does not support the operation.",
          "502": "AT command returns error!",
          "506": "Illegal parameter.",
          "507": "Operation timeout!",
          "601": "Sending SMS registration error",
          "602": "Mailbox is full",
        };
        setScreenText(retMap[res?.ret] || "Unsupported USSD code");
      }
    } catch (e) {
      setScreenText("General error!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && location.state?.executeService) {
      const service = location.state.executeService;
      setActiveMenu(service.id);
      executeUssd(service);
      
      // Clear state so it doesn't re-execute on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [isLoggedIn, location.state, navigate]);

  // Authentication check wrapper
  const handleInteraction = (action: () => void) => {
    if (!isLoggedIn) {
      onOpenSettings();
    } else {
      action();
    }
  };

  const handleItemClick = async (item: PlmnServiceItem) => {
    handleInteraction(async () => {
      setActiveMenu(item.id);
      if (item.url) {
        window.open(item.url, '_blank');
        return;
      }

      setScreenText('');
      executeUssd(item);
    });
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
        if (isCancelDisabled) return;
        setInputText('');
        executeUssd({ subcmd: '1' }, true);
      });
  };

  const handleSend = () => {
      handleInteraction(() => {
        if (!inputText) return;
        executeUssd({ subcmd: '0', ussd_code: inputText });
        setInputText('');
      });
  };

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
                {menuItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {t('no_services_are_found')}
                  </div>
                ) : (
                  menuItems.map((item) => (
                      <button 
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`w-full text-start px-4 py-3 font-bold text-sm border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors ${activeMenu === item.id ? 'text-orange bg-gray-50' : 'text-black'}`}
                      >
                          {item.label}
                      </button>
                  ))
                )}
             </div>
        </div>

        {/* Right Content Area - Virtual Keyboard */}
        <div className="flex-1 bg-white border border-gray-200 p-6 pt-4">
            <h3 className="font-bold text-black text-lg mb-4">{t('useKeyboard')}</h3>
            
            <div className="w-full">
                
                {/* Screen Display */}
                <div className="border border-gray-300 h-48 mb-4 p-2 text-sm font-mono overflow-y-auto bg-white shadow-inner text-black whitespace-pre-wrap relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                            <Loader2 className="w-8 h-8 animate-spin text-orange" />
                        </div>
                    ) : (
                        screenText
                    )}
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
                        disabled={isCancelDisabled || isLoading}
                        className={`w-24 font-bold text-sm transition-colors h-10 ${
                            isCancelDisabled || isLoading 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {t('cancel')}
                    </button>

                    <button 
                        onClick={handleSend}
                        disabled={isLoading}
                        className={`w-24 font-bold text-sm transition-colors h-10 ${
                            isLoading 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-orange hover:bg-orange-dark text-black'
                        }`}
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
