
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { scanPlmnNetwork, getPlmnList, apiRequest } from '../../../utils/api';
import { useAlert } from '../../../utils/AlertContext';
import { useGlobalState } from '../../../utils/GlobalStateContext';

interface PlmnItem {
    status: string;
    operator: string;
    shortName: string;
    plmn: string;
    network: string;
}

const ERROR_MESSAGES: Record<string, string> = {
    "500": "General error",
    "501": "The current state does not support the operation",
    "502": "AT command returns error",
    "503": "No sim card",
    "504": "SIM card is locked",
    "505": "Illegal PIN/PUK code",
    "506": "Illegal parameter",
    "507": "Operation timeout"
};

export const PlmnScanPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [list, setList] = useState<PlmnItem[]>([]);
  const { showAlert } = useAlert();
  const { globalData } = useGlobalState();

  const netFormatter = (network: string): string => {
      const net = parseInt(network, 10);
      if (isNaN(net)) return network;
      
      if (net < 4) {
          return '3G';
      } else if (net >= 4 && net < 10) {
          return '4G';
      } else if (net >= 10) {
          return '5G';
      }
      return network;
  };

  const statusFormatter = (status: string): string => {
      if (status === '0' || status === '3') return 'Not available';
      if (status === '1') return 'Available';
      if (status === '2') return 'Current PLMN';
      return status;
  };

  // Helper to parse response string
  const parseList = (rawString: string): PlmnItem[] => {
      if (!rawString) return [];
      // Format: "1,CHN-TELECOM,CTCC,46011,7|3,CHINA BROADNET,CBN,46015,7"
      const rows = rawString.split('|');
      return rows.map(row => {
          const cols = row.split(',');
          return {
              status: cols[0] || '',
              operator: cols[1] || '',
              shortName: cols[2] || '',
              plmn: cols[3] || '',
              network: cols[4] || ''
          };
      }).filter(item => item.plmn); // Filter out empty lines if any
  };

  useEffect(() => {
      const fetchCache = async () => {
          try {
              const res = await getPlmnList();
              if (res && res.success && res.sccan_plmn_list) {
                  setList(parseList(res.sccan_plmn_list));
              }
          } catch(e) {
              console.error("Failed to fetch PLMN cache", e);
          }
      };
      fetchCache();
  }, []);

  const handleScan = async () => {
      // Check SIM Status
      const simStatus = globalData.statusInfo?.sim_status;
      if (simStatus !== '1') {
          showAlert('SIM card is not ready. Cannot scan.', 'warning');
          return;
      }

      setLoading(true);
      setList([]);
      
      try {
          const res = await scanPlmnNetwork();
          if (res && res.success) {
              const rawString = res.sccan_plmn_list || '';
              if (rawString) {
                  setList(parseList(rawString));
                  showAlert('Scan completed successfully', 'success');
              } else {
                  showAlert('No networks found', 'info');
              }
          } else {
              const msgCode = res?.message || '';
              const errorText = ERROR_MESSAGES[msgCode] || 'Scan failed';
              showAlert(errorText, 'error');
          }
      } catch (e) {
          console.error("Scan error", e);
          showAlert('Error during scan process', 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleSelect = async (row: PlmnItem) => {
      // Prevent selection if loading, already selected, or unavailable
      if (loading || processingKey || row.status === '2' || row.status === '0' || row.status === '3') return;

      const key = `${row.plmn}_${row.network}`;
      setProcessingKey(key);

      try {
          // Payload: {"cmd":228,"plmn_select_cmd":"4","plmn":"46011","act":"7", ...}
          // Using apiRequest directly as requested to avoid changing api.ts
          const res = await apiRequest(228, 'POST', { 
              plmn_select_cmd: '4', 
              plmn: row.plmn, 
              act: row.network 
          });
          
          if (res && res.success) {
              showAlert('Network registered successfully', 'success');
              // Optimistically update the list
              setList(prev => prev.map(item => {
                  // Ensure specific match for multi-RAT scenarios
                  if (item.plmn === row.plmn && item.network === row.network) {
                      return { ...item, status: '2' }; // Set new current
                  }
                  if (item.status === '2') {
                      return { ...item, status: '1' }; // Demote old current to available
                  }
                  return item;
              }));
          } else {
              const msgCode = res?.message || '';
              const errorText = ERROR_MESSAGES[msgCode] || 'Failed to register network';
              showAlert(errorText, 'error');
          }
      } catch (e) {
          console.error("Select PLMN error", e);
          showAlert('Error registering network', 'error');
      } finally {
          setProcessingKey(null);
      }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="overflow-x-auto mb-12 min-h-[200px]">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-black text-sm border-b border-gray-100">
              <th className="py-4 font-normal w-[15%]">Status</th>
              <th className="py-4 font-normal w-[20%]">Operator</th>
              <th className="py-4 font-normal w-[15%]">short name</th>
              <th className="py-4 font-normal w-[15%]">PLMN</th>
              <th className="py-4 font-normal w-[15%]">network</th>
              <th className="py-4 font-normal w-[20%] text-end pe-4">selected</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
                <tr>
                    <td colSpan={6} className="py-12 text-center bg-gray-50">
                        <div className="flex flex-col items-center justify-center p-4">
                            <Loader2 className="animate-spin text-orange mb-4" size={40} />
                            <p className="text-black font-bold text-base mb-2">Scanning Network...</p>
                            <p className="text-gray-600 text-sm max-w-lg leading-relaxed text-center">
                                The search operation may take some time. This process will not exceed 4 minutes. Please do not refresh the page, operate the page, disconnect the power, etc. while waiting.
                            </p>
                        </div>
                    </td>
                </tr>
            ) : list.length > 0 ? (
                list.map((row, index) => {
                    const isSelected = row.status === '2';
                    const isDisabled = row.status === '0' || row.status === '3' || loading || !!processingKey;
                    const isProcessing = processingKey === `${row.plmn}_${row.network}`;
                    
                    return (
                        <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-6 font-medium text-black">{statusFormatter(row.status)}</td>
                            <td className="py-6 font-medium text-black">{row.operator}</td>
                            <td className="py-6 font-medium text-black">{row.shortName}</td>
                            <td className="py-6 font-medium text-black">{row.plmn}</td>
                            <td className="py-6 font-medium text-black">{netFormatter(row.network)}</td>
                            <td className="py-6 text-end pe-4">
                                <div className="flex justify-end items-center h-full">
                                    {isProcessing ? (
                                        <Loader2 className="animate-spin text-orange w-4 h-4" />
                                    ) : (
                                        <input 
                                            type="radio" 
                                            checked={isSelected}
                                            disabled={isDisabled}
                                            onChange={() => handleSelect(row)}
                                            className={`w-4 h-4 text-orange focus:ring-orange border-gray-300 ${isDisabled ? 'cursor-not-allowed opacity-50 bg-gray-100' : 'cursor-pointer'}`}
                                        />
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                        No Data
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button 
            onClick={handleScan}
            disabled={loading || !!processingKey}
            className={`
                border-2 border-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm flex items-center
                ${(loading || !!processingKey)
                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                    : 'bg-[#eeeeee] text-black hover:bg-black hover:text-white'
                }
            `}
          >
              {loading && <Loader2 className="animate-spin w-4 h-4 me-2" />}
              PLMN scan
          </button>
      </div>
    </div>
  );
};
