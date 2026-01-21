
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { ConnectionPage } from './pages/ConnectionPage';
import { UsagePage } from './pages/UsagePage';
import { MessagesPage } from './pages/MessagesPage';
import { WifiNetworksPage } from './pages/WifiNetworksPage';
import { ServicesPage } from './pages/ServicesPage';
import { HelpPage } from './pages/HelpPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginModal } from './components/LoginModal';
import { ConnectedDevicesModal } from './components/ConnectedDevicesModal';
import { EditSsidModal } from './components/EditSsidModal';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';
import { PasswordWarningModal } from './components/PasswordWarningModal';
import { PasswordChangeModal } from './components/PasswordChangeModal';
import { PinRequiredModal } from './components/PinRequiredModal';
import { PukRequiredModal } from './components/PukRequiredModal';
import { SoftwareUpdateModal } from './components/SoftwareUpdateModal';
import { LanguageProvider } from './utils/i18nContext';
import { GlobalStateProvider, useGlobalState } from './utils/GlobalStateContext';
import { logout, fetchConnectionSettings } from './utils/api';
import { WifiNetwork } from './types';

function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [isEditSsidModalOpen, setIsEditSsidModalOpen] = useState(false);
  
  // Modal States
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [initialLang, setInitialLang] = useState('en');
  
  const [isPwdWarningOpen, setIsPwdWarningOpen] = useState(false);
  const [isPwdChangeOpen, setIsPwdChangeOpen] = useState(false);
  const [pwdWarningDismissed, setPwdWarningDismissed] = useState(false);
  
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPukModalOpen, setIsPukModalOpen] = useState(false);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const [devicesFilter, setDevicesFilter] = useState<string | undefined>(undefined);
  const [editingNetwork, setEditingNetwork] = useState<WifiNetwork | undefined>(undefined);
  
  const { isLoggedIn, checkSession, setIsLoggedIn, globalData, updateGlobalData } = useGlobalState();
  
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
        // Reset warnings on logout
        setPwdWarningDismissed(false);
        setIsPwdWarningOpen(false);
        setIsPwdChangeOpen(false);
        setIsPinModalOpen(false);
        setIsPukModalOpen(false);
        setIsUpdateModalOpen(false);
      }
    }
  };

  // Check Settings Loop (Language -> PUK -> Password -> PIN -> Software Update)
  useEffect(() => {
    const settings = globalData.connectionSettings;
    const accountLevel = globalData.accountLevel;

    if (!settings) return;

    let showLang = false;
    let showPwd = false;
    let showPin = false;
    let showPuk = false;
    let showUpdate = false;

    // 1. Language (Always check first)
    if (settings.need_change_language !== '1') {
        showLang = true;
        if (settings.language) setInitialLang(settings.language);
    } 
    // 2. PUK Check (Highest Priority for SIM)
    else if (settings.lock_puk_flag === '1') {
        showPuk = true;
    }
    // 3. Password (Only if logged in and PUK not showing)
    else if (isLoggedIn) {
        // Password Check
        if (settings.need_change_password !== '1' && !pwdWarningDismissed && accountLevel === '3') {
             if (!isPwdChangeOpen) {
                 showPwd = true;
             }
        } 
        
        // 4. PIN Check (Only if Password handled/skipped)
        if (!showPwd && !isPwdChangeOpen) {
            if (settings.sim_status === '1' && settings.lock_pin_flag === '1') {
                showPin = true;
            }

            // 5. Software Update Check (Only if PIN handled/skipped)
            if (!showPin) {
                if (settings.needSelectAutoupgrade !== '1') {
                    showUpdate = true;
                }
            }
        }
    }

    // Apply States
    setIsLangModalOpen(showLang);
    
    // Only toggle warning if change modal is NOT open to avoid flicker/conflict
    if (!isPwdChangeOpen) {
        setIsPwdWarningOpen(showPwd);
    }
    
    setIsPukModalOpen(showPuk);
    setIsPinModalOpen(showPin);
    setIsUpdateModalOpen(showUpdate);

  }, [globalData.connectionSettings, globalData.accountLevel, isLoggedIn, pwdWarningDismissed, isPwdChangeOpen]);

  const handleLanguageSelected = async () => {
    setIsLangModalOpen(false);
    refreshSettings();
  };

  const handleClosePwdWarning = (doNotRemind: boolean) => {
      setIsPwdWarningOpen(false);
      setPwdWarningDismissed(true);
  };

  const handleChangePwdNow = () => {
      setIsPwdWarningOpen(false);
      setIsPwdChangeOpen(true);
  };

  const handlePwdChangeSuccess = async () => {
      setIsPwdChangeOpen(false);
      refreshSettings();
  };

  const handlePinSuccess = async () => {
      setIsPinModalOpen(false);
      refreshSettings();
  };

  const handlePukSuccess = async () => {
      setIsPukModalOpen(false);
      refreshSettings();
  };

  const handleUpdateSuccess = async () => {
      setIsUpdateModalOpen(false);
      refreshSettings();
  };

  const refreshSettings = async () => {
    try {
        const data = await fetchConnectionSettings();
        if (data && data.success !== false) {
            updateGlobalData('connectionSettings', data);
        }
    } catch (e) {
        console.error("Failed to refresh settings", e);
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
        
        {/* Updated max-w to 1450px for wider layout */}
        <main className="w-full max-w-[1450px] mx-auto p-4 md:p-6 pt-[120px] md:pt-[120px] relative z-0 flex-grow" dir="ltr">
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

            {/* Help Page */}
            <Route 
              path="/help" 
              element={<HelpPage />} 
            />

            {/* Settings Page */}
            <Route 
              path="/settings" 
              element={<SettingsPage onOpenLogin={openLoginModal} />} 
            />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer Section */}
        <footer className="w-full bg-black py-6 mt-auto shrink-0 z-10">
            <div className="w-full max-w-[1450px] mx-auto px-4 md:px-6">
                <span className="text-white font-bold text-sm">
                    &copy; <span className="text-orange">Orange</span> {new Date().getFullYear()}
                </span>
            </div>
        </footer>

        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        <ConnectedDevicesModal isOpen={isDevicesModalOpen} onClose={closeDevicesModal} filterSsid={devicesFilter} />
        <EditSsidModal isOpen={isEditSsidModalOpen} onClose={closeEditSsidModal} network={editingNetwork} />
        <LanguageSelectionModal 
            isOpen={isLangModalOpen} 
            onSuccess={handleLanguageSelected}
            defaultLanguage={initialLang} 
        />
        
        {/* Password Modals */}
        <PasswordWarningModal 
            isOpen={isPwdWarningOpen} 
            onClose={handleClosePwdWarning}
            onChangeNow={handleChangePwdNow}
        />
        <PasswordChangeModal 
            isOpen={isPwdChangeOpen} 
            onClose={() => setIsPwdChangeOpen(false)}
            onSuccess={handlePwdChangeSuccess}
        />
        
        {/* PIN Modal */}
        <PinRequiredModal 
            isOpen={isPinModalOpen}
            onClose={() => setIsPinModalOpen(false)}
            onSuccess={handlePinSuccess}
            remainingAttempts={globalData.connectionSettings?.pin_left_times || '3'}
        />

        {/* PUK Modal */}
        <PukRequiredModal 
            isOpen={isPukModalOpen}
            onClose={() => setIsPukModalOpen(false)}
            onSuccess={handlePukSuccess}
            remainingAttempts={globalData.connectionSettings?.puk_left_times}
        />

        {/* Software Update Modal */}
        <SoftwareUpdateModal 
            isOpen={isUpdateModalOpen}
            onSuccess={handleUpdateSuccess}
        />

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
