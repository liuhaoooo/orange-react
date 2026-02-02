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

export interface DeviceInfoResponse {
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
  [key: string]: any;
}

export interface NetworkInfoResponse {
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
    currentband?: string;
    currentband_5g?: string;
    rank_4g?: string;
    rank_5g?: string;
    bler_4g?: string;
    bler_5g?: string;
    RSRP?: string;
    RSRP_5G?: string;
    RSSI?: string;
    RSSI_5G?: string;
    RSRQ?: string;
    RSRQ_5G?: string;
    SINR?: string;
    SINR_5G?: string;
    ul64qam_support?: string;
    dl256qam_support?: string;
    max_ul_qam?: string;
    max_ul_qam_5g?: string;
    max_dl_qam?: string;
    max_dl_qam_5g?: string;
    signal_lvl?: string;
    
    // 3G Specific
    RSCP?: string;
    RSSI_3G?: string;
    ECIO?: string;
    CELL_ID_3G?: string;
    uarfcn?: string;
    PSC?: string;
    currentband_3g?: string;
    bandwidth3G?: string;

    // APN Info
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
    
    [key: string]: any;
}

export interface ApnInfoItem {
    interfaceName: string;
    wanMac: string;
    wanIp: string;
    wanNetmask: string;
    wanGateway: string;
    wanDns: string;
    wanDnsSecond: string;
    wanIpv6: string;
    wanIpv6Gateway: string;
    wanIpv6Dns: string;
    wanIpv6DnsSecond: string;
    wanRxPackets: string;
    wanTxPackets: string;
    wanRxBytes: string;
    wanTxBytes: string;
    wanType: string;
    apnName: string;
}

export interface NetworkStatusResponse {
    success: boolean;
    cmd: number;
    lte_info: string;
    nr_info: string;
    apn_list: ApnInfoItem[];
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

// APN Interfaces
export interface ApnConfigResponse {
    success: boolean;
    cmd: number;
    apnNatName: string; // "0" | "1"
    apnMTU: string;
    selectType: string;
    clatMode: string;
    clatPrefix: string;
    esm_flag: string;
    [key: string]: any;
}

export interface ApnProfile {
    default_flag: string; // "0" | "1"
    edit_flag: string; // "0" (Auto/Predefined) | "1" (Manual/Custom)
    name: string;
    apnName: string;
    ipVersion: string;
    selectAuthtication: string;
    apnUserName?: string;
    apnUserPassword?: string;
}

export interface ApnListResponse {
    success: boolean;
    cmd: number;
    apn_list: ApnProfile[];
    [key: string]: any;
}

export interface NetworkModeResponse {
    success: boolean;
    cmd: number;
    networkMode: string;
    display_mode: string;
    modeCapacity: string;
    [key: string]: any;
}

export interface LinkDetectionSettings {
    wanLinkDetectSwitch: string;
    checkWanLinkDetectMode: string;
    wanLinkDetectIP1: string;
    wanLinkDetectIP2: string;
    wanLinkDetectIP3: string;
    wanLinkDetectCheckTime: string;
    LinkDetectAction: string;
    reboot_wait_time: string;
    dial_wait_time?: string;
    dnsv4_server_sw: string;
    dnsv6_server_sw: string;
    dnsv4_server1: string;
    dnsv4_server2: string;
    dnsv4_server3: string;
    dnsv6_server1: string;
    dnsv6_server2: string;
    dnsv6_server3: string;
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
// SHA-256 implementation with pure JS fallback for insecure contexts (HTTP)
async function sha256(source: string) {
  // 1. Try Native Web Crypto (HTTPS / Localhost) - Fastest
  if (window.crypto && window.crypto.subtle) {
    try {
      const sourceBytes = new TextEncoder().encode(source);
      const digest = await window.crypto.subtle.digest("SHA-256", sourceBytes);
      const resultBytes = [...new Uint8Array(digest)];
      return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
    } catch (e) {
      console.warn("Web Crypto API error, using fallback", e);
    }
  }

  // 2. Pure JS Fallback (HTTP)
  // Standard SHA-256 constants and logic
  function r(n: number, b: number) { return (n >>> b) | (n << (32 - b)); }
  
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Convert string to utf8 bytes
  const msg = new TextEncoder().encode(source);
  const len = msg.length;
  
  // Create padding
  const paddingLen = ((len + 8) >> 6 << 6) + 64 - len;
  const padded = new Uint8Array(len + paddingLen);
  padded.set(msg);
  padded[len] = 0x80;
  
  // View as DataView for big-endian write
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, len * 8, false); // Length in bits (low 32)

  const w = new Uint32Array(64);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let i = 0; i < padded.length; i += 64) {
    // Prepare schedule
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = r(w[j - 15], 7) ^ r(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = r(w[j - 2], 17) ^ r(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 = r(e, 6) ^ r(e, 11) ^ r(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = r(a, 2) ^ r(a, 13) ^ r(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;

      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }

    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
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
export const fetchDeviceInfo = async () => apiRequest<DeviceInfoResponse>(1001, 'GET');
export const fetchNetworkInfo = async () => apiRequest<NetworkInfoResponse>(1002, 'GET');
export const fetchNetworkStatus = async () => apiRequest<NetworkStatusResponse>(1004, 'GET');

// Requested Functions
export const resetStatistics = async () => apiRequest(337, 'POST', { statisticsReset: '1', usedFlow: '0' });

export const updateDeviceHostname = async (mac: string, hostname: string) => apiRequest(562, 'POST', { subcmd: 1, mac, hostname });

// System Upgrade
export const uploadSystemUpdateFile = async (file: File) => {
  const sessionId = getSessionId();
  const json = {
    sessionId: sessionId,
    token: "",
    cmd: 5,
    method: "POST"
  };
  
  const fd = new FormData();
  fd.append("json", JSON.stringify(json));
  fd.append("file", file);

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      body: fd,
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const startSystemUpgrade = async (fileName: string) => {
    return apiRequest(106, 'POST', {
        updateType: 'CLIENT',
        fileName: fileName
    });
};

// APN Settings
export const fetchApnSettings = async () => apiRequest<ApnConfigResponse>(213, 'GET', { subcmd: 3 });
export const fetchApnList = async () => apiRequest<ApnListResponse>(248, 'GET', { subcmd: 3 });

export const saveApnConfig = async (data: { apnNatName: string; apnMTU: string; selectType: string }) =>
  apiRequest(213, 'POST', { subcmd: 3, ...data });

export const saveApnList = async (apn_list: ApnProfile[]) =>
  apiRequest(248, 'POST', { apn_list });

// Network Mode
export const fetchNetworkMode = async () => apiRequest<NetworkModeResponse>(256, 'GET');
export const setNetworkMode = async (networkMode: string) => apiRequest(256, 'POST', { networkMode });

// Network Configuration
export const fetchNetworkConfigInfo = async () => apiRequest<{ flightMode: string; success: boolean }>(218, 'GET');
export const setFlightMode = async (flightMode: '0' | '1') => apiRequest(226, 'POST', { flightMode });
export const searchNetwork = async () => apiRequest(288, 'POST');

// Link Detection
export const fetchLinkDetectionSettings = async () => apiRequest<LinkDetectionSettings>(336, 'GET');
export const saveLinkDetectionSettings = async (data: Partial<LinkDetectionSettings>) => apiRequest(336, 'POST', data);