
import React from 'react';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { SignalStrengthIcon } from '../../components/UIComponents';

// --- Shared Components ---

const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="font-bold text-base text-black mb-4 mt-2">{title}</h3>
);

const InfoTable = ({ children }: { children: React.ReactNode }) => (
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

export const NetworkInfoPage: React.FC = () => {
  const { globalData } = useGlobalState();
  const info = globalData.statusInfo || {};

  // Mock Data for Cell Info to match screenshot
  const cell4gData = [
      ['1300', '169', '-99', '-12', '1'],
      ['1300', '170', '-110', '-19', '-6']
  ];

  const cell5gData = [
      ['152650', '395', '-107', '-15', '-3'],
      ['152650', '484', '-98', '-12', '3'],
      ['152650', '340', '-113', '-16', '-5']
  ];

  // Helper to extract values or use defaults from screenshot
  const getVal = (key: string, def: string) => info[key] || def;

  return (
    <div className="w-full animate-fade-in py-2">
      
      {/* 1. Mobile Network */}
      <SectionTitle title="Mobile Network" />
      <InfoTable>
          <InfoRow 
            label="Signal Strength" 
            renderValue={
                <SignalStrengthIcon 
                    level={parseInt(info.signal_lvl || '4', 10)} 
                    className="h-5 w-8" 
                    barWidth="w-1" 
                />
            } 
          />
          <InfoRow label="Network Mode" value={info.network_type_str || '5G'} />
          <InfoRow label="Operator" value={info.operator || 'China Mobile'} />
          <InfoRow label="PCI (4G/5G)" value={getVal('pci_combined', '168/860')} />
          <InfoRow label="EARFCN (4G/5G)" value={getVal('earfcn_combined', '1300/504990')} />
          <InfoRow label="eNodeB/gNodeB ID" value={getVal('cell_id_combined', '626976/-')} />
          <InfoRow label="EUTRAN/NR Cell ID" value={getVal('eutran_id', '9912048/-')} />
          <InfoRow label="CQI (4G/5G)" value="5/4" />
          <InfoRow label="Uplink MCS (4G/5G)" value="0/20" />
          <InfoRow label="Downlink MCS (4G/5G)" value="18/5" />
          <InfoRow label="Bandwidth (4G/5G)" value="20/100" />
          <InfoRow label="ECGI/NCGI" value="460009912048/-" />
          <InfoRow label="Current Band (4G/5G)" value="3/41" />
          <InfoRow label="Rank Type (4G/5G)" value="2/1" />
          <InfoRow label="Downlink BLER (4G/5G)" value="100/0" />
          <InfoRow label="RSRP (4G/5G)" value="-97 dBm/-58 dBm" />
          <InfoRow label="RSSI (4G/5G)" value="-85 dBm/-38 dBm" />
          <InfoRow label="RSRQ (4G/5G)" value="-9 dB/-10 dB" />
          <InfoRow label="SINR (4G/5G)" value="-1 dB/29 dB" />
          <InfoRow label="4G Upstream 64QAM capability" value="NO" />
          <InfoRow label="4G Downstream 256QAM capability" value="NO" />
          <InfoRow label="Current Upstream QAM (4G/5G)" value="64QAM/QPSK" />
          <InfoRow label="Current Downstream QAM (4G/5G)" value="64QAM/16QAM" />
      </InfoTable>

      {/* 2. APN Information */}
      <SectionTitle title="APN Information" />
      <InfoTable>
          <InfoRow label="APN" value={info.apn || 'cmnet'} />
          <InfoRow label="IP" value={info.ip_address || '10.85.68.133'} />
          <InfoRow label="Primary DNS" value={info.primary_dns || '120.196.165.7'} />
          <InfoRow label="Secondary DNS" value={info.secondary_dns || '221.179.38.7'} />
          <InfoRow label="IPv6" value={info.ipv6_address || '-'} />
          <InfoRow label="Primary IPv6 DNS" value="-" />
          <InfoRow label="Secondary IPv6 DNS" value="-" />
          <InfoRow label="Packets Received" value="1492645" />
          <InfoRow label="Packets Sent" value="688858" />
          <InfoRow label="Bytes Received" value="1511542396" />
          <InfoRow label="Bytes Sent" value="168412943" />
      </InfoTable>

      {/* 3. Multiple APN Information */}
      <SectionTitle title="Multiple APN Information" />
      <DataTable 
        headers={['APN', 'Profile Name', 'IP', 'Subnet Mask', 'IPv6']} 
        rows={[]} // Empty array to show "No Data" as per screenshot
      />

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
