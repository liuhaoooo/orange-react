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
    loadData();
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
      
      <InfoSection title="Device & Version Information">
        <InfoRow label="Type" value={info.board_type || '-'} />
        <InfoRow label="SN" value={info.device_sn || '-'} />
        <InfoRow label="Software Version" value={info.version || '-'} />
        <InfoRow label="Running Time" value={formatUptime(uptimeSeconds)} />
        <InfoRow label="Hardware Version" value={info.hwversion || '-'} />
        <InfoRow label="Indoor Unit Hardware Version" value={info.idu_firmware_version || '-'} />
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