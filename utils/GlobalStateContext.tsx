
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { getSessionId, checkAuthStatus, clearSessionId, fetchStatusInfo, fetchConnectionSettings, fetchWifiSettings, fetchAccountLevel, fetchGlobalConfig } from './api';

// --- Custom Router Implementation ---
interface LocationState {
  pathname: string;
  search: string;
  state: any;
}

const RouterContext = createContext<{ 
    path: string; 
    navigate: (to: string | number, options?: any) => void;
    location: LocationState;
} | undefined>(undefined);

export const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fullPath, setFullPath] = useState(window.location.hash.slice(1) || '/');
    const [state, setState] = useState<any>(window.history.state);

    useEffect(() => {
        const onLocationChange = () => {
            setFullPath(window.location.hash.slice(1) || '/');
            setState(window.history.state);
        };
        window.addEventListener('hashchange', onLocationChange);
        window.addEventListener('popstate', onLocationChange);
        return () => {
            window.removeEventListener('hashchange', onLocationChange);
            window.removeEventListener('popstate', onLocationChange);
        };
    }, []);

    const navigate = useCallback((to: string | number, options?: { state?: any, replace?: boolean }) => {
        if (typeof to === 'number') {
            window.history.go(to);
            return;
        }
        
        const url = '#' + to;
        const newState = options?.state || null;
        
        if (options?.replace) {
            window.history.replaceState(newState, '', url);
        } else {
            window.history.pushState(newState, '', url);
        }
        
        // Manually update state since pushState doesn't trigger listeners
        setFullPath(to);
        setState(newState);
        
        // Dispatch a custom event or hashchange so others know (optional but good practice)
        window.dispatchEvent(new Event('hashchange'));
    }, []);

    // Split fullPath (e.g. "/settings?section=network") into pathname and search
    const [pathname, ...searchParts] = fullPath.split('?');
    const search = searchParts.length > 0 ? `?${searchParts.join('?')}` : '';

    const location = { pathname: pathname || '/', search, state };

    return <RouterContext.Provider value={{ path: pathname, navigate, location }}>{children}</RouterContext.Provider>;
};

export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const ctx = useContext(RouterContext);
    const path = ctx ? ctx.location.pathname : '/';
    let foundElement: React.ReactNode = null;
    
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        if (foundElement) return; // Already found a match
        
        const { path: routePath, element } = child.props as { path: string; element: React.ReactNode };
        
        // Simple exact match or * wildcard
        if (routePath === '*' || routePath === path) {
            foundElement = element;
        }
    });
    
    return <>{foundElement}</>;
};

export const Route: React.FC<{ path: string; element: React.ReactNode }> = () => null;

export const Link: React.FC<{ to: string; children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }> = ({ to, children, className, onClick }) => {
    const ctx = useContext(RouterContext);
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) onClick(e);
        if (!e.defaultPrevented && ctx) {
            e.preventDefault();
            ctx.navigate(to);
        }
    };
    return (
        <a href={`#${to}`} className={className} onClick={handleClick}>
            {children}
        </a>
    );
};

export const NavLink: React.FC<{ to: string; children: React.ReactNode; className: (props: { isActive: boolean }) => string; end?: boolean; onClick?: (e: React.MouseEvent) => void }> = ({ to, children, className, end, onClick }) => {
    const ctx = useContext(RouterContext);
    const currentPath = ctx ? ctx.location.pathname : '/';
    const isActive = end ? currentPath === to : currentPath.startsWith(to);
    
    const handleClick = (e: React.MouseEvent) => {
        if (onClick) onClick(e);
        if (!e.defaultPrevented && ctx) {
            e.preventDefault();
            ctx.navigate(to);
        }
    };

    return (
        <a href={`#${to}`} className={className({ isActive })} onClick={handleClick}>
            {children}
        </a>
    );
};

export const useNavigate = () => {
    const ctx = useContext(RouterContext);
    if (!ctx) return () => {};
    return ctx.navigate;
};

export const useLocation = () => {
    const ctx = useContext(RouterContext);
    if (!ctx) return { pathname: '/', search: '', state: null };
    return ctx.location;
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(to, { replace });
    }, [to, replace, navigate]);
    return null;
};

// --- End Router Implementation ---

interface GlobalStateContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  checkSession: () => Promise<boolean>;
  globalData: Record<string, any>;
  updateGlobalData: (key: string, value: any) => void;
  isDebugMode: boolean;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize based on existence of session ID in session storage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getSessionId());
  const [globalData, setGlobalData] = useState<Record<string, any>>({});

  const updateGlobalData = useCallback((key: string, value: any) => {
    setGlobalData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Compute debug mode based on connectionSettings
  const isDebugMode = useMemo(() => {
      const s = globalData.connectionSettings;
      if (!s) return false;
      return s.build_type === 'debug' || s.ver_type === 'debug' || s.ver_type === 'dbg';
  }, [globalData.connectionSettings]);

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

  // Effect 1: Fetch Settings (CMD 585 & 587 & 588 & 1017)
  // CMD 585 can be fetched without login. CMD 587, 588, 1017 require login.
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Always fetch Connection Settings (585) as it is public
        const connData = await fetchConnectionSettings();
        if (connData && connData.success !== false) { 
            updateGlobalData('connectionSettings', connData);
        }
        
        // Only fetch Wifi Settings (587) and Account Level (588) if logged in
        if (isLoggedIn) {
            const wifiRes = await fetchWifiSettings();
            // CMD 587 returns flat response
            if (wifiRes && wifiRes.success !== false) {
                updateGlobalData('wifiSettings', wifiRes);
            }

            // Fetch Account Level (CMD 588)
            try {
                const accRes = await fetchAccountLevel();
                if (accRes && accRes.account_level) {
                    updateGlobalData('accountLevel', accRes.account_level);
                }
            } catch (e) {
                console.error("Failed to fetch account level", e);
            }

            // Fetch Global Config (CMD 1017) - Added for dropdown data
            try {
                const globalConfRes = await fetchGlobalConfig();
                if (globalConfRes && (globalConfRes.success || globalConfRes.success === undefined)) {
                    updateGlobalData('globalConfig', globalConfRes);
                }
            } catch (e) {
                console.error("Failed to fetch global config (1017)", e);
            }
        }

      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    
    fetchSettings();
  }, [updateGlobalData, isLoggedIn]);

  // Effect 2: Polling for status info (CMD 586) - Loop every 10 seconds
  // CMD 586 can be fetched without login.
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

    // Always fetch, regardless of login state
    fetchStatus(); 
    intervalId = setInterval(fetchStatus, 10000); 

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
      updateGlobalData,
      isDebugMode
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
