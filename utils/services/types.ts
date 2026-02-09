
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
  // Fields for Help Page
  device_msisdn?: string;
  apn_name?: string;
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
  device_sn?: string;
  idu_firmware_version?: string;
  idu_hardware_version?: string;
  idu_device_sn?: string;
  memory?: string;
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
    RSCP?: string;
    RSSI_3G?: string;
    ECIO?: string;
    CELL_ID_3G?: string;
    uarfcn?: string;
    PSC?: string;
    currentband_3g?: string;
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
    build_type?: string;
    ver_type?: string;
    // Fields for Help Page
    device_module?: string;
    version?: string;
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

export interface ApnConfigResponse {
    success: boolean;
    cmd: number;
    apnNatName: string;
    apnMTU: string;
    selectType: string;
    clatMode: string;
    clatPrefix: string;
    esm_flag: string;
    [key: string]: any;
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

export interface ApnListResponse {
    success: boolean;
    cmd: number;
    apn_list: ApnProfile[];
    [key: string]: any;
}

export interface MultipleApnResponse {
    success: boolean;
    cmd: number;
    multiApnNum: string;
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

export interface LockBandSettings {
    all_band_5g?: string;
    lock_band_5g?: string;
    all_band_4g?: string;
    lock_band_4g?: string;
    all_band_3g?: string;
    lock_band_3g?: string;
    band_5g_switch?: string;
    band_4g_switch?: string;
    band_3g_switch?: string;
    band_5g_mask?: string;
    band_4g_mask?: string;
    band_3g_mask?: string;
    band5gRadio?: string;
    lock5gBand?: string;
    band4gRadio?: string;
    lock4gBand?: string;
    band3gRadio?: string;
    lock3gBand?: string;
    [key: string]: any;
}

export interface PlmnScanResponse {
    success: boolean;
    cmd: number;
    sccan_plmn_list: string;
    [key: string]: any;
}

export interface UsageSettingsResponse {
    success: boolean;
    cmd: number;
    limitSwitch: string;
    limitSize: string;
    startDate: string;
    nation_limit_size: string;
    internation_limit_size: string;
    nation_warn_percentage: string;
    warn_percentage: string;
    internation_warn_percentage: string;
    flow_sms_notice_sw: string;
    national_flow_sms_notice_sw: string;
    international_flow_sms_notice_sw: string;
    flow_limit_unit: string;
    flow_notice_number: string;
    nation_flow_notice_number: string;
    internation_flow_notice_number: string;
    nation_flow_notice_text: string;
    internation_flow_notice_text: string;
    flow_notice_text: string;
    dialMode: string;
    roamingEnable: string;
    reset_traffic_lastTime: string;
    mon_download_flow: string;
    roam_dl_mon_flow: string;
    roam_ul_mon_flow: string;
    dl_mon_flow: string;
    ul_mon_flow: string;
    [key: string]: any;
}

export interface ImsSettingsResponse {
    success: boolean;
    cmd: number;
    volteSw: string;
    volteRegStatus: string;
    ims: string;
    pdpType: string;
    [key: string]: any;
}

export interface MacFilterRule {
    remarks: string;
    mac: string;
}

export interface MacFilterResponse {
    success: boolean;
    cmd: number;
    datas: {
        macfilter: string;
        maclist: MacFilterRule[];
    };
    [key: string]: any;
}

export interface DhcpSettingsResponse {
    lanIp: string;
    netMask: string;
    dhcpServer: string;
    main_dns: string;
    vice_dns: string;
    ipBegin: string;
    ipEnd: string;
    expireTime: string;
    [key: string]: any;
}

export interface IpReservationRule {
    mac: string;
    ip: string;
}

export interface IpReservationResponse {
    success: boolean;
    cmd: number;
    datas: IpReservationRule[];
    [key: string]: any;
}

export interface RoutingRule {
    valid: boolean;
    ifName: string;
    netmask: string;
    ip: string;
    netmaskBits?: number;
    gateway: string;
}

export interface RoutingSettingsResponse {
    success: boolean;
    cmd: number;
    datas: RoutingRule[];
    [key: string]: any;
}
