
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConnectionCard } from './components/ConnectionCard';
import { UsageCard } from './components/UsageCard';
import { MessagesCard } from './components/MessagesCard';
import { WifiCard } from './components/WifiCard';
import { ServicesCard } from './components/ServicesCard';
import { LoginModal } from './components/LoginModal';
import { ConnectedDevicesModal } from './components/ConnectedDevicesModal';
import { EditSsidModal } from './components/EditSsidModal';
import { LanguageProvider } from './utils/i18nContext';
import { GlobalStateProvider, useGlobalState } from './utils/GlobalStateContext';
import { logout } from './utils/api';
import { WifiNetwork } from './types';

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isEditSsidModalOpen, setIsEditSsidModalOpen] = useState(false);
  
  const [devicesFilter, setDevicesFilter] = useState<string | undefined>(undefined);
  const [editingNetwork, setEditingNetwork] = useState<WifiNetwork | undefined>(undefined);
  
  const { isLoggedIn, checkSession, setIsLoggedIn } = useGlobalState();
  
  const prevIsLoggedIn = useRef(isLoggedIn);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openDevicesModal = (ssid?: string) => {
    setDevicesFilter(ssid);
    setIsDevicesModalOpen(true);
  };
  
  const closeDevicesModal = () => {
    setIsDevicesModalOpen(false);
    setDevicesFilter(undefined);
  };

  const openEditSsidModal = (network: WifiNetwork) => {
    setEditingNetwork(network);
    setIsEditSsidModalOpen(true);
  };

  const closeEditSsidModal = () => {
    setIsEditSsidModalOpen(false);
    setEditingNetwork(undefined);
  };

  const handleLogout = async () => {
    if (isLoggedIn) {
      const success = await logout();
      if (success) {
        setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    if (prevIsLoggedIn.current === true && isLoggedIn === false) {
      setIsLoginModalOpen(true);
    }
    prevIsLoggedIn.current = isLoggedIn;
  }, [isLoggedIn]);

  useEffect(() => {
    checkSession();
    const intervalId = setInterval(async () => {
      await checkSession();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [checkSession]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#e5e5e5]">
      <Header onLogout={handleLogout} onLogin={openLoginModal} />
      
      <main className="w-full max-w-[1200px] mx-auto p-4 md:p-6 space-y-6" dir="ltr">
        
        {/* Row 1: Connection and Messages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[450px]">
             <ConnectionCard 
               onOpenSettings={openLoginModal} 
               onManageDevices={() => openDevicesModal()}
             />
          </div>
          <div className="h-[450px]">
             <MessagesCard 
               onOpenLogin={openLoginModal}
             />
          </div>
        </div>

        {/* Row 2: Usage, Wi-Fi, Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-[450px]">
            <UsageCard />
          </div>
          <div className="h-[450px]">
            <WifiCard 
              onManageDevices={openDevicesModal}
              onOpenLogin={openLoginModal}
              onEditSsid={openEditSsidModal}
            />
          </div>
          <div className="h-[450px]">
            <ServicesCard 
              onOpenLogin={openLoginModal}
              className="h-full"
            />
          </div>
        </div>

      </main>

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <ConnectedDevicesModal isOpen={isDevicesModalOpen} onClose={closeDevicesModal} filterSsid={devicesFilter} />
      <EditSsidModal isOpen={isEditSsidModalOpen} onClose={closeEditSsidModal} network={editingNetwork} />
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
