
// API Configuration
const API_BASE_URL = '/cgi-bin/http.cgi'; 

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
  }> | string;
  
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
  network_status: string;
  lock_puk_flag: string;
  lock_pin_flag: string;
  sim_status: string;
  signal_lvl?: string;
  nation_limit_size?: string;
  internation_limit_size?: string;
  flow_limit_unit?: string;
  [key: string]: any;
}

export interface ConnectionSettingsResponse {
    networkMode: string;
    dialMode: string;
    roamingEnable: string;
    sms_sw?: string;
    dmCsca?: string;
    maxSize?: string;
    need_change_language?: string;
    language?: string;
    need_change_password?: string;
    sim_status?: string; 
    lock_pin_flag?: string;
    pin_left_times?: string;
    dont_prompt?: string;
    lock_puk_flag?: string;
    puk_left_times?: string;
    needSelectAutoupgrade?: string;
    auto_upgrade?: string;
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
    status: string; 
    sender: string;
    date: string;
    content: string;
}

export interface SmsListResponse {
    success: boolean;
    sms_list: string;
    sms_total: string;
    sms_unread: string;
    receive_full: string;
    send_full: string;
    draft_full: string;
    [key: string]: any;
}

// Session Management
export const setSessionId = (sid: string) => {
  if (sid) {
    sessionStorage.setItem('sessionId', sid);
    document.cookie = `sessionId=${sid}; path=/`;
  }
};

export const getSessionId = (): string => {
  return sessionStorage.getItem('sessionId') || '';
};

export const clearSessionId = () => {
  sessionStorage.removeItem('sessionId');
  document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

const triggerAuthLogout = () => {
  clearSessionId();
  window.dispatchEvent(new Event('auth-logout'));
};

// Encryption & Encoding
async function sha256(source: string) {
  const sourceBytes = new TextEncoder().encode(source);
  const digest = await window.crypto.subtle.digest("SHA-256", sourceBytes);
  const resultBytes = [...new Uint8Array(digest)];
  return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
}

function b64DecodeUtf8(str: string): string {
    try {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("Base64 Decode Error", e);
        return "";
    }
}

function b64EncodeUtf8(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

export const parseSmsList = (rawList: string): SmsMessage[] => {
    if (!rawList) return [];
    const items = rawList.split(',');
    return items.map(b64 => {
        if (!b64.trim()) return null;
        const decoded = b64DecodeUtf8(b64);
        const parts = decoded.split(' ');
        if (parts.length < 5) return null;
        
        const id = parts[0];
        const status = parts[1];
        const sender = parts[2];
        const date = parts[3];
        const time = parts[4];
        
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
            content = parts.slice(5).join(' ');
        }
        
        return { id, status, sender, date: `${date} ${time}`, content };
    }).filter((msg): msg is SmsMessage => msg !== null);
};

// Login Logic
export const login = async (username: string, password: string): Promise<any> => {
  try {
    const tokenRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 232, method: 'GET', sessionId: '' })
    });
    
    let tokenData: any;
    try { tokenData = await tokenRes.json(); } catch(e) { tokenData = null; }

    if (!tokenData || !tokenData.success || !tokenData.token) {
      return { success: false, message: 'System initialization failed.' };
    }

    const loginToken = tokenData.token;
    const hashedPassword = await sha256(loginToken + password);
    const currentSessionId = getSessionId(); 

    const loginPayload = {
      cmd: 100,
      method: 'POST',
      username: username,
      passwd: hashedPassword,
      token: loginToken,
      isAutoUpgrade: '0',
      sessionId: currentSessionId,
      isSingleLogin: '1'
    };

    const loginRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });

    let loginData: any;
    try { loginData = await loginRes.json(); } catch(e) { loginData = null; }

    if (!loginData) throw new Error('Invalid login response');

    if (loginData.success !== true && loginData.message === 'alreadyLogin') {
      return { success: false, message: 'The account has been logged in on other terminal. Please try again later.' };
    }

    if (loginData.success && loginData.sessionId) {
      setSessionId(loginData.sessionId);
      return { success: true };
    } 

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

// Generic API Request
export const apiRequest = async <T = any>(cmd: number, method: 'GET' | 'POST', data: Record<string, any> = {}): Promise<T> => {
  const sessionId = getSessionId();
  if (sessionId && (!document.cookie || !document.cookie.includes(`sessionId=${sessionId}`))) {
     document.cookie = `sessionId=${sessionId}; path=/`;
  }

  const payload: Record<string, any> = { cmd, method, sessionId, ...data };
  if (method === 'POST') payload.token = '';

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let resData: any = null;
    try { resData = await response.json(); } catch (e) { resData = null; }

    if (resData && resData.message === 'NO_AUTH') {
        triggerAuthLogout();
        return resData;
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return resData || {} as T;
  } catch (error) {
    console.error(`API Request Error (CMD: ${cmd}):`, error);
    throw error;
  }
};

// API Functions
export const fetchStatusInfo = async () => apiRequest<StatusInfoResponse>(586, 'GET');

export const logout = async () => {
  try {
    const sessionId = getSessionId();
    await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: 101, method: 'POST', sessionId, token: '' })
    });
    clearSessionId();
    return true; 
  } catch (error) {
    clearSessionId();
    return true; 
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await apiRequest(104, 'GET');
    return response.message !== 'NO_AUTH';
  } catch (error) { return true; }
};

export const fetchConnectionSettings = async () => apiRequest<ConnectionSettingsResponse>(585, 'GET');
export const fetchWifiSettings = async () => apiRequest<WifiSettingsResponse>(587, 'GET');
export const updateConnectionSettings = async (data: any) => apiRequest(1020, 'POST', data);

export const updateWifiConfig = async (params: any) => {
    const cmd = params.is5g ? 211 : 2;
    const subcmd = params.isGuest ? 1 : 0;
    const encodedSsid = btoa(unescape(encodeURIComponent(params.ssid)));
    const payload: any = {
        subcmd,
        wifiOpen: params.wifiOpen,
        broadcast: params.broadcast,
        ssid: encodedSsid,
        key: params.key,
        authenticationType: params.authenticationType
    };
    if (!params.is5g && params.wifiSames !== undefined) payload.wifiSames = params.wifiSames;
    return apiRequest(cmd, 'POST', payload);
};

export const setDialMode = async (dialMode: '0' | '1') => apiRequest(222, 'POST', { dialMode });
export const setRoamingEnable = async (roamingEnable: '0' | '1') => apiRequest(220, 'POST', { roamingEnable });
export const setLanguageSelection = async (languageSelect: string) => apiRequest(97, 'POST', { languageSelect });

export const modifyPassword = async (username: string, newPass: string) => {
    const encodedPass = b64EncodeUtf8(newPass);
    return apiRequest(102, 'POST', {
        first_login_flag: '1', first_login: '0', setPasswd: encodedPass,
        subcmd: 1, tz_account: 'Mw==', reset_status: '1'
    });
};

export const unlockSimPin = async (pin: string) => apiRequest(7, 'POST', { type: '1', pin: b64EncodeUtf8(pin) });
export const verifySimPin = async (pin: string, dontPrompt: boolean) => apiRequest(51, 'POST', { pin, subcmd: '2', dont_prompt: dontPrompt ? '1' : '0' });
export const unlockSimPuk = async (puk: string, newPin: string) => apiRequest(51, 'POST', { puk, pin: newPin, subcmd: '3', dont_prompt: '0' });
export const disablePinLock = async (pin: string) => apiRequest(7, 'POST', { type: '3', pin: b64EncodeUtf8(pin) });

export const fetchSmsList = async (pageNum: number = 1, subcmd: number = 0) => apiRequest<SmsListResponse>(12, 'GET', { page_num: pageNum, subcmd });
export const markSmsAsRead = async (indexes: string[]) => apiRequest(12, 'POST', { index: indexes.join(',') });
export const deleteSms = async (indexes: string[], subcmd: number = 0) => apiRequest(14, 'POST', { index: indexes.join(','), subcmd });
export const sendSms = async (phoneNo: string, content: string) => apiRequest(13, 'POST', { phoneNo, content: b64EncodeUtf8(content) });
export const saveSmsDraft = async (phoneNo: string, content: string) => apiRequest(13, 'POST', { type: 'save', phoneNo, content: b64EncodeUtf8(content) });
export const redirectSms = async (enabled: boolean, phone: string) => apiRequest(16, 'POST', { redirect_sw: enabled ? '1' : '0', redirect_phone: phone });
export const saveMessageSettings = async (smsSw: string, dmCsca: string, maxSize: string) => apiRequest(16, 'POST', { smsSw, dmCsca, maxSize });

export const setAutoUpgrade = async (autoValue: '0' | '1') => apiRequest(240, 'POST', { autoValue });
export const fetchAccountLevel = async () => apiRequest<{ account_level: string }>(588, 'GET');

// Requested Functions
export const resetStatistics = async () => apiRequest(337, 'POST', { statisticsReset: '1', usedFlow: '0' });

export const updateDeviceHostname = async (mac: string, hostname: string) => apiRequest(562, 'POST', { subcmd: 1, mac, hostname });
