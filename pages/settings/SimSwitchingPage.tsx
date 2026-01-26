
import React, { useState } from 'react';
import { ChevronDown, Save } from 'lucide-react';

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
      <label className="font-bold text-sm text-black">{label}</label>
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
      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const SimSwitchingPage: React.FC = () => {
  const [simCard, setSimCard] = useState('External SIM card');

  return (
    <div className="w-full animate-fade-in py-2">
      <FormRow label="SIM card switching">
          <StyledSelect 
            value={simCard} 
            onChange={(e) => setSimCard(e.target.value)} 
            options={['External SIM card', 'Internal SIM card']} 
          />
      </FormRow>

      <div className="flex justify-end pt-12 mt-4">
        <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center">
            <Save size={18} className="me-2" />
            Save
        </button>
      </div>
    </div>
  );
};
