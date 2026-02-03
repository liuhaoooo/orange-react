import { WifiNetwork } from '../types';

// Constants
const API_ENDPOINT = '/cgi-bin/http.cgi';
const SESSION_KEY = 'cpe_session_id';

// Types
export interface SmsMessage {
  id: string;
  sender: string;
  date: string;
  content: string;
  status: string; // '0'=unread, '1'=read
}

export interface WifiSettingsResponse {
  success: boolean;
  [key: string]: any;
}

export interface DeviceInfoResponse {
  success?: boolean;
  board_type?: string;
  version?: string;
  uptime?: string;
  hwversion?: string;
  cpuload?: string;
  module_imei?: string;
  IMSI?: string;
  ICCID?: string;
  module_type?: string;
  module_softver?: string;
  module_hardver?: string;
}

export interface NetworkInfoResponse {
  success?: boolean;
  network_type_str?: string;
  network_operator?: string;
  PCI?: string;
  PCI_5G?: string;
  FREQ?: string;
  FREQ_5G?: string;
  ENODEBID?: string;
  ENODEBID_5G?: string;
  CELL_ID?: string;
  CELL_ID_5G?: string;
  CQI?: string;
  CQI_5G?: string;
  ul_mcs?: string;
  ul_mcs_5g?: string;
  dl_mcs?: string;
  dl_mcs_5g?: string;
  bandwidth?: string;
  bandwidth_5g?: string;
  PLMN?: string;
  CELL_ID_3G?: string;
  currentband?: string;
  currentband_5g?: string;
  currentband_3g?: string;
  rank_4g?: string;
  rank_5g?: string;
  bler_4g?: string;
  bler_5g?: string;
  RSRP?: string;
  RSRP_5G?: string;
  RSSI?: string;
  RSSI_5G?: string;
  RSSI_3G?: string;
  RSRQ?: string;
  RSRQ_5G?: string;
  SINR?: string;
  SINR_5G?: string;
  RSCP?: string;
  ECIO?: string;
  uarfcn?: string;
  PSC?: string;
  bandwidth3G?: string;
  apn_name?: string;
  wan_ip?: string;
  wan_dns?: string;
  wan_dns2?: string;
  wan_ipv6_ip?: string;
  wan_ipv6_dns?: string;
  wan_ipv6_dns2?: string;
  wan_rx_packets?: string;
  wan_tx_packets?: string;
  wan_rx_bytes?: string;
  wan_tx_bytes?: string;
  ul64qam_support?: string;
  dl256qam_support?: string;
  max_ul_qam?: string;
  max_ul_qam_5g?: string;
  max_dl_qam?: string;
  max_dl_qam_5g?: string;
}

export interface ApnInfoItem {
  wanType: string;
  apnName: string;
  wanIp: string;
  wanNetmask: string;
  wanIpv6: string;
  wanDns: string;
  wanDnsSecond: string;
  wanIpv6Dns: string;
  wanIpv6DnsSecond: string;
  wanRxPackets: string;
  wanTxPackets: string;
  wanRxBytes: string;
  wanTxBytes: string;
}

export interface ApnProfile {
  default_flag: string;
  edit_flag: string;
  name: string;
  apnName: string;
  ipVersion: string;
  selectAuthtication: string;
  apnUserName?: string;
  apnUserPassword?: string;
}

export interface ApnConfigResponse {
  success?: boolean;
  apnNatName?: string;
  apnMTU?: string;
  selectType?: string;
}

export interface MultipleApnResponse {
  success?: boolean;
  result?: string;
  multiApnNum?: string;
  [key: string]: any;
}

export interface LockBandSettings {
  band3gRadio: string;
  band4gRadio: string;
  band5gRadio: string;
  lock3gBand: string;
  lock4gBand: string;
  lock5gBand: string;
}

export interface PlmnScanResponse {
  success?: boolean;
  sccan_plmn_list?: string;
}

// --- Session ---
export const getSessionId = () => sessionStorage.getItem(SESSION_KEY);
export const clearSessionId = () => sessionStorage.removeItem(SESSION_KEY);

// --- Base Request ---
async function apiRequest<T = any>(cmd: number, method: 'GET' | 'POST' = 'POST', data: Record<string, any> = {}): Promise<T> {
  const sessionId = getSessionId();
  // Simulating query param session passing which is common
  let url = `${API_ENDPOINT}?cmd=${cmd}&method=${method}`;
  if (sessionId) url += `&session_id=${sessionId}`;

  const options: RequestInit = {
    method,
    headers: {
        'Content-Type': 'application/json', // Or application/x-www-form-urlencoded depending on firmware
    }
  };

  if (method === 'POST') {
    // Many CPEs expect the CMD in the body too
    options.body = JSON.stringify({ cmd, ...data });
  }

  try {
    const response = await fetch(url, options);
    if (response.status === 401 || response.status === 403) {
       window.dispatchEvent(new Event('auth-logout'));
       return { success: false } as any;
    }
    
    let text = '';
    try {
        text = await response.text();
    } catch (readErr) {
        console.warn(`API Read Error ${cmd}`, readErr);
        // If reading the body fails, we assume failure but suppress the crash
        return { success: false } as any;
    }

    let json: any = { success: false };
    
    try {
        // Try parsing if text exists
        if (text && text.trim().length > 0) {
            json = JSON.parse(text);
        }
    } catch (e) {
        // Log warning but don't crash. 
        // This handles cases where response is "true", "null", or trailing garbage
        console.warn(`API Parse Warning ${cmd}`, e);
        // Attempt to salvage if it's a simple boolean/null response that parser missed
        if (text.trim() === 'true') json = { success: true };
        else if (text.trim() === 'null') json = { success: false };
    }

    if (json && (json.result === 'NO_AUTH' || json.message === 'NO_AUTH')) {
        window.dispatchEvent(new Event('auth-logout'));
    }
    return json || { success: false };
  } catch (e) {
    console.error(`API Error ${cmd}`, e);
    return { success: false } as any;
  }
}

// --- Auth ---
export const login = async (username: string, password: string) => {
    // Assuming CMD 1 for login
    const res = await apiRequest(1, 'POST', { username, password });
    if (res.success && res.session_id) {
        sessionStorage.setItem(SESSION_KEY, res.session_id);
    }
    return res;
};

export const logout = async () => {
    const res = await apiRequest(2, 'POST');
    clearSessionId();
    return res.success;
};

export const checkAuthStatus = async () => {
    const res = await apiRequest(104, 'GET');
    return res.success !== false && res.result !== 'NO_AUTH';
};

export const fetchAccountLevel = async () => apiRequest(588, 'GET');
export const modifyPassword = async (user: string, pass: string) => apiRequest(14, 'POST', { username: user, passwd: pass });

// --- Status & Settings ---
export const fetchStatusInfo = async () => apiRequest(586, 'GET');
export const fetchConnectionSettings = async () => apiRequest(585, 'GET');
export const fetchWifiSettings = async () => apiRequest(587, 'GET');

// --- Connection ---
export const setDialMode = async (mode: string) => apiRequest(222, 'POST', { dialMode: mode });
export const setRoamingEnable = async (enable: string) => apiRequest(220, 'POST', { roamingEnable: enable });
export const resetStatistics = async () => apiRequest(301, 'POST');

export const fetchNetworkConfigInfo = async () => apiRequest(218, 'GET');
export const setFlightMode = async (mode: string) => apiRequest(218, 'POST', { flightMode: mode });
export const searchNetwork = async () => apiRequest(219, 'POST');

export const fetchNetworkMode = async () => apiRequest(215, 'GET');
export const setNetworkMode = async (mode: string) => apiRequest(215, 'POST', { networkMode: mode });

export const scanPlmnNetwork = async () => apiRequest<PlmnScanResponse>(228, 'POST', { sccan_plmn: '1' });
export const getPlmnList = async () => apiRequest<PlmnScanResponse>(228, 'GET');
export const selectPlmn = async (plmn: string, act: string) => apiRequest(228, 'POST', { plmn_select_cmd: '4', plmn, act });

export const fetchLockBandSettings = async () => apiRequest(161, 'GET');
export const saveLockBandSettings = async (data: Partial<LockBandSettings>) => apiRequest(161, 'POST', data);

export const fetchLinkDetectionSettings = async () => apiRequest(232, 'GET');
export const saveLinkDetectionSettings = async (data: any) => apiRequest(232, 'POST', data);

// --- Wi-Fi ---
export const updateWifiConfig = async (config: any) => apiRequest(233, 'POST', config);

// --- SMS ---
export const fetchSmsList = async (page: number, subcmd: number) => apiRequest(105, 'POST', { page, subcmd });
export const markSmsAsRead = async (ids: string[]) => apiRequest(107, 'POST', { ids }); 
export const deleteSms = async (ids: string[], subcmd: number) => apiRequest(106, 'POST', { ids, subcmd });
export const sendSms = async (receiver: string, content: string) => apiRequest(108, 'POST', { receiver, content });
export const saveSmsDraft = async (receiver: string, content: string) => apiRequest(109, 'POST', { receiver, content });
export const redirectSms = async (enabled: boolean, phone: string) => apiRequest(111, 'POST', { smsRedirectSwitch: enabled ? '1' : '0', smsRedirectNumber: phone });
export const saveMessageSettings = async (sms_sw: string, dmCsca: string, maxSize: string) => apiRequest(112, 'POST', { sms_sw, dmCsca, maxSize });

export const parseSmsList = (list: any[]): SmsMessage[] => {
    if (!Array.isArray(list)) return [];
    return list.map(item => ({
        id: item.id || Math.random().toString(),
        sender: item.number || 'Unknown',
        date: item.time || '',
        content: item.content || '',
        status: item.status || '1'
    }));
};

// --- System & Info ---
export const fetchDeviceInfo = async () => apiRequest<DeviceInfoResponse>(1001, 'GET');
export const fetchNetworkInfo = async () => apiRequest<NetworkInfoResponse>(1002, 'GET');
export const fetchNetworkStatus = async () => apiRequest(1004, 'GET');

export const setLanguageSelection = async (lang: string) => apiRequest(19, 'POST', { language: lang });
export const setAutoUpgrade = async (enable: string) => apiRequest(240, 'POST', { auto_upgrade: enable });

export const uploadSystemUpdateFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const res = await fetch('/cgi-bin/upload.cgi', { method: 'POST', body: formData });
        return await res.json();
    } catch (e) {
        return { success: false, message: 'Upload failed' };
    }
};
export const startSystemUpgrade = async (fileName: string) => apiRequest(239, 'POST', { fileName });

export const verifySimPin = async (pin: string, dontAsk: boolean) => apiRequest(51, 'POST', { pin, dont_prompt: dontAsk ? '1' : '0' });
export const unlockSimPuk = async (puk: string, newPin: string) => apiRequest(52, 'POST', { puk, new_pin: newPin });

export const updateDeviceHostname = async (mac: string, hostname: string) => apiRequest(123, 'POST', { mac, hostname });

// --- APN ---
export const fetchApnSettings = async () => apiRequest<ApnConfigResponse>(213, 'GET');
export const saveApnConfig = async (config: any) => apiRequest(213, 'POST', config);

export const fetchApnList = async () => apiRequest<{success: boolean, apn_list: ApnProfile[]}>(248, 'GET');
export const saveApnList = async (list: ApnProfile[]) => apiRequest(248, 'POST', { apn_list: list });

export const fetchMultipleApnSettings = async () => apiRequest<MultipleApnResponse>(249, 'GET');
export const saveMultipleApnSettings = async (data: any) => apiRequest(249, 'POST', data);
