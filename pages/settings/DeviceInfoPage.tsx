
import React, { useEffect, useState } from 'react';
import { fetchDeviceInfo, DeviceInfoResponse } from '../../utils/api';
import { Loader2 } from 'lucide-react';

const DeviceInfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
      <label className="font-bold text-sm text-black">{label}</label>
    </div>
    <div className="w-full sm:w-2/3 text-sm text-gray-700 font-medium break-all">
      {value}
    </div>
  </div>
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
    // We need at least Total and Free
    if (parts.length < 2 || isNaN(parts[0])) return null;

    const total = parts[0];
    const free = parts[1];
    const used = total - free; 

    const usedPercent = total > 0 ? (used / total) * 100 : 0;

    return (
        <div className="flex items-center mt-2 w-full max-w-md">
            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-4 overflow-hidden">
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

  // Cast to ensure TS knows keys exist (even if optional)
  const info = (data || {}) as DeviceInfoResponse;

  return (
    <div className="w-full animate-fade-in py-2">
      
      <div className="mb-10">
          <h3 className="font-bold text-base text-black mb-4 border-b border-gray-200 pb-2">Device Information</h3>
          <div className="space-y-0.5">
              <DeviceInfoRow label="Product Name" value="Airbox2" />
              <DeviceInfoRow label="Device Model" value={info.board_type || '-'} />
              <DeviceInfoRow label="Hardware Version" value={info.hwversion || '-'} />
              <DeviceInfoRow label="Software Version" value={info.version || '-'} />
              <DeviceInfoRow label="Device Serial Number" value={info.device_sn || '-'} />
              <DeviceInfoRow label="Uptime" value={info.uptime ? `${(parseInt(info.uptime, 10)/3600).toFixed(1)} Hours` : '-'} />
          </div>
      </div>

      <div className="mb-10">
          <h3 className="font-bold text-base text-black mb-4 border-b border-gray-200 pb-2">Module Information</h3>
          <div className="space-y-0.5">
              <DeviceInfoRow label="Module Model" value={info.module_type || '-'} />
              <DeviceInfoRow label="Module IMEI" value={info.module_imei || '-'} />
              <DeviceInfoRow label="Module IMSI" value={info.IMSI || '-'} />
              <DeviceInfoRow label="Module ICCID" value={info.ICCID || '-'} />
              <DeviceInfoRow label="Module Firmware" value={info.module_softver || '-'} />
              <DeviceInfoRow label="Module Hardware" value={info.module_hardver || '-'} />
          </div>
      </div>

      {info.memory && (
          <div className="mb-8">
              <h3 className="font-bold text-base text-black mb-4 border-b border-gray-200 pb-2">System Resources</h3>
              
              <div className="py-4 border-b border-gray-100">
                  <div className="mb-2 font-bold text-sm text-black">Memory Usage</div>
                  <MemoryChart memoryStr={info.memory} />
              </div>
              
              {info.cpuload && (
                  <div className="py-4 border-b border-gray-100">
                      <div className="mb-2 font-bold text-sm text-black">CPU Load</div>
                      <div className="flex items-center mt-2 w-full max-w-md">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 mr-4 overflow-hidden">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${parseFloat(info.cpuload)}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                                {info.cpuload}%
                            </span>
                      </div>
                  </div>
              )}
          </div>
      )}

    </div>
  );
};
