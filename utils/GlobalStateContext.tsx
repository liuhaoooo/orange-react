
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSessionId, checkAuthStatus, clearSessionId, fetchStatusInfo, fetchConnectionSettings } from './api';

interface GlobalStateContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  checkSession: () => Promise<boolean>;
  globalData: Record<string, any>;
  updateGlobalData: (key: string, value: any) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize based on existence of session ID in local storage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getSessionId());
  const [globalData, setGlobalData] = useState<Record<string, any>>({});

  const updateGlobalData = useCallback((key: string, value: any) => {
    setGlobalData(prev => ({ ...prev, [key]: value }));
  }, []);

  const checkSession = useCallback(async () => {
    // 1. Check local storage
    if (!getSessionId()) {
      if (isLoggedIn) setIsLoggedIn(false);
      return false;
    }

    // 2. Check server status
    // Note: checkAuthStatus returns false if response is NO_AUTH
    const isValid = await checkAuthStatus();
    
    if (!isValid) {
      clearSessionId();
      setIsLoggedIn(false);
      return false;
    }
    
    // If valid and state was false, set to true
    if (!isLoggedIn) setIsLoggedIn(true);
    return true;
  }, [isLoggedIn]);

  // Polling for status info (CMD 586) and Connection info (CMD 1020) - always active
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchInfo = async () => {
      try {
        // Fetch Status Info (CMD 586)
        const data = await fetchStatusInfo();
        if (data && data.success) {
          updateGlobalData('statusInfo', data);
        }

        // Fetch Connection Settings (CMD 1020)
        const connData = await fetchConnectionSettings();
        if (connData && connData.success) {
            updateGlobalData('connectionSettings', connData);
        }

      } catch (error) {
        console.error('Failed to fetch status info', error);
      }
    };

    fetchInfo(); // Fetch immediately on mount
    intervalId = setInterval(fetchInfo, 10000); // Fetch every 10 seconds

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateGlobalData]);

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
