import React, { useEffect, useState } from 'react';
import { fetchDeviceInfo, DeviceInfoResponse } from '../../utils/api';
import { Loader2 } from 'lucide-react';

const InfoSection = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="mb-8">
    <h3 className="font-bold text-base text-black mb-4">{title}</h3>
    <div className="border border-gray-200 rounded-[2px] overflow-hidden">
      <table className="w-full text-left text-sm border-collapse">
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <tr className="border-b border-gray-200 last:border-0">
    <td className="w-1/3 sm:w-[250px] bg-[#f9f9f9] px-6 py-4 font-normal text-gray-600 border-r border-gray-200">
      {label}
    </td>
    <td className="px-6 py-4 text-black font-medium break-all">
      {value}
    </td>
  </tr>
);

// Format KB to proper unit string
const formatSize = (kb: number) => {
    if (kb >= 1048576) {
        return `${(kb / 1048576).toFixed(2)} GB`;
    } else if (kb >= 1024) {
        return `${(kb / 1024).toFixed(2)} MB`;
    }
    return `${kb} KB`;
};

const MemoryChart = ({ memoryStr }: { memoryStr?: string }) => {
    if (!memoryStr) return null;

    // Parse memory string: "1456112 kB, 1107140 kB, 61048 kB, 1121316 kB"
    // Order: [Total, Free, Cache, Available]
    const parts = memoryStr.split(',').map(s => parseInt(s.replace(/[^0-9]/g, ''), 10));
    if (parts.length < 4) return null;

    const total = parts[0];
    const free = parts[1];
    const used = total - free; // Simple calculation

    const usedPercent = total > 0 ? (used / total) * 100 : 0;

    return (
        <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4 overflow-hidden">
                <div className="bg-orange h-2.5 rounded-full" style={{ width: `${usedPercent}%` }}></div>
            </div>
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                {usedPercent.toFixed(0)}% Used ({formatSize(used)} / {formatSize(total)})
            </span>
        </div>
    );
};

export const DeviceInfoPage: React.FC = () => {
  const [data, setData] = useState<DeviceInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        try {
            const res = await fetchDeviceInfo();
            if (res && (res.success || res.success === undefined)) {
                setData(res);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    load();
  }, []);

  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  const info = data || {};

  return (
    <div className="w-full animate-fade-in py-2">
      
      <InfoSection title="Device Information">
          <InfoRow label="Product Name" value="Airbox2" />
          <InfoRow label="Device Model" value={info.board_type || '-'} />
          <InfoRow label="Hardware Version" value={info.hwversion || '-'} />
          <InfoRow label="Software Version" value={info.version || '-'} />
          <InfoRow label="Device Serial Number" value={info.device_sn || '-'} />
          <InfoRow label="Uptime" value={info.uptime ? `${(parseInt(info.uptime)/3600).toFixed(1)} Hours` : '-'} />
      </InfoSection>

      <InfoSection title="Module Information">
          <InfoRow label="Module Model" value={info.module_type || '-'} />
          <InfoRow label="Module IMEI" value={info.module_imei || '-'} />
          <InfoRow label="Module IMSI" value={info.IMSI || '-'} />
          <InfoRow label="Module ICCID" value={info.ICCID || '-'} />
          <InfoRow label="Module Firmware" value={info.module_softver || '-'} />
          <InfoRow label="Module Hardware" value={info.module_hardver || '-'} />
      </InfoSection>

      {info.memory && (
          <div className="mb-8">
              <h3 className="font-bold text-base text-black mb-4">System Resources</h3>
              <div className="border border-gray-200 rounded-[2px] p-6 bg-white">
                  <div className="mb-2 font-bold text-sm text-black">Memory Usage</div>
                  <MemoryChart memoryStr={info.memory} />
                  
                  {info.cpuload && (
                      <div className="mt-6">
                          <div className="mb-2 font-bold text-sm text-black">CPU Load</div>
                          <div className="flex items-center mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4 overflow-hidden">
                                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${parseFloat(info.cpuload)}%` }}></div>
                                </div>
                                <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                                    {info.cpuload}%
                                </span>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};
