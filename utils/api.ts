
export interface ApiResponse {
  success?: boolean;
  result?: string;
  message?: string;
  [key: string]: any;
}

export interface SmsMessage {
  id: string;
  sender: string;
  content: string;
  date: string;
  status: '0' | '1' | '2' | '3';
}

export interface WifiSettingsResponse extends ApiResponse {
  main_wifiPriority?: string;
  guest_wifiPriority?: string;
  main_wifi_ssid_24g?: string;
  main_wifi_switch_24g?: string;
  main_wifi_ssid_5g?: string;
  main_wifi_switch_5g?: string;
  guest_wifi_ssid_24g?: string;
  guest_wifi_switch_24g?: string;
  guest_wifi_ssid_5g?: string;
  guest_wifi_switch_5g?: string;
  [key: string]: any;
}

const API_URL = '/cgi-bin/lua.cgi';
const SESSION_KEY = 'airbox_session_id';

export const getSessionId = () => {
  return sessionStorage.getItem(SESSION_KEY);
};

export const clearSessionId = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

const apiRequest = async (cmd: number, method: 'GET' | 'POST' = 'POST', params: Record<string, any> = {}): Promise<ApiResponse> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const formData = new URLSearchParams();
  formData.append('cmd', cmd.toString());
  Object.keys(params).forEach(key => formData.append(key, params[key]));

  try {
    const response = await fetch(API_URL, {
      method: method,
      headers: headers,
      body: method === 'POST' ? formData : undefined,
    });

    if (response.status === 401 || response.status === 403) {
       window.dispatchEvent(new Event('auth-logout'));
       return { success: false, message: 'Unauthorized' };
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.warn("API returned non-JSON", text);
        return { success: false, message: 'Invalid response' };
    }
  } catch (error) {
    console.error("API Request failed", error);
    return { success: false, message: 'Network error' };
  }
};

export const login = async (username: string, password: string): Promise<ApiResponse> => {
    const res = await apiRequest(101, 'POST', { username, passwd: password });
    if (res.success || res.result === 'success') {
        if (res.session_id) {
            sessionStorage.setItem(SESSION_KEY, res.session_id);
        } else {
            sessionStorage.setItem(SESSION_KEY, 'active');
        }
        return { success: true, ...res };
    }
    return { success: false, ...res };
};

export const logout = async (): Promise<boolean> => {
    await apiRequest(102, 'POST');
    clearSessionId();
    return true;
};

export const checkAuthStatus = async (): Promise<boolean> => {
    const res = await apiRequest(104, 'GET');
    if (res.result === 'NO_AUTH' || res.success === false) {
        return false;
    }
    return true;
};

export const fetchStatusInfo = async (): Promise<ApiResponse> => {
    return apiRequest(586, 'GET');
};

export const fetchConnectionSettings = async (): Promise<ApiResponse> => {
    return apiRequest(585, 'GET');
};

export const fetchWifiSettings = async (): Promise<WifiSettingsResponse> => {
    return apiRequest(587, 'GET');
};

export const fetchAccountLevel = async (): Promise<{ account_level: string }> => {
    const res = await apiRequest(588, 'GET');
    return { account_level: res.account_level || '1' };
};

export const setDialMode = async (mode: '0' | '1'): Promise<ApiResponse> => {
    return apiRequest(222, 'POST', { dialMode: mode });
};

export const setRoamingEnable = async (enable: '0' | '1'): Promise<ApiResponse> => {
    return apiRequest(220, 'POST', { roamingEnable: enable });
};

export const updateWifiConfig = async (config: any): Promise<ApiResponse> => {
    return apiRequest(211, 'POST', config);
};

export const fetchSmsList = async (page: number, subcmd: number): Promise<any> => {
    return apiRequest(5, 'POST', { page, subcmd });
};

export const parseSmsList = (list: any[]): SmsMessage[] => {
    if (!Array.isArray(list)) return [];
    return list.map((item: any) => ({
        id: item.id,
        sender: item.number || item.phone,
        content: item.content || item.message,
        date: item.time || item.date,
        status: item.status
    }));
};

export const markSmsAsRead = async (ids: string[]): Promise<ApiResponse> => {
    return apiRequest(7, 'POST', { ids: ids.join(','), subcmd: 3 });
};

export const deleteSms = async (ids: string[], subcmd: number): Promise<ApiResponse> => {
    return apiRequest(6, 'POST', { ids: ids.join(','), subcmd });
};

export const sendSms = async (receiver: string, content: string): Promise<ApiResponse> => {
    return apiRequest(4, 'POST', { number: receiver, message: content });
};

export const saveSmsDraft = async (receiver: string, content: string): Promise<ApiResponse> => {
    return apiRequest(9, 'POST', { number: receiver, message: content });
};

export const redirectSms = async (enabled: boolean, number: string): Promise<ApiResponse> => {
    return apiRequest(12, 'POST', { enabled: enabled ? '1' : '0', number });
};

export const saveMessageSettings = async (smsSwitch: string, sca: string, validity: string): Promise<ApiResponse> => {
    return apiRequest(10, 'POST', { sms_sw: smsSwitch, dmCsca: sca, maxSize: validity });
};

export const updateDeviceHostname = async (mac: string, hostname: string): Promise<ApiResponse> => {
    return apiRequest(562, 'POST', { 
        subcmd: 1,
        mac,
        hostname
    });
};

export const resetStatistics = async (): Promise<ApiResponse> => {
    return apiRequest(230, 'POST', { action: 'reset' });
};

export const setAutoUpgrade = async (autoValue: '0' | '1'): Promise<ApiResponse> => {
    return apiRequest(240, 'POST', { autoValue });
};

export const setLanguageSelection = async (lang: string): Promise<ApiResponse> => {
    return apiRequest(250, 'POST', { language: lang });
};

export const modifyPassword = async (user: string, pass: string): Promise<ApiResponse> => {
    return apiRequest(103, 'POST', { username: user, newPassword: pass });
};

export const verifySimPin = async (pin: string, save: boolean): Promise<ApiResponse> => {
    return apiRequest(51, 'POST', { pin, save: save ? '1' : '0' });
};

export const unlockSimPuk = async (puk: string, newPin: string): Promise<ApiResponse> => {
    return apiRequest(52, 'POST', { puk, newPin });
};
