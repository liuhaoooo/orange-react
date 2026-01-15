
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ConnectionPage } from './pages/ConnectionPage';
import { UsagePage } from './pages/UsagePage';
import { MessagesPage } from './pages/MessagesPage';
import { WifiNetworksPage } from './pages/WifiNetworksPage';
import { ServicesPage } from './pages/ServicesPage';
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
    <Router>
      <div className="min-h-screen flex flex-col font-sans bg-[#e5e5e5]">
        <Header onLogout={handleLogout} onLogin={openLoginModal} />
        
        {/* Increased padding-top to pt-[160px] to ensure header does not overlap card titles */}
        <main className="w-full max-w-[1200px] mx-auto p-4 md:p-6 pt-[160px] relative z-0" dir="ltr">
          <Routes>
            {/* Main Dashboard Route */}
            <Route 
              path="/" 
              element={
                <Dashboard 
                  onOpenLogin={openLoginModal} 
                  onOpenDevices={openDevicesModal} 
                  onEditSsid={openEditSsidModal} 
                />
              } 
            />
            
            {/* Connection Detail Page */}
            <Route 
              path="/connection" 
              element={
                <ConnectionPage 
                  onOpenSettings={openLoginModal}
                  onManageDevices={() => openDevicesModal()}
                />
              } 
            />
            
            {/* Usage Page */}
            <Route 
              path="/usage" 
              element={
                <UsagePage 
                   onOpenSettings={openLoginModal}
                />
              } 
            />
            
            {/* Messages Page */}
            <Route 
              path="/messages" 
              element={
                <MessagesPage 
                   onOpenSettings={openLoginModal}
                />
              } 
            />

            {/* Wifi Networks Page */}
            <Route 
              path="/wifi" 
              element={
                <WifiNetworksPage 
                  onOpenSettings={openLoginModal} 
                  onOpenDevices={openDevicesModal} 
                  onEditSsid={openEditSsidModal} 
                />
              } 
            />

            {/* Services Page */}
            <Route 
              path="/services" 
              element={
                <ServicesPage 
                  onOpenSettings={openLoginModal}
                />
              } 
            />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <ConnectedDevicesModal isOpen={isDevicesModalOpen} onClose={closeDevicesModal} filterSsid={devicesFilter} />
        <EditSsidModal isOpen={isEditSsidModalOpen} onClose={closeEditSsidModal} network={editingNetwork} />
      </div>
    </Router>
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
