
import { apiRequest } from './core';
import { WifiSettingsResponse, MacFilterResponse, MacFilterRule } from './types';

export const fetchWifiSettings = async () => apiRequest<WifiSettingsResponse>(587, 'GET');

export const updateWifiConfig = async (params: any) => {
    const cmd = params.is5g ? 211 : 2;
    const subcmd = params.isGuest ? 1 : 0;
    // encodeURIComponent handles special chars before btoa
    const encodedSsid = btoa(unescape(encodeURIComponent(params.ssid)));
    const payload: any = {
        subcmd,
        wifiOpen: params.wifiOpen,
        broadcast: params.broadcast,
        ssid: encodedSsid,
        key: params.key,
        authenticationType: params.authenticationType
    };
    // wifiSames is usually only for 2.4G calls to sync settings or priority
    if (!params.is5g && params.wifiSames !== undefined) payload.wifiSames = params.wifiSames;
    return apiRequest(cmd, 'POST', payload);
};

export const fetchMacFilter = async (subcmd: string) => apiRequest<MacFilterResponse>(278, 'GET', { subcmd });

export const saveMacFilter = async (subcmd: string, macfilter: string, maclist: MacFilterRule[]) => 
    apiRequest(278, 'POST', { 
        subcmd, 
        datas: {
            macfilter,
            maclist
        }
    });

export const checkWifiStatus = async () => apiRequest<{ wifiStatus: string }>(417, 'GET');

export const fetchWpsSettings = async (subcmd: number) => apiRequest(132, 'GET', { subcmd });

export const saveWpsSettings = async (subcmd: number, enabled: boolean) => {
    const key = subcmd === 0 ? 'wlan2g_wps_switch' : 'wlan5g_wps_switch';
    return apiRequest(132, 'POST', {
        subcmd,
        [key]: enabled ? '1' : '0'
    });
};

export const startWpsPbc = async (subcmd: number) => apiRequest(243, 'POST', { subcmd });

export const setWpsPin = async (subcmd: number, wpsPin: string) => apiRequest(243, 'POST', { subcmd, wpsPin });

export const fetchWifiAdvanced = async (cmd: number) => apiRequest(cmd, 'GET');

export const saveWifiAdvanced = async (cmd: number, data: any) => apiRequest(cmd, 'POST', data);
