import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { scanPlmnNetwork } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

interface PlmnItem {
    status: string;
    operator: string;
    shortName: string;
    plmn: string;
    network: string;
}

export const PlmnScanPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<PlmnItem[]>([]);
  const { showAlert } = useAlert();

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

  const handleScan = async () => {
      setLoading(true);
      setList([]);
      
      try {
          const res = await scanPlmnNetwork();
          if (res && res.success) {
              const rawString = res.sccan_plmn_list || '';
              if (rawString) {
                  // Format: "1,CHN-TELECOM,CTCC,46011,7|3,CHINA BROADNET,CBN,46015,7"
                  const rows = rawString.split('|');
                  const parsedList: PlmnItem[] = rows.map(row => {
                      const cols = row.split(',');
                      return {
                          status: cols[0] || '',
                          operator: cols[1] || '',
                          shortName: cols[2] || '',
                          plmn: cols[3] || '',
                          network: cols[4] || ''
                      };
                  });
                  setList(parsedList);
                  showAlert('Scan completed successfully', 'success');
              } else {
                  showAlert('No networks found', 'info');
              }
          } else {
              showAlert('Scan failed', 'error');
          }
      } catch (e) {
          console.error("Scan error", e);
          showAlert('Error during scan process', 'error');
      } finally {
          setLoading(false);
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
            {list.length > 0 ? (
                list.map((row, index) => {
                    const isSelected = row.status === '2';
                    return (
                        <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                            <td className="py-6 font-medium text-black">{statusFormatter(row.status)}</td>
                            <td className="py-6 font-medium text-black">{row.operator}</td>
                            <td className="py-6 font-medium text-black">{row.shortName}</td>
                            <td className="py-6 font-medium text-black">{row.plmn}</td>
                            <td className="py-6 font-medium text-black">{netFormatter(row.network)}</td>
                            <td className="py-6 text-end pe-4">
                                <div className="flex justify-end">
                                    <input 
                                        type="radio" 
                                        checked={isSelected}
                                        readOnly
                                        className="w-4 h-4 text-orange focus:ring-orange border-gray-300"
                                    />
                                </div>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                        {loading ? 'Scanning...' : 'No Data'}
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
            disabled={loading}
            className={`
                border-2 border-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm flex items-center
                ${loading 
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