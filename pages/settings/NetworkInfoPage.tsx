import React, { useEffect, useState } from 'react';
import { fetchNetworkInfo, fetchNetworkStatus, NetworkInfoResponse, ApnInfoItem } from '../../utils/api';
import { SignalStrengthIcon } from '../../components/UIComponents';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

// --- Shared Components ---

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="font-bold text-base text-black mb-4 mt-2">{title}</h3>
);

const InfoTable = ({ children }: { children?: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-[2px] overflow-hidden mb-8">
    <table className="w-full text-left text-sm border-collapse">
      <tbody>{children}</tbody>
    </table>
  </div>
);

const InfoRow = ({ label, value, renderValue }: { label: string, value?: string | number, renderValue?: React.ReactNode }) => (
  <tr className="border-b border-gray-200 last:border-0">
    <td className="w-1/3 sm:w-[250px] bg-[#f9f9f9] px-6 py-4 font-normal text-gray-600 border-r border-gray-200">
      {label}
    </td>
    <td className="px-6 py-4 text-black font-medium break-all">
      {renderValue ? renderValue : value}
    </td>
  </tr>
);

const DataTable = ({ headers, rows }: { headers: string[], rows: (string|number)[][] }) => (
    <div className="border-t border-gray-200 mb-8">
        <div className="w-full overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[600px]">
                 <thead>
                     <tr className="border-b border-gray-100 bg-white">
                         {headers.map((h, i) => (
                             <th key={i} className="py-4 px-6 font-bold text-black">{h}</th>
                         ))}
                     </tr>
                 </thead>
                 <tbody>
                     {rows.length > 0 ? rows.map((row, i) => (
                         <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                             {row.map((cell, j) => (
                                 <td key={j} className="py-4 px-6 text-black font-medium">{cell}</td>
                             ))}
                         </tr>
                     )) : (
                         <tr>
                             <td colSpan={headers.length} className="py-8 text-center text-gray-400 italic bg-white">No Data</td>
                         </tr>
                     )}
                 </tbody>
             </table>
        </div>
    </div>
);

const MultipleApnTable = ({ apnList }: { apnList: ApnInfoItem[] }) => {
    const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

    const toggleRow = (index: number) => {
        setExpandedIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    if (!apnList || apnList.length === 0) {
        return (
            <div className="border-t border-gray-200 mb-8">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-white">
                                <th className="py-4 px-6 font-bold text-black">APN</th>
                                <th className="py-4 px-6 font-bold text-black">Profile Name</th>
                                <th className="py-4 px-6 font-bold text-black">IP</th>
                                <th className="py-4 px-6 font-bold text-black">Subnet Mask</th>
                                <th className="py-4 px-6 font-bold text-black">IPv6</th>
                                <th className="py-4 px-6 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-400 italic bg-white">No Data</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-gray-200 mb-8">
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-100 bg-white">
                            <th className="py-4 px-6 font-bold text-black">APN</th>
                            <th className="py-4 px-6 font-bold text-black">Profile Name</th>
                            <th className="py-4 px-6 font-bold text-black">IP</th>
                            <th className="py-4 px-6 font-bold text-black">Subnet Mask</th>
                            <th className="py-4 px-6 font-bold text-black">IPv6</th>
                            <th className="py-4 px-6 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {apnList.map((item, index) => {
                            const isExpanded = expandedIndices.includes(index);
                            return (
                                <React.Fragment key={index}>
                                    <tr 
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                        onClick={() => toggleRow(index)}
                                    >
                                        <td className="py-4 px-6 text-black font-medium">{item.wanType}</td>
                                        <td className="py-4 px-6 text-black font-medium">{item.apnName}</td>
                                        <td className="py-4 px-6 text-black font-medium">{item.wanIp}</td>
                                        <td className="py-4 px-6 text-black font-medium">{item.wanNetmask}</td>
                                        <td className="py-4 px-6 text-black font-medium">{item.wanIpv6}</td>
                                        <td className="py-4 px-6 text-black font-medium">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan={6} className="p-0">
                                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm border-b border-gray-100">
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Primary DNS</span>
                                                        <span className="font-bold text-black">{item.wanDns}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Secondary DNS</span>
                                                        <span className="font-bold text-black">{item.wanDnsSecond}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Primary IPv6 DNS</span>
                                                        <span className="font-bold text-black">{item.wanIpv6Dns}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Secondary IPv6 DNS</span>
                                                        <span className="font-bold text-black">{item.wanIpv6DnsSecond}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Packets Received</span>
                                                        <span className="font-bold text-black">{item.wanRxPackets}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Packets Sent</span>
                                                        <span className="font-bold text-black">{item.wanTxPackets}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Bytes Received</span>
                                                        <span className="font-bold text-black">{item.wanRxBytes}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-gray-200 py-2">
                                                        <span className="text-gray-600">Bytes Sent</span>
                                                        <span className="font-bold text-black">{item.wanTxBytes}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const NetworkInfoPage: React.FC = () => {
  const [data, setData] = useState<NetworkInfoResponse | null>(null);
  const [apnList, setApnList] = useState<ApnInfoItem[]>([]);
  const [cell4gData, setCell4gData] = useState<string[][]>([]);
  const [cell5gData, setCell5gData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            // Fetch Network Info (CMD 1002)
            const res = await fetchNetworkInfo();
            if (res && (res.success || res.success === undefined)) {
                setData(res);
            }

            // Fetch Multiple APN Info & Cell Info (CMD 1004)
            const statusRes = await fetchNetworkStatus();
            if (statusRes && statusRes.success) {
                setApnList(statusRes.apn_list || []);
                
                // Helper to parse cell info strings (format: "row1col1,row1col2;row2col1,row2col2")
                const parseCellInfo = (infoStr?: string) => {
                    if (!infoStr) return [];
                    return infoStr.split(';')
                        .filter(s => s && s.trim().length > 0)
                        .map(row => row.split(','));
                };

                setCell4gData(parseCellInfo(statusRes.lte_info));
                setCell5gData(parseCellInfo(statusRes.nr_info));
            }
        } catch (e) {
            console.error("Failed to fetch network info", e);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    loadData();

    // Poll every 10 seconds
    const intervalId = setInterval(loadData, 10000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  const info = data || {};

  // Helper for dual 4G/5G string construction
  const combine = (v1?: string, v2?: string, suffix: string = '') => {
      return `${v1 || '-'}${suffix}/${v2 || '-'}${suffix}`;
  };

  // ECGI / NCGI Logic
  const getEcgi = () => {
      if (info.PLMN && info.CELL_ID) return info.PLMN + info.CELL_ID;
      return '-';
  };
  const getNcgi = () => {
      if (info.PLMN && info.CELL_ID_5G) return info.PLMN + info.CELL_ID_5G;
      return '-';
  };

  // Check if network is 3G to hide specific fields
  const is3G = info.network_type_str ? info.network_type_str.includes('3G') : false;

  return (
    <div className="w-full animate-fade-in py-2">
      
      {/* 1. Mobile Network */}
      <SectionTitle title="Mobile Network" />
      <InfoTable>
          <InfoRow label="Network Mode" value={info.network_type_str || '-'} />
          <InfoRow label="Operator" value={info.network_operator || '-'} />
          
          {!is3G && (
            <>
              <InfoRow label="PCI (4G/5G)" value={combine(info.PCI, info.PCI_5G)} />
              <InfoRow label="EARFCN (4G/5G)" value={combine(info.FREQ, info.FREQ_5G)} />
              <InfoRow label="eNodeB/gNodeB ID" value={combine(info.ENODEBID, info.ENODEBID_5G)} />
              <InfoRow label="EUTRAN/NR Cell ID" value={combine(info.CELL_ID, info.CELL_ID_5G)} />
              <InfoRow label="CQI (4G/5G)" value={combine(info.CQI, info.CQI_5G)} />
              <InfoRow label="Uplink MCS (4G/5G)" value={combine(info.ul_mcs, info.ul_mcs_5g)} />
              <InfoRow label="Downlink MCS (4G/5G)" value={combine(info.dl_mcs, info.dl_mcs_5g)} />
              <InfoRow label="Bandwidth (4G/5G)" value={combine(info.bandwidth, info.bandwidth_5g)} />
              <InfoRow label="ECGI/NCGI" value={`${getEcgi()}/${getNcgi()}`} />
              <InfoRow label="Current Band (4G/5G)" value={combine(info.currentband, info.currentband_5g)} />
              <InfoRow label="Rank Type (4G/5G)" value={combine(info.rank_4g, info.rank_5g)} />
              <InfoRow label="Downlink BLER (4G/5G)" value={combine(info.bler_4g, info.bler_5g)} />
              <InfoRow label="RSRP (4G/5G)" value={combine(info.RSRP, info.RSRP_5G, 'dBm')} />
              <InfoRow label="RSSI (4G/5G)" value={combine(info.RSSI, info.RSSI_5G, 'dBm')} />
              <InfoRow label="RSRQ (4G/5G)" value={combine(info.RSRQ, info.RSRQ_5G, 'dB')} />
              <InfoRow label="SINR (4G/5G)" value={combine(info.SINR, info.SINR_5G, 'dB')} />
              <InfoRow label="4G Upstream 64QAM capability" value={info.ul64qam_support === '1' ? 'YES' : 'NO'} />
              <InfoRow label="4G Downstream 256QAM capability" value={info.dl256qam_support === '1' ? 'YES' : 'NO'} />
              <InfoRow label="Current Upstream QAM (4G/5G)" value={combine(info.max_ul_qam, info.max_ul_qam_5g)} />
              <InfoRow label="Current Downstream QAM (4G/5G)" value={combine(info.max_dl_qam, info.max_dl_qam_5g)} />
            </>
          )}

          {is3G && (
            <>
              <InfoRow label="RSCP-3G" value={info.RSCP || '-'} />
              <InfoRow label="RSSI-3G" value={info.RSSI_3G || '-'} />
              <InfoRow label="ECIO-3G" value={info.ECIO || '-'} />
              <InfoRow label="CELL ID" value={info.CELL_ID_3G || '-'} />
              <InfoRow label="EARFCN" value={info.uarfcn || '-'} />
              <InfoRow label="PSC-3G" value={info.PSC || '-'} />
              <InfoRow label="Current Band" value={info.currentband_3g || '-'} />
              <InfoRow label="Bandwidth" value={info.bandwidth3G || '-'} />
            </>
          )}
      </InfoTable>

      {/* 2. APN Information */}
      <SectionTitle title="APN Information" />
      <InfoTable>
          <InfoRow label="APN" value={info.apn_name || '-'} />
          <InfoRow label="IP" value={info.wan_ip || '-'} />
          <InfoRow label="Primary DNS" value={info.wan_dns || '-'} />
          <InfoRow label="Secondary DNS" value={info.wan_dns2 || '-'} />
          <InfoRow label="IPv6" value={info.wan_ipv6_ip || '-'} />
          <InfoRow label="Primary IPv6 DNS" value={info.wan_ipv6_dns || '-'} />
          <InfoRow label="Secondary IPv6 DNS" value={info.wan_ipv6_dns2 || '-'} />
          <InfoRow label="Packets Received" value={info.wan_rx_packets || '0'} />
          <InfoRow label="Packets Sent" value={info.wan_tx_packets || '0'} />
          <InfoRow label="Bytes Received" value={info.wan_rx_bytes || '0'} />
          <InfoRow label="Bytes Sent" value={info.wan_tx_bytes || '0'} />
      </InfoTable>

      {/* 3. Multiple APN Information */}
      <SectionTitle title="Multiple APN Information" />
      <MultipleApnTable apnList={apnList} />

      {/* 4. 4G Cell Information */}
      <SectionTitle title="4G Cell Information" />
      <DataTable 
        headers={['EARFCN', 'PCI', 'RSRP', 'RSRQ', 'SINR']} 
        rows={cell4gData} 
      />

      {/* 5. 5G Cell Information */}
      <SectionTitle title="5G Cell information" />
      <DataTable 
        headers={['EARFCN', 'PCI', 'RSRP', 'RSRQ', 'SINR']} 
        rows={cell5gData} 
      />

    </div>
  );
};
