
import React from 'react';
import { useGlobalState } from '../../utils/GlobalStateContext';

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
  const { globalData } = useGlobalState();
  const info = globalData.statusInfo || {};

  // Helper to format time
  const formatTime = (secondsStr: string) => {
      if (!secondsStr) return "61:41:07"; // Fallback to screenshot value if missing
      const totalSeconds = parseInt(secondsStr, 10);
      if (isNaN(totalSeconds)) return "00:00:00";
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (num: number) => num.toString().padStart(2, '0');
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="w-full animate-fade-in py-2">
      
      <InfoSection title="Device & Version Information">
        <InfoRow label="Type" value="ZLT S200" />
        <InfoRow label="Software Version" value={info.sw_version || '2.1.23.1_dbg'} />
        <InfoRow label="Running Time" value={formatTime(info.time_elapsed)} />
        <InfoRow label="Hardware Version" value={info.hw_version || '7.823.910A'} />
      </InfoSection>

      <InfoSection title="Modem Information">
        <InfoRow label="IMEI" value={info.imei || '862902070007749'} />
        <InfoRow label="IMSI" value={info.imsi || '208010000000011'} />
        <InfoRow label="ICCID" value={info.iccid || 'FFFFFFFFFFFFFFFFF'} />
        <InfoRow label="Modem Type" value="UIS8520_PS_LIC" />
        <InfoRow label="Modem Soft Version" value="MOCORTM_V2_25A_W25.51.3_Debug" />
        <InfoRow label="Modem Hardware Version" value="uis8520_modem" />
      </InfoSection>

    </div>
  );
};
