import React, { useState } from 'react';
import { Menu, Home, ChevronDown, HelpCircle, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface HeaderProps {
  onLogout: () => void;
}

interface Language {
  value: string;
  name: string;
  bit: number;
}

const languageAllList: Language[] = [
  { value: 'cn', name: '中文（简体）', bit: 0 },
  // { value: 'cn_tc', name: '中文（繁體）', bit: 13 },
  { value: 'en', name: 'English', bit: 1 },
  // { value: 'th', name: 'ภาษาไทย', bit: 2 },
  { value: 'el', name: 'Español', bit: 3 },
  // { value: 'po', name: 'Português', bit: 4 },
  { value: 'ar', name: 'العربية', bit: 6 },
  { value: 'fr', name: 'Français', bit: 7 },
  // { value: 'nl', name: 'Nederlands', bit: 8 },
  // { value: 'pl', name: 'Polski', bit: 9 },
  // { value: 'ro', name: 'Română', bit: 10 },
  // { value: 'ru', name: 'Pусский', bit: 11 },
  // { value: 'sk', name: 'Slovenský', bit: 12 },
];

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const currentLang = languageAllList.find(l => l.value === language) || languageAllList.find(l => l.value === 'en');

  return (
    <header className="bg-black text-white h-[60px] flex items-center justify-between px-0 relative z-30">
      <div className="flex items-center h-full">
        <div className="bg-orange h-full px-4 flex items-center justify-center font-bold text-xl me-4">
          <span className="bg-white text-orange text-xs p-0.5 px-1 font-bold me-1">orange</span>
        </div>
        <h1 className="text-xl font-light tracking-wide text-gray-200 hidden sm:block">MAXBOX 5G INDOOR</h1>
      </div>
      
      <div className="flex items-center space-x-6 text-sm pe-6 rtl:space-x-reverse">
        <span className="text-white hidden md:inline">{t('myNumber')}: 8618818902391</span>
        
        {/* Menu Dropdown Container */}
        <div className="relative">
          <div 
            className={`flex items-center space-x-1 cursor-pointer transition-colors rtl:space-x-reverse ${isMenuOpen ? 'text-orange' : 'hover:text-orange'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="font-bold">{t('menu')}</span>
            <Menu size={16} />
          </div>

          {/* Dropdown */}
          {isMenuOpen && (
            <>
              {/* Invisible backdrop to handle click-outside */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setIsMenuOpen(false)} 
              />
              
              <div className="absolute right-0 top-full mt-3 w-48 bg-white text-black shadow-xl border border-gray-200 py-2 z-50 animate-fade-in rounded-sm rtl:left-0 rtl:right-auto">
                <button 
                  className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <HelpCircle size={16} className="me-3" />
                  {t('help')}
                </button>
                <button 
                  className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={16} className="me-3" />
                  {t('settings')}
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors text-red-600 font-bold"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} className="me-3" />
                  {t('logout')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Language Dropdown Container */}
        <div className="relative">
          <div 
            className={`flex items-center space-x-1 cursor-pointer transition-colors rtl:space-x-reverse ${isLangOpen ? 'text-orange' : 'hover:text-orange'}`}
            onClick={() => setIsLangOpen(!isLangOpen)}
          >
            <span>{currentLang?.name}</span>
            <ChevronDown size={14} />
          </div>

          {isLangOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setIsLangOpen(false)} 
              />
              <div className="absolute right-0 top-full mt-3 w-40 bg-white text-black shadow-xl border border-gray-200 py-2 z-50 animate-fade-in rounded-sm max-h-80 overflow-y-auto custom-scrollbar rtl:left-0 rtl:right-auto">
                {languageAllList.map((lang) => (
                  <button 
                    key={lang.value}
                    className={`flex items-center w-full px-4 py-2 text-sm text-start hover:bg-gray-100 hover:text-orange transition-colors ${language === lang.value ? 'font-bold text-orange' : ''}`}
                    onClick={() => {
                      // Check if language is supported in our i18n
                      const supported = ['en', 'cn', 'fr', 'ar', 'el'];
                      if (supported.includes(lang.value)) {
                         setLanguage(lang.value as any);
                      } else {
                         // Fallback to English for unsupported languages in our dict, or just set it but it will fallback to EN keys
                         setLanguage(lang.value as any);
                      }
                      setIsLangOpen(false);
                    }}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Home size={18} className="cursor-pointer hover:text-orange" />
      </div>
    </header>
  );
};