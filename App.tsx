
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConnectionCard } from './components/ConnectionCard';
import { UsageCard } from './components/UsageCard';
import { MessagesCard } from './components/MessagesCard';
import { WifiCard } from './components/WifiCard';
import { ServicesCard } from './components/ServicesCard';
import { LoginModal } from './components/LoginModal';
import { ConnectedDevicesModal } from './components/ConnectedDevicesModal';
import { LanguageProvider } from './utils/i18nContext';
import { GlobalStateProvider, useGlobalState } from './utils/GlobalStateContext';
import { getSessionId, logout } from './utils/api';

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  
  const { isLoggedIn, checkSession, setIsLoggedIn } = useGlobalState();
  
  // Track previous login state to detect transitions
  const prevIsLoggedIn = useRef(isLoggedIn);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openDevicesModal = () => setIsDevicesModalOpen(true);
  const closeDevicesModal = () => setIsDevicesModalOpen(false);

  const handleLogout = async () => {
    if (isLoggedIn) {
      const success = await logout();
      if (success) {
        setIsLoggedIn(false);
      }
    }
  };

  const cardWidth = 300;
  const gap = 24; 

  // Monitor login status to trigger modal on logout/expiration
  useEffect(() => {
    if (prevIsLoggedIn.current === true && isLoggedIn === false) {
      setIsLoginModalOpen(true);
    }
    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  // Heartbeat Effect: Check login status every 10 seconds via Global State
  useEffect(() => {
    // Initial verification
    checkSession();

    const intervalId = setInterval(async () => {
      await checkSession();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [checkSession]);

  // Responsive layout logic for pagination
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Adjust padding calculation based on screen size (p-4 for mobile, p-[60px] for desktop)
      // Note: In CSS below we use md:px-[60px] so the horizontal padding is still 120 total.
      const padding = width < 768 ? 32 : 120; 
      
      // Calculate how many cards fit in one row
      const availableWidth = width - padding;
      const possibleCols = Math.floor((availableWidth + gap) / (cardWidth + gap));
      
      // Clamp between 1 and 5
      const cols = Math.max(1, Math.min(5, possibleCols));
      setCardsPerPage(cols);
    };

    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset to page 1 if layout changes and current page is invalid
  const allCards = [
    <ConnectionCard 
      key="conn" 
      onOpenSettings={openLoginModal} 
      onManageDevices={openDevicesModal}
    />,
    <UsageCard key="usage" />,
    <MessagesCard 
      key="msg" 
      onOpenLogin={openLoginModal}
    />,
    <WifiCard key="wifi" />,
    <ServicesCard 
      key="services" 
      onOpenLogin={openLoginModal}
    />
  ];

  const totalPages = Math.ceil(allCards.length / cardsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [cardsPerPage, totalPages, currentPage]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#e5e5e5]">
      <Header onLogout={handleLogout} onLogin={openLoginModal} />
      
      {/* 
          Updated padding to be responsive: 
          - Mobile: p-4
          - Desktop: px-[60px] pb-[60px] pt-8 (reduced top padding to be closer to header)
          Changed items-start to items-center to center the content when all cards fit.
      */}
      <main className="flex-1 p-4 md:px-[60px] md:pb-[60px] md:pt-8 flex flex-col items-center" dir="ltr"> 
        {/* We keep main LTR for horizontal scrolling logic simplicity, or control via specific dirs */}
        <div 
            className="overflow-hidden transition-all duration-300"
            style={{ width: `${cardsPerPage * cardWidth + (cardsPerPage - 1) * gap}px`, maxWidth: '100%' }}
        >
            <div 
                className="flex flex-row transition-transform duration-500 ease-in-out"
                style={{ 
                    transform: `translateX(-${(currentPage - 1) * cardsPerPage * (cardWidth + gap)}px)`,
                    gap: `${gap}px`
                }}
            >
                {allCards.map((card, index) => (
                    <div key={index} className="shrink-0">
                        {card}
                    </div>
                ))}
            </div>
        </div>
      </main>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex justify-center pb-8 mt-auto">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md transition-colors ${
                    currentPage === pageNum 
                      ? 'bg-black text-white' 
                      : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <ConnectedDevicesModal isOpen={isDevicesModalOpen} onClose={closeDevicesModal} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <GlobalStateProvider>
        <AppContent />
      </GlobalStateProvider>
    </LanguageProvider>
  );
}
