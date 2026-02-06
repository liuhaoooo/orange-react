
import React, { useState, useEffect } from 'react';
import { User, ChevronDown, HelpCircle, Settings, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useLanguage, languageAllList } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link, NavLink, useNavigate, useLocation } from '../utils/GlobalStateContext';
import orangeLogo from '../assets/orange-logo.svg';

interface HeaderProps {
  onLogout: () => void;
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for mobile menu
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, globalData } = useGlobalState();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLang = languageAllList.find(l => l.value === language) || languageAllList.find(l => l.value === 'en');
  
  // Get device name from global settings (CMD 585), default to Flybox
  const deviceName = globalData.connectionSettings?.board_type || 'Flybox';
  
  // Check if current page is settings or help
  const isSettingsPage = location.pathname === '/settings';
  const isHelpPage = location.pathname === '/help';

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `h-full flex items-center px-4 transition-colors font-bold text-sm ${
      isActive 
        ? 'text-orange border-b-4 border-orange bg-white/5' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `block w-full py-4 px-6 text-base font-bold border-l-4 transition-colors ${
      isActive 
        ? 'text-orange border-orange bg-white/5' 
        : 'text-gray-300 border-transparent hover:text-white hover:bg-white/5'
    }`;

  // Dynamic classes based on scroll state & viewport
  // Mobile: 60px -> 50px. Desktop: 80px -> 50px.
  const headerHeightClass = isScrolled ? 'h-[50px]' : 'h-[60px] md:h-[80px]';
  
  // Logo sizing: Mobile is always smaller unless scrolled. Desktop starts big.
  const logoSizeClass = isScrolled ? 'h-8 w-8' : 'h-8 w-8 md:h-[50px] md:w-[50px]';
  const logoTextClass = isScrolled ? 'text-lg' : 'text-xl md:text-2xl';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-black text-white shadow-md transition-all duration-300 ${headerHeightClass}`}>
      <div className="w-full max-w-[1450px] mx-auto px-4 md:px-6 h-full flex items-center">
        
        {/* Left: Logo & Title */}
        <div className="flex items-center h-full transition-all duration-300 shrink-0">
          <Link to="/" className="flex items-center h-full group" onClick={() => setIsMobileMenuOpen(false)}>
              <img 
                src={orangeLogo} 
                alt="Orange" 
                className={`me-3 transition-all duration-300 ${logoSizeClass}`}
              />
              <h1 className={`font-bold tracking-tight text-white transition-all duration-300 ${logoTextClass}`}>{deviceName}</h1>
          </Link>
        </div>

        {/* Center: Navigation Links - Desktop Only */}
        {/* Adjusted to align left (next to logo) instead of absolute center */}
        <nav className="hidden md:flex items-center space-x-0 h-full ms-10">
          <NavLink to="/" end className={navLinkClass}>{t('dashboard')}</NavLink>
          <NavLink to="/connection" className={navLinkClass}>{t('connection')}</NavLink>
          <NavLink to="/usage" className={navLinkClass}>{t('usage')}</NavLink>
          <NavLink to="/messages" className={navLinkClass}>{t('messages')}</NavLink>
          <NavLink to="/wifi" className={navLinkClass}>{t('wifiNetworks')}</NavLink>
          <NavLink to="/services" className={navLinkClass}>{t('services')}</NavLink>
        </nav>
        
        {/* Right: Actions & Mobile Toggle */}
        <div className="flex items-center space-x-3 md:space-x-4 ms-auto">
          
          {/* Language Selector */}
          <div className="relative">
              <div 
                  className="flex items-center space-x-1 cursor-pointer text-xs md:text-sm font-bold text-gray-300 hover:text-white"
                  onClick={() => setIsLangOpen(!isLangOpen)}
              >
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
                  
                  {!isHelpPage && (
                    <Link 
                      to="/help"
                      className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors text-black"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <HelpCircle size={16} className="me-3" />
                      {t('help')}
                    </Link>
                  )}
                  
                  {!isSettingsPage && (
                    <button 
                      className="flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 hover:text-orange transition-colors text-black"
                      onClick={() => {
                        setIsMenuOpen(false);
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
                  )}

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

          {/* Mobile Menu Toggle Button */}
          <button 
            className="md:hidden text-white hover:text-orange transition-colors ms-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm border-t border-gray-800 shadow-2xl flex flex-col max-h-[calc(100vh-60px)] overflow-y-auto animate-fade-in">
          <nav className="flex flex-col w-full py-2">
            <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{t('dashboard')}</NavLink>
            <NavLink to="/connection" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{t('connection')}</NavLink>
            <NavLink to="/usage" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{t('usage')}</NavLink>
            <NavLink to="/messages" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{t('messages')}</NavLink>
            <NavLink to="/wifi" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{t('wifiNetworks')}</NavLink>
            <NavLink to="/services" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>{t('services')}</NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};
