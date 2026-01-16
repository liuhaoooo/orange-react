
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSessionId, checkAuthStatus, clearSessionId, fetchStatusInfo, fetchConnectionSettings, fetchWifiSettings } from './api';

interface GlobalStateContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  checkSession: () => Promise<boolean>;
  globalData: Record<string, any>;
  updateGlobalData: (key: string, value: any) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize based on existence of session ID in session storage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getSessionId());
  const [globalData, setGlobalData] = useState<Record<string, any>>({});

  const updateGlobalData = useCallback((key: string, value: any) => {
    setGlobalData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Listen for global auth logout event (triggered by api.ts on NO_AUTH response)
  useEffect(() => {
    const handleAuthLogout = () => {
      if (isLoggedIn) {
        setIsLoggedIn(false);
      }
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout);
    };
  }, [isLoggedIn]);

  const checkSession = useCallback(async () => {
    // 1. Check session storage (client side)
    if (!getSessionId()) {
      if (isLoggedIn) setIsLoggedIn(false);
      return false;
    }

    // 2. Check server status (CMD 104)
    // If server returns NO_AUTH, checkAuthStatus returns false
    const isValid = await checkAuthStatus();
    
    if (!isValid) {
      // Session expired or kicked by server
      clearSessionId(); // Requirement: Clear sessionStorage
      setIsLoggedIn(false); // Requirement: Pop up login modal (handled by App.tsx observing this state)
      return false;
    }
    
    // If valid and state was false, set to true
    if (!isLoggedIn) setIsLoggedIn(true);
    return true;
  }, [isLoggedIn]);

  // Effect 1: Fetch Settings (CMD 585 & 587) - Once on mount and whenever login status changes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Parallel fetch for efficiency
        const [connData, wifiRes] = await Promise.all([
            fetchConnectionSettings(),
            fetchWifiSettings()
        ]);

        // Handle Connection Settings (585)
        if (connData && connData.success !== false) { // Check specific success flag if present, or assume object is success
            updateGlobalData('connectionSettings', connData);
        }
        
        // Handle Wifi Settings (587)
        if (wifiRes && wifiRes.success && wifiRes.data) {
            updateGlobalData('wifiSettings', wifiRes.data);
        }

      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    
    if (isLoggedIn) {
        fetchSettings();
    }
  }, [updateGlobalData, isLoggedIn]);

  // Effect 2: Polling for status info (CMD 586) - Loop every 10 seconds
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchStatus = async () => {
      try {
        // Fetch Status Info (CMD 586)
        const data = await fetchStatusInfo();
        if (data && data.success) {
          updateGlobalData('statusInfo', data);
        }
      } catch (error) {
        console.error('Failed to fetch status info', error);
      }
    };

    if (isLoggedIn) {
        fetchStatus(); // Fetch immediately
        intervalId = setInterval(fetchStatus, 10000); // Fetch every 10 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateGlobalData, isLoggedIn]);

  return (
    <GlobalStateContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      checkSession, 
      globalData, 
      updateGlobalData
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
