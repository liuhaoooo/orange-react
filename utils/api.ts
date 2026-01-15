
// API Configuration
const API_BASE_URL = '/cgi-bin/http.cgi'; 

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

export interface StatusInfoResponse {
  time_elapsed: string;
  roam_dl_mon_flow: string;
  roam_ul_mon_flow: string;
  ul_mon_flow: string;
  dl_mon_flow: string;
  battery_status: string;
  battery_level: string;
  battery_charge_status: string;
  wan_network_status: string;
  dhcp_list_info: Array<{
    mac: string;
    ip: string;
    hostname: string;
    interface: string;
    expires: string;
    flow: string;
    ipv6: string;
  }> | string; // API might return empty string if no list
  
  offline_history_list_info?: Array<{
    mac: string;
    ip: string;
    hostname: string;
    [key: string]: any;
  }> | string;

  network_type_str: string;
  flightMode: string;
  roamingEnable: string;
  dialMode: string;
  
  // Added for status logic
  network_status: string;
  lock_puk_flag: string;
  lock_pin_flag: string;
  sim_status: string;
  signal_lvl?: string; // Signal level (1-5)
  nation_limit_size?: string;
  internation_limit_size?: string;
  flow_limit_unit?: string; // Unit for limits: '1' (*1000), '2' (*1000000)

  [key: string]: any;
}

/**
 * Connection Settings (CMD 585)
 */
export interface ConnectionSettingsResponse {
    networkMode: string;
    checkbox: string;
    mode5g: string;
    flightMode: string;
    dialMode: string;        // '0' | '1' - Data Switch
    roamingEnable: string;   // '0' | '1' - Roaming Switch
    deviceMode: string;
    lteCA: string;
    nrCA: string;
    
    // WiFi Settings
    main_wifiPriority?: string;
    main_wifi_switch_24g?: string;
    main_wifi_ssid_24g?: string;
    main_wifi_switch_5g?: string;
    main_wifi_ssid_5g?: string;
    
    guest_wifiPriority?: string;
    guest_wifi_switch_24g?: string;
    guest_wifi_ssid_24g?: string;
    guest_wifi_switch_5g?: string;
    guest_wifi_ssid_5g?: string;

    [key: string]: any;
}

// Session Management (Using sessionStorage as requested)
export const setSessionId = (sid: string) => {
  if (sid) {
    sessionStorage.setItem('sessionId', sid);
  }
};

export const getSessionId = (): string => {
  return sessionStorage.getItem('sessionId') || '';
};

export const clearSessionId = () => {
  sessionStorage.removeItem('sessionId');
};

/**
 * SHA-256 Encryption Helper
 */
async function sha256(source: string) {
  const sourceBytes = new TextEncoder().encode(source);
  const digest = await window.crypto.subtle.digest("SHA-256", sourceBytes);
  const resultBytes = [...new Uint8Array(digest)];
  return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
}

/**
 * Login Function
 * Follows the specific flow:
 * 1. Get Login Token (CMD 232)
 * 2. Hash Password (Token + Password)
 * 3. Send Login Request (CMD 100)
 */
export const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Step 1: Get Login Token
    // We use a raw fetch here to avoid the generic CMD 233 token logic in apiRequest
    const tokenRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 232,
        method: 'GET',
        sessionId: '' // SessionID is empty for the initial token request
      })
    });
    
    if (!tokenRes.ok) throw new Error('Network error during token fetch');
    const tokenData = await tokenRes.json();
    
    if (!tokenData.success || !tokenData.token) {
      console.error('Login token fetch failed', tokenData);
      return { success: false, message: 'System initialization failed.' };
    }

    const loginToken = tokenData.token;

    // Step 2: Encrypt Password (token + password) -> SHA256
    const hashedPassword = await sha256(loginToken + password);

    // Step 3: Send Login Request (CMD 100)
    // The prompt implies sending the current session ID if available, or just the flow context.
    const currentSessionId = getSessionId(); 

    const loginPayload = {
      cmd: 100,
      method: 'POST',
      username: username,
      passwd: hashedPassword,
      token: loginToken,
      isAutoUpgrade: '0',
      sessionId: currentSessionId, // Send current session ID if exists
      isSingleLogin: '1'
    };

    const loginRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });

    if (!loginRes.ok) throw new Error('Network error during login');
    const loginData = await loginRes.json();

    // Specific Error Handling: Already Logged In
    if (loginData.success !== true && loginData.message === 'alreadyLogin') {
      return { 
        success: false, 
        message: 'The account has been logged in on other terminal. Please try again later.' 
      };
    }

    // Specific Error Handling: Explicit Fail Flag
    if (loginData.login_fail === 'fail' || loginData.login_fail2 === 'fail') {
      return { 
        success: false, 
        message: 'Login failed. Please check your credentials.' 
      };
    }

    if (loginData.success && loginData.sessionId) {
      // Login Successful: Save the new session ID
      setSessionId(loginData.sessionId);
      return { success: true };
    } else {
      console.error('Login failed', loginData);
      return { success: false, message: 'Login failed.' };
    }

  } catch (error) {
    console.error('Login Exception:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

/**
 * Fetches a one-time token required for POST (write) operations.
 * Sends a POST request with cmd: 233 and method: 'GET' to the main endpoint.
 */
const fetchOneTimeToken = async (): Promise<string> => {
  try {
    const sessionId = getSessionId();
    
    // Payload specifically for fetching the token
    const payload = {
        cmd: 233,
        method: 'GET',
        sessionId: sessionId
    };

    // Always use POST for the HTTP transport
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    // Expected response format: {"success":true,"cmd":233,"token":"..."}
    return data.token || '';
  } catch (error) {
    console.error('Failed to fetch token:', error);
    return ''; 
  }
};

/**
 * Generic API Request Function
 * 
 * @param cmd - The command ID (e.g., 220)
 * @param method - 'GET' for fetching data, 'POST' for setting data (triggers token fetch)
 * @param data - Additional payload parameters
 * @returns Promise with the response
 */
export const apiRequest = async <T = any>(
  cmd: number, 
  method: 'GET' | 'POST', 
  data: Record<string, any> = {}
): Promise<T> => {
  
  const sessionId = getSessionId();
  let token = '';

  // If we are setting data (method: 'POST'), we need to get a token first
  if (method === 'POST') {
    token = await fetchOneTimeToken();
  }

  // Construct the base payload structure
  const payload: Record<string, any> = {
    cmd,
    method,
    sessionId,
    ...data
  };

  // Attach token only for write operations (method: 'POST')
  // We ensure the token field is present even if token is empty
  if (method === 'POST') {
    payload.token = token;
  }

  try {
    // "全部使用post请求下发数据" - Always use HTTP POST
    const response = await fetch(API_BASE_URL, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Error (CMD: ${cmd}):`, error);
    throw error;
  }
};

/**
 * Get Dashboard Status Info
 * CMD: 586
 */
export const fetchStatusInfo = async (): Promise<StatusInfoResponse> => {
  return apiRequest<StatusInfoResponse>(586, 'GET');
};

/**
 * Logout Function
 * CMD: 101
 */
export const logout = async (): Promise<boolean> => {
  try {
    const response = await apiRequest(101, 'POST');
    if (response.success) {
      clearSessionId();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

/**
 * Check authentication status (Heartbeat)
 * CMD: 104
 * Returns true if authenticated, false if NO_AUTH is returned.
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await apiRequest(104, 'GET');
    
    // Check specifically for NO_AUTH message regardless of success flag
    // This indicates the session has expired on the server side
    if (response.message === 'NO_AUTH') {
      return false;
    }
    return true;
  } catch (error) {
    // If network fails, we usually don't log out immediately unless we get explicit NO_AUTH
    return true; 
  }
};

/**
 * Get Connection Settings
 * CMD: 585
 */
export const fetchConnectionSettings = async (): Promise<ConnectionSettingsResponse> => {
  return apiRequest<ConnectionSettingsResponse>(585, 'GET');
};

/**
 * Update Connection Settings
 * CMD: 1020
 */
export const updateConnectionSettings = async (data: Partial<ConnectionSettingsResponse>): Promise<ApiResponse> => {
  return apiRequest(1020, 'POST', data);
};

/**
 * Set Dial Mode (Data Switch)
 * CMD: 222
 */
export const setDialMode = async (dialMode: '0' | '1'): Promise<ApiResponse> => {
  return apiRequest(222, 'POST', { dialMode });
};

/**
 * Set Roaming Enable
 * CMD: 220
 */
export const setRoamingEnable = async (roamingEnable: '0' | '1'): Promise<ApiResponse> => {
  return apiRequest(220, 'POST', { roamingEnable });
};
