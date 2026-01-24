
import React from 'react';

export const PlmnScanPage: React.FC = () => {
  // Mock data matching the screenshot
  const networks = [
    { status: 'Available', operator: 'CHN-TELECOM', short: 'CTCC', plmn: '46011', net: '4G', selected: true },
    { status: 'Not available', operator: 'CHINA BROADNET', short: 'CBN', plmn: '46015', net: '4G', selected: false },
    { status: 'Not available', operator: 'CHN-UNICOM', short: 'CUCC', plmn: '46001', net: '4G', selected: false },
    { status: 'Not available', operator: 'CHINA MOBILE', short: 'CMCC', plmn: '46000', net: '4G', selected: false },
  ];

  return (
    <div className="w-full animate-fade-in">
      <div className="overflow-x-auto mb-12">
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
            {networks.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-6 font-medium text-black">{row.status}</td>
                <td className="py-6 font-medium text-black">{row.operator}</td>
                <td className="py-6 font-medium text-black">{row.short}</td>
                <td className="py-6 font-medium text-black">{row.plmn}</td>
                <td className="py-6 font-medium text-black">{row.net}</td>
                <td className={`py-6 font-bold text-end pe-4 ${row.selected ? 'text-black' : 'text-[#d1d5db]'}`}>
                  selected
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
          <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm">
              PLMN scan
          </button>
      </div>
    </div>
  );
};
