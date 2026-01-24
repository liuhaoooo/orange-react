
import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, Plus, Edit2, Trash2, Save } from 'lucide-react';

// Reusable Form Components for consistent style across Settings
const SectionRow = ({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-orange me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white placeholder-gray-400"
  />
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-black px-3 py-2.5 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer font-medium"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-black">
        <ChevronDown size={16} strokeWidth={3} />
    </div>
  </div>
);

const RadioGroup = ({ options, value, onChange }: { options: { label: string; value: any }[], value: any, onChange: (val: any) => void }) => (
  <div className="flex items-center space-x-8">
    {options.map((opt) => (
      <label key={opt.label} className="flex items-center cursor-pointer select-none group">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center me-2 transition-colors ${value === opt.value ? 'border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
        </div>
        <span className={`text-sm font-bold ${value === opt.value ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'}`}>{opt.label}</span>
        <input 
            type="radio" 
            className="hidden" 
            checked={value === opt.value} 
            onChange={() => onChange(opt.value)} 
        />
      </label>
    ))}
  </div>
);

export const ApnSettingsPage: React.FC = () => {
  const [natEnabled, setNatEnabled] = useState(true);
  const [apnMode, setApnMode] = useState<'auto' | 'manual'>('auto');
  const [mtu, setMtu] = useState('1500');
  const [profile, setProfile] = useState('Orange IPv6');

  return (
    <div className="w-full max-w-4xl animate-fade-in">
      {/* Warning Banner */}
      <div className="bg-orange/10 border-l-4 border-orange p-4 mb-8 flex items-start">
         <AlertTriangle className="text-orange w-5 h-5 me-3 shrink-0 mt-0.5" />
         <span className="font-bold text-sm text-black">The NAT switch is only effective for IPv4 networks.</span>
      </div>

      {/* Settings Form */}
      <div className="space-y-2">
        
        {/* NAT */}
        <SectionRow label="NAT">
            <RadioGroup 
                value={natEnabled} 
                onChange={setNatEnabled}
                options={[
                    { label: 'Enabled', value: true },
                    { label: 'Disabled', value: false }
                ]}
            />
        </SectionRow>

        {/* APN Mode */}
        <SectionRow label="APN Mode">
            <RadioGroup 
                value={apnMode} 
                onChange={setApnMode}
                options={[
                    { label: 'Auto', value: 'auto' },
                    { label: 'Manual', value: 'manual' }
                ]}
            />
        </SectionRow>

        {/* MTU */}
        <SectionRow label="MTU" required>
            <StyledInput 
                value={mtu} 
                onChange={(e) => setMtu(e.target.value)} 
            />
        </SectionRow>

        {/* Profile Name */}
        <SectionRow label="Profile Name">
            <StyledSelect 
                value={profile} 
                onChange={(e) => setProfile(e.target.value)} 
                options={['Orange IPv6', 'Orange IPv4']}
            />
        </SectionRow>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 pb-8 border-b border-gray-200">
            <button className="flex items-center justify-center bg-[#f2f2f2] text-gray-400 font-bold text-sm py-2.5 px-6 rounded-[2px] cursor-not-allowed shadow-sm border border-transparent">
                <Plus size={16} className="me-2" />
                Add APN
            </button>
            <button className="flex items-center justify-center bg-[#f2f2f2] text-gray-400 font-bold text-sm py-2.5 px-6 rounded-[2px] cursor-not-allowed shadow-sm border border-transparent">
                <Edit2 size={16} className="me-2" />
                Edit APN
            </button>
            <button className="flex items-center justify-center bg-[#f2f2f2] text-gray-400 font-bold text-sm py-2.5 px-6 rounded-[2px] cursor-not-allowed shadow-sm border border-transparent">
                <Trash2 size={16} className="me-2" />
                Delete APN
            </button>
        </div>

        {/* Read-only Info Display */}
        <div className="pt-8 space-y-1">
            <div className="flex justify-between items-center py-3 border-b border-gray-100 border-dashed">
                <span className="font-bold text-gray-600 text-sm">PDP Type</span>
                <span className="text-black text-sm font-bold">IPv6</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 border-dashed">
                <span className="font-bold text-gray-600 text-sm">APN</span>
                <span className="text-black text-sm font-bold">orange</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100 border-dashed">
                <span className="font-bold text-gray-600 text-sm">Authentication</span>
                <span className="text-black text-sm uppercase font-bold">NONE</span>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-12">
            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-3 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center">
                <Save size={18} className="me-2" />
                Save
            </button>
        </div>

      </div>
    </div>
  );
};
