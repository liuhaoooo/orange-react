
import React, { useState, useEffect } from 'react';
import { User, ChevronDown, HelpCircle, Settings, LogOut, LogIn } from 'lucide-react';
import { useLanguage, languageAllList } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLogout: () => void;
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn } = useGlobalState();
  const navigate = useNavigate();

  const currentLang = languageAllList.find(l => l.value === language) || languageAllList.find(l => l.value === 'en');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `h-full flex items-center px-4 transition-colors font-bold text-sm ${
      isActive 
        ? 'text-orange border-b-4 border-orange bg-white/5' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  // Dynamic classes based on scroll state
  const headerHeightClass = isScrolled ? 'h-[50px]' : 'h-[80px]';
  const logoBoxClass = isScrolled ? 'px-3' : 'px-5';
  const logoTextClass = isScrolled ? 'text-lg' : 'text-2xl';
  const logoTagClass = isScrolled ? 'text-[10px] p-0.5' : 'text-xs p-0.5 px-1';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md transition-all duration-300 ${headerHeightClass}`}>
      <div className="w-full max-w-[1450px] mx-auto px-4 md:px-6 h-full flex items-center">
        {/* Logo Section */}
        <div className="flex items-center h-full me-4 md:me-8 transition-all duration-300">
          <Link to="/" className="flex items-center h-full group">
              <div className={`bg-orange h-full flex items-center justify-center font-bold me-4 transition-all duration-300 ${logoBoxClass}`}>
                <span className={`bg-white text-orange font-bold me-1 transition-all duration-300 ${logoTagClass}`}>orange</span>
              </div>
              <h1 className={`font-bold tracking-tight text-white transition-all duration-300 ${logoTextClass}`}>Airbox2</h1>
          </Link>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center space-x-0 h-full">
          <NavLink to="/" end className={navLinkClass}>{t('dashboard')}</NavLink>
          <NavLink to="/connection" className={navLinkClass}>{t('connection')}</NavLink>
          <NavLink to="/usage" className={navLinkClass}>{t('usage')}</NavLink>
          <NavLink to="/messages" className={navLinkClass}>{t('messages')}</NavLink>
          <NavLink to="/wifi" className={navLinkClass}>{t('wifiNetworks')}</NavLink>
          <NavLink to="/services" className={navLinkClass}>{t('services')}</NavLink>
        </nav>
        
        {/* Right Side Actions */}
        <div className="ms-auto flex items-center space-x-4">
          
          {/* Language Selector */}
          <div className="relative">
              <div 
                  className="flex items-center space-x-1 cursor-pointer text-sm font-bold text-gray-300 hover:text-white"
                  onClick={() => setIsLangOpen(!isLangOpen)}
              >
                  {/* Changed from currentLang?.value.toUpperCase() to currentLang?.name */}
                  <span>{currentLang?.name}</span>
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
                  <Link 
                    to="/help"
                    className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors text-black"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <HelpCircle size={16} className="me-3" />
                    {t('help')}
                  </Link>
                  <button 
                    className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors text-black"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // If not logged in, prompt login first, otherwise navigate to settings
                      if (!isLoggedIn) {
                        onLogin();
                      } else {
                        navigate('/settings');
                      }
                    }}
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
      </div>
    </header>
  );
};
