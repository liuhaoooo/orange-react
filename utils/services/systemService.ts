
import { apiRequest, getSessionId, API_BASE_URL } from './core';
import { DeviceInfoResponse } from './types';

export const fetchDeviceInfo = async () => apiRequest<DeviceInfoResponse>(1001, 'GET');
export const setLanguageSelection = async (languageSelect: string) => apiRequest(97, 'POST', { languageSelect });
export const setAutoUpgrade = async (autoValue: '0' | '1') => apiRequest(240, 'POST', { autoValue });
export const resetStatistics = async () => apiRequest(337, 'POST', { statisticsReset: '1', usedFlow: '0' });
export const updateDeviceHostname = async (mac: string, hostname: string) => apiRequest(562, 'POST', { subcmd: 1, mac, hostname });

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
