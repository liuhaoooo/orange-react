
import React, { useState } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';

const FormRow = ({ label, children, required = false, alignTop = false }: { label: string; children: React.ReactNode; required?: boolean, alignTop?: boolean }) => (
  <div className={`flex flex-col sm:flex-row ${alignTop ? 'items-start' : 'sm:items-center'} py-4 border-b border-gray-100 last:border-0`}>
    <div className={`w-full sm:w-1/3 mb-2 sm:mb-0 ${alignTop ? 'pt-2' : ''}`}>
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
    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white placeholder-gray-400 h-10"
  />
);

const StyledTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white min-h-[120px] resize-y font-sans"
  />
);

export const UsageSettingsPage: React.FC<{ type: 'national' | 'international' }> = ({ type }) => {
  const [totalData, setTotalData] = useState('3');
  const [unit, setUnit] = useState('GB');
  const [threshold, setThreshold] = useState('100');
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
      setSaving(true);
      setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="max-w-4xl">
        {/* Read Only Stats */}
        <FormRow label="Data usage">
            <div className="w-full">
                <span className="text-black text-sm font-bold">3.48 GB</span>
            </div>
        </FormRow>

        <FormRow label="Remaining Data">
            <div className="w-full">
                <span className="text-black text-sm font-bold">0.00 MB</span>
            </div>
        </FormRow>

        {/* Total Data Input */}
        <FormRow label="Total Data" required>
            <div className="flex w-full">
                <div className="flex-1">
                    <input 
                        type="text"
                        value={totalData} 
                        onChange={(e) => setTotalData(e.target.value)} 
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-l-[2px] bg-white border-r-0 h-10"
                    />
                </div>
                <div className="w-24 relative">
                    <select 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-r-[2px] appearance-none bg-[#f3f4f6] cursor-pointer font-bold h-10"
                    >
                        <option value="MB">MB</option>
                        <option value="GB">GB</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
            </div>
        </FormRow>

        {/* Threshold */}
        <FormRow label="When reached" required>
            <div className="flex items-center">
                <div className="w-32 me-3">
                    <StyledInput value={threshold} onChange={(e) => setThreshold(e.target.value)} />
                </div>
                <span className="text-black text-sm font-medium whitespace-nowrap">% to remind me</span>
            </div>
        </FormRow>

        {/* Alert Switch */}
        <FormRow label="Data alert message push">
            <div className="flex justify-start">
                <SquareSwitch isOn={alertEnabled} onChange={() => setAlertEnabled(!alertEnabled)} />
            </div>
        </FormRow>

        {/* Mobile Number */}
        <FormRow label="Mobile Number" required>
            <StyledInput value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
        </FormRow>

        {/* Message Content */}
        <FormRow label="Message Content" required alignTop>
            <StyledTextarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
        </FormRow>

        {/* Footer */}
        <div className="flex justify-end pt-8 mt-4 pb-6 border-t border-transparent">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center"
            >
                {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Save size={18} className="me-2" />}
                Save
            </button>
        </div>
      </div>
    </div>
  );
};
