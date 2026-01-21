

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
    
    // Language Settings
    need_change_language?: string; // '1' means set/done, others mean need selection
    language?: string;             // Current language code

    // Password Settings
    need_change_password?: string; // '1' means strong/changed, others mean weak/default

    // SIM/PIN Settings (CMD 585)
    sim_status?: string; 
    lock_pin_flag?: string;
    pin_remaining_count?: string;
    pin_left_times?: string; // Remaining PIN attempts
    
    lock_puk_flag?: string;
    puk_remaining_count?: string;
    puk_left_times?: string; // Added: Remaining PUK attempts

    // Software Update Settings
    needSelectAutoupgrade?: string; // '1' means selected, others mean need selection
    auto_upgrade?: string;          // '0' | '1'

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

export interface WifiSettingsResponse {
    success?: boolean;
    main_wifiPriority?: string;
    main_wifi_switch_24g?: string;
    main_wifi_ssid_24g?: string;
    main_wifi_broadcast_24g?: string;
    main_authenticationType_24g?: string;
    main_password_24g?: string;
    main_wifi_switch_5g?: string;
    main_wifi_ssid_5g?: string;
    main_wifi_broadcast_5g?: string;
    main_authenticationType_5g?: string;
    main_password_5g?: string;
    
    guest_wifiPriority?: string;
    guest_wifi_switch_24g?: string;
    guest_wifi_ssid_24g?: string;
    guest_wifi_broadcast_24g?: string;
    guest_authenticationType_24g?: string;
    guest_password_24g?: string;
    guest_wifi_switch_5g?: string;
    guest_wifi_ssid_5g?: string;
    guest_wifi_broadcast_5g?: string;
    guest_authenticationType_5g?: string;
    guest_password_5g?: string;

    [key: string]: any;
}

export interface SmsMessage {
    id: string;
    status: string; // '0' = unread, '1' = read
    sender: string;
    date: string;
    content: string;
}

export interface SmsListResponse {
    success: boolean;
    sms_list: string; // Comma separated base64 strings
    sms_total: string;
    sms_unread: string;
    receive_full: string;
    send_full: string;
    draft_full: string;
    [key: string]: any;
}

// Session Management (Using sessionStorage as requested)
export const setSessionId = (sid: string) => {
  if (sid) {
    sessionStorage.setItem('sessionId', sid);
    // Sync to cookie for API headers
    document.cookie = `sessionId=${sid}; path=/`;
  }
};

export const getSessionId = (): string => {
  return sessionStorage.getItem('sessionId') || '';
};

export const clearSessionId = () => {
  sessionStorage.removeItem('sessionId');
  // Clear cookie
  document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Internal Helper to trigger global logout event
const triggerAuthLogout = () => {
  clearSessionId();
  window.dispatchEvent(new Event('auth-logout'));
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
 * Base64 Decode with UTF-8 support
 */
function b64DecodeUtf8(str: string): string {
    try {
        // Standard solution for decoding UTF-8 strings passed as base64
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("Base64 Decode Error", e);
        return "";
    }
}

/**
 * Base64 Encode with UTF-8 support
 */
function b64EncodeUtf8(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Helper to parse the SMS list string returned by API
 * Format: ID STATUS SENDER DATE TIME CONTENT
 * Decoded string is space separated.
 * Content starts after the 5th space.
 */
export const parseSmsList = (rawList: string): SmsMessage[] => {
    if (!rawList) return [];
    
    // Split by comma to get individual messages (each is base64 encoded)
    const items = rawList.split(',');
    
    return items.map(b64 => {
        if (!b64.trim()) return null;
        
        const decoded = b64DecodeUtf8(b64);
        
        // We use split to get metadata easily, but we use substring for content to avoid split/join artifacts
        const parts = decoded.split(' ');
        
        // We expect at least 5 parts (id, status, sender, date, time).
        if (parts.length < 5) return null;
        
        const id = parts[0];
        const status = parts[1]; // 0: Unread, 1: Read
        const sender = parts[2];
        const date = parts[3];
        const time = parts[4];
        
        // Extract content: Everything after the 5th space
        let content = "";
        let spaceCount = 0;
        let fifthSpaceIndex = -1;
        
        for (let i = 0; i < decoded.length; i++) {
            if (decoded[i] === ' ') {
                spaceCount++;
                if (spaceCount === 5) {
                    fifthSpaceIndex = i;
                    break;
                }
            }
        }
        
        if (fifthSpaceIndex !== -1) {
            content = decoded.substring(fifthSpaceIndex + 1);
        } else if (parts.length > 5) {
            // Fallback: If 5 spaces weren't found in loop (unlikely if parts.length > 5), use join
            content = parts.slice(5).join(' ');
        }
        
        return {
            id,
            status,
            sender,
            date: `${date} ${time}`,
            content
        };
    }).filter((msg): msg is SmsMessage => msg !== null);
};

/**
 * Login Function
 * Follows the specific flow:
 * 1. Get Login Token (CMD 232)
 * 2. Hash Password (Token + Password)
 * 3. Send Login Request (CMD 100)
 */
export const login = async (username: string, password: string): Promise<{ 
  success: boolean; 
  message?: string;
  login_fail?: string;
  login_fail2?: string;
  login_times?: string;
  login_time?: string;
}> => {
  try {
    // Step 1: Get Login Token
    const tokenRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: 232,
        method: 'GET',
        sessionId: '' // SessionID is empty for the initial token request
      })
    });
    
    // Attempt to parse JSON regardless of status
    let tokenData: any;
    try {
        tokenData = await tokenRes.json();
    } catch(e) {
        tokenData = null;
    }

    if (!tokenRes.ok && (!tokenData || !tokenData.success)) {
        throw new Error('Network error during token fetch');
    }
    
    if (!tokenData || !tokenData.success || !tokenData.token) {
      console.error('Login token fetch failed', tokenData);
      return { success: false, message: 'System initialization failed.' };
    }

    const loginToken = tokenData.token;

    // Step 2: Encrypt Password (token + password) -> SHA256
    const hashedPassword = await sha256(loginToken + password);

    // Step 3: Send Login Request (CMD 100)
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

    let loginData: any;
    try {
        loginData = await loginRes.json();
    } catch(e) {
        loginData = null;
    }

    if (!loginRes.ok && !loginData) {
        throw new Error('Network error during login');
    }
    
    if (!loginData) throw new Error('Invalid login response');

    // Specific Error Handling: Already Logged In
    if (loginData.success !== true && loginData.message === 'alreadyLogin') {
      return { 
        success: false, 
        message: 'The account has been logged in on other terminal. Please try again later.' 
      };
    }

    if (loginData.success && loginData.sessionId) {
      // Login Successful: Save the new session ID
      setSessionId(loginData.sessionId);
      return { success: true };
    } 

    // Return detailed failure data including failure counts and lock times
    return { 
        success: false, 
        message: loginData.message || 'Login failed.',
        login_fail: loginData.login_fail,
        login_fail2: loginData.login_fail2,
        login_times: loginData.login_times,
        login_time: loginData.login_time
    };

  } catch (error) {
    console.error('Login Exception:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

/**
 * Generic API Request Function
 * 
 * @param cmd - The command ID (e.g., 220)
 * @param method - 'GET' for fetching data, 'POST' for setting data
 * @param data - Additional payload parameters
 * @returns Promise with the response
 */
export const apiRequest = async <T = any>(
  cmd: number, 
  method: 'GET' | 'POST', 
  data: Record<string, any> = {}
): Promise<T> => {
  
  const sessionId = getSessionId();

  // Ensure cookie is present for the request header
  if (sessionId && (!document.cookie || !document.cookie.includes(`sessionId=${sessionId}`))) {
     document.cookie = `sessionId=${sessionId}; path=/`;
  }

  // Construct the base payload structure
  const payload: Record<string, any> = {
    cmd,
    method,
    sessionId,
    ...data
  };

  if (method === 'POST') {
    // CMD 233 token requirement removed. Sending empty token for compatibility with schema if needed.
    payload.token = '';
  }

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 1. Attempt to parse JSON response regardless of HTTP status
    //    Crucial for handling 500 Internal Server Errors that carry valid NO_AUTH payloads.
    let resData: any = null;
    try {
        resData = await response.json();
    } catch (e) {
        resData = null;
    }

    // 2. Intercept Global Auth Failure (NO_AUTH) found in JSON body
    //    If NO_AUTH is detected, trigger logout immediately regardless of the command.
    if (resData && resData.message === 'NO_AUTH') {
        triggerAuthLogout();
        return resData;
    }

    // 3. If NOT a handled NO_AUTH response, now check for HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 4. Fallback if body was empty
    if (!resData) {
        return {} as T; 
    }

    return resData;
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
    const sessionId = getSessionId();
    
    const payload = {
        cmd: 101,
        method: 'POST',
        sessionId: sessionId,
        token: '' // Empty token as CMD 233 is no longer required
    };

    // Send Logout Request
    await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // We clear session regardless of response
    clearSessionId();
    return true; 
  } catch (error) {
    console.error('Logout error:', error);
    clearSessionId();
    return true; 
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
    
    if (response.message === 'NO_AUTH') {
      return false;
    }
    return true;
  } catch (error) {
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
 * Get Detailed Wifi Settings
 * CMD: 587
 * Returns flat structure similar to ConnectionSettingsResponse
 */
export const fetchWifiSettings = async (): Promise<WifiSettingsResponse> => {
  return apiRequest<WifiSettingsResponse>(587, 'GET');
};

/**
 * Update Connection Settings
 * CMD: 1020
 */
export const updateConnectionSettings = async (data: Partial<ConnectionSettingsResponse | WifiSettingsResponse>): Promise<ApiResponse> => {
  return apiRequest(1020, 'POST', data);
};

/**
 * Update Wifi Configuration
 * CMD: 2 (2.4GHz) or CMD: 211 (5GHz)
 */
export const updateWifiConfig = async (params: {
    is5g: boolean;
    isGuest: boolean;
    wifiOpen: string; // '0' | '1'
    ssid: string;
    broadcast: string; // '0' | '1'
    key: string;
    authenticationType: string;
    wifiSames?: string; // '0' | '1' (Only for 2.4G Optimization)
}): Promise<ApiResponse> => {
    const cmd = params.is5g ? 211 : 2;
    const subcmd = params.isGuest ? 1 : 0;
    
    // Base64 encode SSID - handling unicode properly for btoa
    const encodedSsid = btoa(unescape(encodeURIComponent(params.ssid)));

    const payload: any = {
        subcmd,
        wifiOpen: params.wifiOpen,
        broadcast: params.broadcast,
        ssid: encodedSsid,
        key: params.key,
        authenticationType: params.authenticationType
    };

    // 5GHz Optimization (wifiSames) is only relevant for CMD 2 (2.4GHz)
    if (!params.is5g && params.wifiSames !== undefined) {
        payload.wifiSames = params.wifiSames;
    }

    return apiRequest(cmd, 'POST', payload);
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

/**
 * Set Language Selection
 * CMD: 97
 */
export const setLanguageSelection = async (languageSelect: string): Promise<ApiResponse> => {
  return apiRequest(97, 'POST', { languageSelect });
};

/**
 * Modify User Password
 * CMD: 102
 */
export const modifyPassword = async (username: string, newPass: string): Promise<ApiResponse> => {
    const encodedPass = b64EncodeUtf8(newPass);
    return apiRequest(102, 'POST', {
        first_login_flag: '1',
        first_login: '0',
        setPasswd: encodedPass,
        subcmd: 1,
        tz_account: 'Mw==', // Fixed value as requested
        reset_status: '1'
    });
};

/**
 * Unlock SIM PIN
 * CMD: 7, Type: 1
 */
export const unlockSimPin = async (pin: string): Promise<ApiResponse> => {
    const encodedPin = b64EncodeUtf8(pin);
    return apiRequest(7, 'POST', { 
        type: '1', // 1=Verify/Unlock
        pin: encodedPin 
    });
};

/**
 * Verify SIM PIN (CMD 51)
 * CMD: 51
 */
export const verifySimPin = async (pin: string, dontPrompt: boolean): Promise<ApiResponse> => {
    // PIN sent as plaintext as per requirements
    return apiRequest(51, 'POST', { 
        pin: pin,
        subcmd: '2',
        dont_prompt: dontPrompt ? '1' : '0'
    });
};

/**
 * Unlock SIM PUK (CMD 51)
 * CMD: 51, subcmd: 3
 */
export const unlockSimPuk = async (puk: string, newPin: string): Promise<ApiResponse> => {
    return apiRequest(51, 'POST', { 
        puk: puk,
        pin: newPin,
        subcmd: '3',
        dont_prompt: '0'
    });
};

/**
 * Disable SIM PIN Lock
 * CMD: 7, Type: 3
 */
export const disablePinLock = async (pin: string): Promise<ApiResponse> => {
    const encodedPin = b64EncodeUtf8(pin);
    return apiRequest(7, 'POST', { 
        type: '3', // 3=Disable PIN Lock
        pin: encodedPin 
    });
};

/**
 * Fetch SMS List
 * CMD: 12
 * @param pageNum Page number (default 1)
 * @param subcmd 0=Inbox, 1=Sent, 2=Draft
 */
export const fetchSmsList = async (pageNum: number = 1, subcmd: number = 0): Promise<SmsListResponse> => {
    return apiRequest<SmsListResponse>(12, 'GET', { page_num: pageNum, subcmd });
};

/**
 * Mark SMS as Read
 * CMD: 12
 * @param indexes Array of message IDs/indexes
 */
export const markSmsAsRead = async (indexes: string[]): Promise<ApiResponse> => {
    return apiRequest(12, 'POST', { index: indexes.join(',') });
};

/**
 * Delete SMS
 * CMD: 14
 * @param indexes Array of message IDs/indexes
 * @param subcmd 0=Inbox, 1=Sent, 2=Draft
 */
export const deleteSms = async (indexes: string[], subcmd: number = 0): Promise<ApiResponse> => {
    return apiRequest(14, 'POST', { index: indexes.join(','), subcmd });
};

/**
 * Send SMS
 * CMD: 13
 */
export const sendSms = async (phoneNo: string, content: string): Promise<ApiResponse> => {
    const encodedContent = b64EncodeUtf8(content);
    return apiRequest(13, 'POST', { phoneNo, content: encodedContent });
};

/**
 * Save SMS Draft
 * CMD: 13
 */
export const saveSmsDraft = async (phoneNo: string, content: string): Promise<ApiResponse> => {
    const encodedContent = b64EncodeUtf8(content);
    return apiRequest(13, 'POST', { type: 'save', phoneNo, content: encodedContent });
};

/**
 * Set Auto Upgrade (Software Update)
 * CMD: 240
 */
export const setAutoUpgrade = async (autoValue: '0' | '1'): Promise<ApiResponse> => {
    return apiRequest(240, 'POST', { autoValue });
};

/**
 * Get Account Level
 * CMD: 588
 */
export const fetchAccountLevel = async (): Promise<{ account_level: string }> => {
  return apiRequest<{ account_level: string }>(588, 'GET');
};
