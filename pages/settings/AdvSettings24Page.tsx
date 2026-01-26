
import React, { useState } from 'react';
import { ChevronDown, Save } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';

const FormRow = ({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-red-500 me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer hover:border-gray-300"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const AdvSettings24Page: React.FC = () => {
  const [dfs, setDfs] = useState(false); // DFS usually not applicable for 2.4, but keeping for layout consistency if needed
  const [txPower, setTxPower] = useState('100%');
  const [countryCode, setCountryCode] = useState('FRANCE');
  const [channel, setChannel] = useState('Auto');
  const [wifiMode, setWifiMode] = useState('11b/g/n/ax');
  const [bandwidth, setBandwidth] = useState('40MHz');
  const [maxStation, setMaxStation] = useState('32');
  const [pmf, setPmf] = useState('Disable');

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="max-w-4xl">
          
          {/* DFS (Included for layout consistency, though rarely used in 2.4) */}
          <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
              <label className="font-bold text-sm text-black">DFS</label>
            </div>
            <div className="w-full sm:w-2/3">
               <SquareSwitch isOn={dfs} onChange={() => setDfs(!dfs)} />
            </div>
          </div>

          <FormRow label="TX Power:">
              <StyledSelect 
                value={txPower} 
                onChange={(e) => setTxPower(e.target.value)} 
                options={['100%', '75%', '50%', '25%']} 
              />
          </FormRow>

          <FormRow label="Wi-Fi Country Code">
              <StyledSelect 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)} 
                options={['FRANCE', 'CHINA', 'USA', 'GERMANY', 'UK']} 
              />
          </FormRow>

          <FormRow label="Channel:">
              <StyledSelect 
                value={channel} 
                onChange={(e) => setChannel(e.target.value)} 
                options={['Auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']} 
              />
          </FormRow>

          <FormRow label="Wi-Fi Mode:">
              <StyledSelect 
                value={wifiMode} 
                onChange={(e) => setWifiMode(e.target.value)} 
                options={['11b/g/n/ax', '11b/g/n', '11b/g', '11b']} 
              />
          </FormRow>

          <FormRow label="BandWidth">
              <StyledSelect 
                value={bandwidth} 
                onChange={(e) => setBandwidth(e.target.value)} 
                options={['20MHz', '40MHz']} 
              />
          </FormRow>

          <FormRow label="Max Station" required>
              <input 
                type="text" 
                value={maxStation}
                onChange={(e) => setMaxStation(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-300"
              />
          </FormRow>

          <FormRow label="PMF">
              <StyledSelect 
                value={pmf} 
                onChange={(e) => setPmf(e.target.value)} 
                options={['Disable', 'Optional', 'Required']} 
              />
          </FormRow>

          {/* Save Button */}
          <div className="flex justify-end pt-12 mt-2">
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Save
            </button>
          </div>
      </div>
    </div>
  );
};
