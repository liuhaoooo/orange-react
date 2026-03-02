import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/services/core';

export const IpsecStatusPage: React.FC = () => {
  const [statusData, setStatusData] = useState<any>({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await apiRequest(281, 'GET', { subcmd: 1 });
        if (data && data.success) {
          setStatusData(data);
        }
      } catch (error) {
        console.error("Failed to fetch IPsec status", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderRow = (label: string, value: string | undefined) => (
    <div className="flex border-b border-gray-200 last:border-b-0">
      <div className="w-1/3 min-w-[150px] p-4 text-sm font-medium text-gray-600 border-r border-gray-200">
        {label}
      </div>
      <div className="w-2/3 p-4 text-sm text-gray-900">
        {value || '-'}
      </div>
    </div>
  );

  const renderStatusRow = (label: string, value: string | undefined) => {
    let displayValue = '-';
    if (value === '1') {
      displayValue = 'Connected';
    } else if (value !== undefined && value !== '') {
      displayValue = 'Disconnected';
    }

    return (
      <div className="flex border-b border-gray-200 last:border-b-0">
        <div className="w-1/3 min-w-[150px] p-4 text-sm font-medium text-gray-600 border-r border-gray-200">
          {label}
        </div>
        <div className="w-2/3 p-4 text-sm text-gray-900">
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="bg-white border border-gray-200 rounded-[6px] overflow-hidden">
        {renderRow('Policy name', statusData.ipsec_policy_name)}
        {renderRow('Local address', statusData.left)}
        {renderRow('Peer address', statusData.right)}
        {renderRow('Data flow', statusData.data_stream)}
        {renderRow('IKE algorithm', statusData.ike)}
        {renderRow('ESP Algorithm', statusData.esp)}
        {renderRow('Duration', statusData.ipsec_uptime)}
        {renderStatusRow('Status', statusData.ipsec_status)}
        {renderRow('RX data (bytes)', statusData.ipsec_rx_data)}
        {renderRow('TX data (bytes)', statusData.ipsec_tx_data)}
      </div>
    </div>
  );
};
