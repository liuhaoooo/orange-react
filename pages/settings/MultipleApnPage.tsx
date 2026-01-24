
import React, { useState } from 'react';
import { Edit2, Save, Check, X } from 'lucide-react';

// Custom switch to match the specific black/white style in the provided design
const BlackSquareSwitch = ({ isOn, onChange }: { isOn: boolean; onChange: () => void }) => (
  <div 
    className="flex border border-black w-14 h-8 cursor-pointer select-none"
    onClick={onChange}
  >
    <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-black text-white' : 'bg-white'}`}>
      {isOn && <Check size={18} strokeWidth={3} />}
    </div>
    <div className={`flex-1 flex items-center justify-center transition-colors ${!isOn ? 'bg-black text-white' : 'bg-white'}`}>
      {!isOn && <X size={18} strokeWidth={3} />}
    </div>
  </div>
);

interface ApnRow {
    id: string;
    isActive: boolean;
    apn: string;
    configName: string;
    profileName: string;
}

export const MultipleApnPage: React.FC = () => {
  // Mock data based on the screenshot provided
  const [data, setData] = useState<ApnRow[]>([
    { id: '1', isActive: false, apn: '1', configName: '111', profileName: '222' },
    { id: '2', isActive: true, apn: '2', configName: 'aaaa', profileName: 'bb' },
    { id: '3', isActive: false, apn: '3', configName: '123', profileName: '4566' },
  ]);

  const toggleSwitch = (id: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 pe-4 font-bold text-black text-sm w-[120px]">APN switch</th>
              <th className="py-4 px-4 font-bold text-black text-sm w-[100px]">APN</th>
              <th className="py-4 px-4 font-bold text-black text-sm">Configuration name</th>
              <th className="py-4 px-4 font-bold text-black text-sm">Profile Name</th>
              <th className="py-4 ps-4 w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 pe-4">
                  <BlackSquareSwitch isOn={row.isActive} onChange={() => toggleSwitch(row.id)} />
                </td>
                <td className="py-3 px-4 text-sm text-black font-medium">{row.apn}</td>
                <td className="py-3 px-4 text-sm text-black font-medium">{row.configName}</td>
                <td className="py-3 px-4 text-sm text-black font-medium">{row.profileName}</td>
                <td className="py-3 ps-4 text-end">
                  <button className="text-gray-500 hover:text-black transition-colors p-1" title="Edit">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-8 mt-4 border-t border-gray-200">
          <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center">
              <Save size={18} className="me-2" />
              Save
          </button>
      </div>
    </div>
  );
};
