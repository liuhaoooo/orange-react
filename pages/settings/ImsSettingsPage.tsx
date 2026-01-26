
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// Custom Switch to match the screenshot (Black active state)
const ImsSwitch = ({ isOn, onChange }: { isOn: boolean; onChange: () => void }) => (
  <div 
    className="flex border border-black w-14 h-7 cursor-pointer select-none"
    onClick={onChange}
  >
    <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-black text-white' : 'bg-white'}`}>
      {isOn && <Check size={16} strokeWidth={3} />}
    </div>
    <div className={`flex-1 flex items-center justify-center transition-colors bg-white`}>
      {/* Right side is empty/white based on design */}
    </div>
  </div>
);

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
      <label className="font-bold text-sm text-black">{label}</label>
    </div>
    <div className="w-full sm:w-2/3 flex sm:justify-end items-center">
      {children}
    </div>
  </div>
);

export const ImsSettingsPage: React.FC = () => {
  const [imsEnabled, setImsEnabled] = useState(true);
  const [imsApn, setImsApn] = useState('ims');
  const [pdpType, setPdpType] = useState('IPV4&V6');

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="max-w-4xl">
          {/* IMS On/Off */}
          <FormRow label="IMS On/Off">
              <ImsSwitch isOn={imsEnabled} onChange={() => setImsEnabled(!imsEnabled)} />
          </FormRow>

          {/* IMS Register Status */}
          <FormRow label="IMS Register Status">
              {/* Using w-full to allow text to align appropriately if needed, mostly left aligned in standard forms but screenshot shows right aligned relative to label area in some contexts, here standard left align usually looks better or flex-grow */}
              <div className="w-full flex justify-end sm:justify-start">
                <span className="text-black text-sm font-medium">The system is initializing</span>
              </div>
          </FormRow>

          {/* IMS Input */}
          <FormRow label="IMS">
              <input 
                type="text" 
                value={imsApn}
                onChange={(e) => setImsApn(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-gray-400 transition-all rounded-[2px] bg-white"
              />
          </FormRow>

          {/* IMS PDP Type */}
          <FormRow label="IMS PDP Type">
              <div className="relative w-full">
                <select 
                  value={pdpType} 
                  onChange={(e) => setPdpType(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-gray-400 transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                >
                  <option value="IPV4">IPV4</option>
                  <option value="IPV6">IPV6</option>
                  <option value="IPV4&V6">IPV4&V6</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronDown size={16} />
                </div>
              </div>
          </FormRow>

          {/* Save Button */}
          <div className="flex justify-end pt-12 mt-2">
            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide min-w-[100px]">
                Save
            </button>
          </div>
      </div>
    </div>
  );
};
