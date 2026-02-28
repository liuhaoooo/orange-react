

import { apiRequest } from './core';
import { 
    StatusInfoResponse, 
    ConnectionSettingsResponse, 
    NetworkInfoResponse, 
    NetworkStatusResponse,
    ApnConfigResponse,
    ApnListResponse,
    MultipleApnResponse,
    NetworkModeResponse,
    LinkDetectionSettings,
    LockBandSettings,
    PlmnScanResponse,
    ApnProfile,
    UsageSettingsResponse,
    ImsSettingsResponse,
    DhcpSettingsResponse,
    IpReservationResponse,
    IpReservationRule,
    RoutingSettingsResponse,
    RoutingRule,
    MeshSettingsResponse,
    TopologyDataResponse,
    GlobalMacFilterDefaultRule,
    GlobalMacFilterDefaultResponse,
    GlobalMacFilterRule,
    GlobalMacFilterResponse,
    UrlFilterDefaultRule,
    UrlFilterDefaultResponse,
    UrlFilterRule,
    UrlFilterResponse
} from './types';

// Status & Connection
export const fetchStatusInfo = async () => apiRequest<StatusInfoResponse>(586, 'GET');
export const fetchConnectionSettings = async () => apiRequest<ConnectionSettingsResponse>(585, 'GET');
export const updateConnectionSettings = async (data: any) => apiRequest(1020, 'POST', data);
export const setDialMode = async (dialMode: '0' | '1') => apiRequest(222, 'POST', { dialMode });
export const setRoamingEnable = async (roamingEnable: '0' | '1') => apiRequest(220, 'POST', { roamingEnable });

// Network Info
export const fetchNetworkInfo = async () => apiRequest<NetworkInfoResponse>(1002, 'GET');
export const fetchNetworkStatus = async () => apiRequest<NetworkStatusResponse>(1004, 'GET');

// Network Configuration & Mode
export const fetchNetworkMode = async () => apiRequest<NetworkModeResponse>(256, 'GET');
export const setNetworkMode = async (networkMode: string) => apiRequest(256, 'POST', { networkMode });
export const fetchNetworkConfigInfo = async () => apiRequest<{ flightMode: string; success: boolean }>(218, 'GET');
export const setFlightMode = async (flightMode: '0' | '1') => apiRequest(226, 'POST', { flightMode });
export const searchNetwork = async () => apiRequest(288, 'POST');

// APN Settings
export const fetchApnSettings = async () => apiRequest<ApnConfigResponse>(213, 'GET', { subcmd: 3 });
export const fetchApnList = async () => apiRequest<ApnListResponse>(248, 'GET', { subcmd: 3 });
export const saveApnConfig = async (data: { apnNatName: string; apnMTU: string; selectType: string }) =>
  apiRequest(213, 'POST', { subcmd: 3, ...data });
export const saveApnList = async (apn_list: ApnProfile[]) =>
  apiRequest(248, 'POST', { apn_list });

// Multiple APN
export const fetchMultipleApnSettings = async () => apiRequest<MultipleApnResponse>(130, 'GET');
export const saveMultipleApnSettings = async (data: Record<string, any>) => apiRequest(130, 'POST', data);

// Link Detection
export const fetchLinkDetectionSettings = async () => apiRequest<LinkDetectionSettings>(336, 'GET');
export const saveLinkDetectionSettings = async (data: Partial<LinkDetectionSettings>) => apiRequest(336, 'POST', data);

// Lock Band
export const fetchLockBandSettings = async () => apiRequest<LockBandSettings>(161, 'GET');
export const saveLockBandSettings = async (data: Partial<LockBandSettings>) => apiRequest(161, 'POST', data);

// PLMN
export const scanPlmnNetwork = async () => apiRequest<PlmnScanResponse>(228, 'POST', { sccan_plmn: '1' });
export const getPlmnList = async () => apiRequest<PlmnScanResponse>(228, 'GET');
export const selectPlmn = async (plmn: string, act: string) => apiRequest(228, 'POST', { plmn_select_cmd: '4', plmn, act });

// Display Solution
export const fetchDisplaySolution = async () => apiRequest<{ buffer: string; success?: boolean }>(235, 'GET');
export const setDisplaySolution = async (value: string) => apiRequest(235, 'POST', { value });

// Usage Settings
export const fetchUsageSettings = async () => apiRequest<UsageSettingsResponse>(1021, 'GET');
export const saveUsageSettings = async (data: any) => apiRequest(337, 'POST', data);

// IMS Settings
export const fetchImsSettings = async () => apiRequest<ImsSettingsResponse>(1023, 'GET');
export const saveImsSettings = async (data: { volteSw: string; pdpType: string; ims: string }) => apiRequest(1023, 'POST', data);

// DHCP Settings
export const fetchDhcpSettings = async () => apiRequest<DhcpSettingsResponse>(3, 'GET');
export const saveDhcpSettings = async (data: any) => apiRequest(3, 'POST', data);

// IP Address Reservation
export const fetchIpReservation = async () => apiRequest<IpReservationResponse>(115, 'GET');
export const saveIpReservation = async (datas: IpReservationRule[]) => apiRequest(115, 'POST', { datas });

// Routing Configuration
export const fetchRoutingSettings = async () => apiRequest<RoutingSettingsResponse>(164, 'GET', { getfun: true });
export const saveRoutingSettings = async (datas: RoutingRule[]) => apiRequest(164, 'POST', { datas });
export const applyRoutingSettings = async () => apiRequest(20, 'POST');

// Mesh Configuration
export const fetchMeshSettings = async () => apiRequest<MeshSettingsResponse>(314, 'GET');
export const saveMeshSettings = async (data: { mesh_switch: string; mesh_role: string; networking: number }) => apiRequest(314, 'POST', data);

// Topology
export const fetchTopologyData = async () => apiRequest<TopologyDataResponse>(315, 'GET');

// URL Filter
export const fetchUrlFilterDefault = async () => apiRequest<UrlFilterDefaultResponse>(29, 'GET');
export const saveUrlFilterDefault = async (datas: UrlFilterDefaultRule[]) => apiRequest(29, 'POST', { datas });
export const fetchUrlFilterRules = async () => apiRequest<UrlFilterResponse>(26, 'GET', { getfun: true });
export const saveUrlFilterRules = async (datas: UrlFilterRule[]) => apiRequest(26, 'POST', { datas });
export const applyUrlFilterSettings = async () => apiRequest(20, 'POST');

// Global MAC Filter
export const fetchGlobalMacFilterDefault = async () => apiRequest<GlobalMacFilterDefaultResponse>(30, 'GET');
export const saveGlobalMacFilterDefault = async (datas: GlobalMacFilterDefaultRule[]) => apiRequest(30, 'POST', { datas });
export const fetchGlobalMacFilterRules = async () => apiRequest<GlobalMacFilterResponse>(23, 'GET', { getfun: true });
export const saveGlobalMacFilterRules = async (datas: GlobalMacFilterRule[]) => apiRequest(23, 'POST', { datas });
export const applyGlobalMacFilterSettings = async () => apiRequest(20, 'POST');
