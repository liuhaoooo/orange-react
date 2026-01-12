
import React, { useState } from 'react';
import { Menu, User, ChevronDown, HelpCircle, Settings, LogOut, LogIn } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';

interface HeaderProps {
  onLogout: () => void;
  onLogin: () => void;
}

interface Language {
  value: string;
  name: string;
  bit: number;
}

const languageAllList: Language[] = [
  { value: 'cn', name: '中文（简体）', bit: 0 },
  { value: 'en', name: 'English', bit: 1 },
  { value: 'el', name: 'Español', bit: 3 },
  { value: 'ar', name: 'العربية', bit: 6 },
  { value: 'fr', name: 'Français', bit: 7 },
];

export const Header: React.FC<HeaderProps> = ({ onLogout, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn } = useGlobalState();

  const currentLang = languageAllList.find(l => l.value === language) || languageAllList.find(l => l.value === 'en');

  return (
    <header className="bg-black text-white h-[60px] flex items-center px-0 relative z-30 shadow-md">
      {/* Logo Section */}
      <div className="flex items-center h-full me-4 md:me-8">
        <div className="bg-orange h-full px-4 flex items-center justify-center font-bold text-xl me-4">
          <span className="bg-white text-orange text-xs p-0.5 px-1 font-bold me-1">orange</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">Airbox2</h1>
      </div>

      {/* Navigation Links - Desktop */}
      <nav className="hidden md:flex items-center space-x-0 h-full text-sm font-bold text-gray-400">
        <a href="#" className="h-full flex items-center px-4 text-orange border-b-4 border-orange bg-white/5">{t('menu')}</a> 
        {/* Mapping 'Menu' to 'Dashboard' conceptually for now, or just using static labels */}
        <a href="#" className="h-full flex items-center px-4 hover:text-white hover:bg-white/5 transition-colors">{t('connection')}</a>
        <a href="#" className="h-full flex items-center px-4 hover:text-white hover:bg-white/5 transition-colors">{t('usage')}</a>
        <a href="#" className="h-full flex items-center px-4 hover:text-white hover:bg-white/5 transition-colors">{t('messages')}</a>
        <a href="#" className="h-full flex items-center px-4 hover:text-white hover:bg-white/5 transition-colors">{t('wifiNetworks')}</a>
        <a href="#" className="h-full flex items-center px-4 hover:text-white hover:bg-white/5 transition-colors">{t('services')}</a>
      </nav>
      
      {/* Right Side Actions */}
      <div className="ms-auto flex items-center space-x-4 pe-6">
        
        {/* Language Selector */}
        <div className="relative">
            <div 
                className="flex items-center space-x-1 cursor-pointer text-sm font-bold text-gray-300 hover:text-white"
                onClick={() => setIsLangOpen(!isLangOpen)}
            >
                <span>{currentLang?.value.toUpperCase()}</span>
                <ChevronDown size={12} />
            </div>
            {isLangOpen && (
                <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-40 bg-white text-black shadow-xl border border-gray-200 py-2 z-50 rounded-sm">
                    {languageAllList.map((lang) => (
                    <button 
                        key={lang.value}
                        className={`flex items-center w-full px-4 py-2 text-sm text-start hover:bg-gray-100 hover:text-orange ${language === lang.value ? 'font-bold text-orange' : ''}`}
                        onClick={() => {
                           setLanguage(lang.value as any);
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

        {/* User / Settings Menu */}
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer text-white hover:text-orange transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <User size={20} className="fill-current" />
            <ChevronDown size={12} className="ms-1" />
          </div>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-3 w-48 bg-white text-black shadow-xl border border-gray-200 py-2 z-50 rounded-sm animate-fade-in">
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
                  className={`flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors font-bold ${isLoggedIn ? 'text-red-600' : 'text-black'}`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (isLoggedIn) {
                      onLogout();
                    } else {
                      onLogin();
                    }
                  }}
                >
                  {isLoggedIn ? <LogOut size={16} className="me-3" /> : <LogIn size={16} className="me-3" />}
                  {isLoggedIn ? t('logout') : t('login')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
