
import React, { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';

// Custom Checkbox to match the screenshot (Black filled with white check)
const BandCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div 
    className="flex items-center cursor-pointer select-none group"
    onClick={onChange}
  >
    <div className={`w-5 h-5 border flex items-center justify-center me-3 transition-colors rounded-[2px] ${checked ? 'bg-[#333] border-[#333]' : 'border-gray-200 bg-white group-hover:border-gray-300'}`}>
       {checked && <Check size={14} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-sm text-gray-600 font-medium">{label}</span>
  </div>
);

export const LockBandPage: React.FC = () => {
  // Switch States
  const [lock3g, setLock3g] = useState(true);
  const [lock4g, setLock4g] = useState(true);
  const [lock5g, setLock5g] = useState(true);

  // Band Selection States (Using simple arrays for this UI demo)
  const [bands3g, setBands3g] = useState<string[]>(['Band1']);
  const [bands4g, setBands4g] = useState<string[]>(['Band1', 'Band7', 'Band8', 'Band28', 'Band38', 'Band41', 'Band43']);
  const [bands5g, setBands5g] = useState<string[]>(['Band1', 'Band3', 'Band7', 'Band40', 'Band78']);

  // Data Definitions
  const list3g = ['Band1', 'Band8'];
  const list4g = ['Band1', 'Band3', 'Band7', 'Band8', 'Band20', 'Band28', 'Band38', 'Band41', 'Band42', 'Band43'];
  const list5g = ['Band1', 'Band3', 'Band7', 'Band20', 'Band28', 'Band38', 'Band40', 'Band41', 'Band75', 'Band77', 'Band78'];

  const toggleBand = (band: string, currentList: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentList.includes(band)) {
        setter(currentList.filter(b => b !== band));
    } else {
        setter([...currentList, band]);
    }
  };

  return (
    <div className="w-full animate-fade-in py-2">
      
      {/* 3G Section */}
      <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
             <label className="font-bold text-sm text-black">3G lock band switch</label>
             <SquareSwitch isOn={lock3g} onChange={() => setLock3g(!lock3g)} />
          </div>
          
          {lock3g && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-sm text-black mb-6">3G band</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    {list3g.map(band => (
                        <BandCheckbox 
                            key={band} 
                            label={band} 
                            checked={bands3g.includes(band)} 
                            onChange={() => toggleBand(band, bands3g, setBands3g)} 
                        />
                    ))}
                </div>
              </div>
          )}
      </div>

      {/* 4G Section */}
      <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
             <label className="font-bold text-sm text-black">4G lock band switch</label>
             <SquareSwitch isOn={lock4g} onChange={() => setLock4g(!lock4g)} />
          </div>
          
          {lock4g && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-sm text-black mb-6">4G frequency band</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    {list4g.map(band => (
                        <BandCheckbox 
                            key={band} 
                            label={band} 
                            checked={bands4g.includes(band)} 
                            onChange={() => toggleBand(band, bands4g, setBands4g)} 
                        />
                    ))}
                </div>
              </div>
          )}
      </div>

      {/* 5G Section */}
      <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
             <label className="font-bold text-sm text-black">5G lock band switch</label>
             <SquareSwitch isOn={lock5g} onChange={() => setLock5g(!lock5g)} />
          </div>
          
          {lock5g && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-sm text-black mb-6">5G frequency band</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    {list5g.map(band => (
                        <BandCheckbox 
                            key={band} 
                            label={band} 
                            checked={bands5g.includes(band)} 
                            onChange={() => toggleBand(band, bands5g, setBands5g)} 
                        />
                    ))}
                </div>
              </div>
          )}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-12 mt-4">
            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center">
                <Save size={18} className="me-2" />
                Save
            </button>
      </div>

    </div>
  );
};
