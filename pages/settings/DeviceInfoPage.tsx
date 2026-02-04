import React, { useEffect, useState } from 'react';
import { fetchDeviceInfo, DeviceInfoResponse } from '../../utils/api';
import { Loader2 } from 'lucide-react';

const InfoSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
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
    
    if (parts.length < 3 || parts.some(p => isNaN(p))) return null;

    const total = parts[0];
    const free = parts[1];
    const cache = parts[2];
    const used = total - free - cache;

    const usedPct = (used / total) * 100;
    const cachePct = (cache / total) * 100;
    const freePct = (free / total) * 100;

    // Calculate conic gradient stops
    // Used: 0% -> usedPct%
    // Cache: usedPct% -> (usedPct + cachePct)%
    // Free: (usedPct + cachePct)% -> 100%
    const stop1 = usedPct;
    const stop2 = usedPct + cachePct;

    const items = [
        { label: 'Used Memory', value: used, pct: usedPct, color: '#ff7900' }, // Orange
        { label: 'Memory Cache', value: cache, pct: cachePct, color: '#000000' }, // Black
        { label: 'Memory Free', value: free, pct: freePct, color: '#e5e5e5' }, // Gray
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-[2px] p-6 mb-8 flex flex-col md:flex-row items-center justify-around">
            {/* Donut Chart */}
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center shrink-0 mb-6 md:mb-0"
                 style={{
                     background: `conic-gradient(
                        #ff7900 0% ${stop1}%, 
                        #000000 ${stop1}% ${stop2}%, 
                        #e5e5e5 ${stop2}% 100%
                     )`
                 }}
            >
                {/* Inner Circle */}
                <div className="absolute w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center text-center">
                    <span className="text-gray-500 text-xs font-bold uppercase mb-1">Total Memory</span>
                    <span className="text-black text-lg font-bold">{formatSize(total)}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col space-y-4 w-full md:w-auto min-w-[200px]">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full me-3" style={{ backgroundColor: item.color }}></div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-black">{item.label}</span>
                                <span className="text-xs text-gray-500">{formatSize(item.value)}</span>
                            </div>
                        </div>
                        <span className="font-bold text-sm text-black ms-4">{item.pct.toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DeviceInfoPage: React.FC = () => {
  const [data, setData] = useState<DeviceInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchDeviceInfo();
        if (res && (res.success || res.success === undefined)) {
             setData(res);
             // Initialize uptime counter
             if (res.uptime) {
                 const sec = parseInt(res.uptime, 10);
                 if (!isNaN(sec)) {
                     setUptimeSeconds(sec);
                 }
             }
        }
      } catch (e) {
        console.error("Failed to fetch device info", e);
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

  // Auto-increment uptime every second
  useEffect(() => {
      const timer = setInterval(() => {
          setUptimeSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  // Helper to format time to "X Day(s) X Hour(s) X Minute(s) X Second(s)"
  const formatUptime = (totalSeconds: number) => {
      if (isNaN(totalSeconds) || totalSeconds < 0) return "0 Second(s)";

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      let parts = [];
      if (days > 0) parts.push(`${days} Day(s)`);
      if (hours > 0) parts.push(`${hours} Hour(s)`);
      if (minutes > 0) parts.push(`${minutes} Minute(s)`);
      parts.push(`${seconds} Second(s)`);
      
      return parts.join(' ');
  };

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
      
      {/* Memory Chart Section */}
      {info.memory && <MemoryChart memoryStr={info.memory} />}

      <InfoSection title="Device & Version Information">
        <InfoRow label="Type" value={info.board_type || '-'} />
        <InfoRow label="SN" value={info.device_sn || '-'} />
        <InfoRow label="Software Version" value={info.version || '-'} />
        <InfoRow label="Running Time" value={formatUptime(uptimeSeconds)} />
        <InfoRow label="Hardware Version" value={info.hwversion || '-'} />
        <InfoRow label="Indoor Unit Software Version" value={info.idu_firmware_version || '-'} />
        <InfoRow label="Indoor Unit Hardware Version" value={info.idu_hardware_version || '-'} />
        <InfoRow label="Indoor Unit SN" value={info.idu_device_sn || '-'} />
        <InfoRow label="Average Load" value={info.cpuload || '-'} />
      </InfoSection>

      <InfoSection title="Modem Information">
        <InfoRow label="IMEI" value={info.module_imei || '-'} />
        <InfoRow label="IMSI" value={info.IMSI || '-'} />
        <InfoRow label="ICCID" value={info.ICCID || '-'} />
        <InfoRow label="Modem Type" value={info.module_type || '-'} />
        <InfoRow label="Modem Soft Version" value={info.module_softver || '-'} />
        <InfoRow label="Modem Hardware Version" value={info.module_hardver || '-'} />
      </InfoSection>

    </div>
  );
};
