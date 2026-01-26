
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

const StyledInput = ({ suffix, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) => (
  <div className="relative w-full">
      <input 
        {...props}
        className={`w-full border border-gray-300 px-3 py-2.5 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white ${suffix ? 'pe-16' : ''}`}
      />
      {suffix && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gray-100 border-l border-gray-300 px-3 text-sm text-gray-500 rounded-r-[2px]">
              {suffix}
          </div>
      )}
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const LinkDetectionPage: React.FC = () => {
  const [enableSwitch, setEnableSwitch] = useState(true);
  const [method, setMethod] = useState('auto');
  const [server1, setServer1] = useState('8.8.8.8');
  const [server2, setServer2] = useState('114.114.114.114');
  const [server3, setServer3] = useState('www.qq.com');
  
  const [enableIpv4Dns, setEnableIpv4Dns] = useState(true);
  const [ipv4Dns1, setIpv4Dns1] = useState('223.5.5.5');
  const [ipv4Dns2, setIpv4Dns2] = useState('119.29.29.29');
  const [ipv4Dns3, setIpv4Dns3] = useState('180.76.76.76');

  const [enableIpv6Dns, setEnableIpv6Dns] = useState(true);
  const [ipv6Dns1, setIpv6Dns1] = useState('2001:dc7:1000::1');
  const [ipv6Dns2, setIpv6Dns2] = useState('2400:3200::1');
  const [ipv6Dns3, setIpv6Dns3] = useState('2001:4860:4860::8888');

  const [interval, setInterval] = useState('10');
  const [action, setAction] = useState('no_action');

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="space-y-1">
          
          <FormRow label="Link detection switch">
              <SquareSwitch isOn={enableSwitch} onChange={() => setEnableSwitch(!enableSwitch)} />
          </FormRow>

          <FormRow label="Link detection method">
              <StyledSelect 
                value={method} 
                onChange={(e) => setMethod(e.target.value)} 
                options={[{label: 'Auto', value: 'auto'}]} 
              />
          </FormRow>

          <FormRow label="Detection server IP1">
              <StyledInput value={server1} onChange={(e) => setServer1(e.target.value)} />
          </FormRow>
          <FormRow label="Detect server IP2">
              <StyledInput value={server2} onChange={(e) => setServer2(e.target.value)} />
          </FormRow>
          <FormRow label="Detect server IP3">
              <StyledInput value={server3} onChange={(e) => setServer3(e.target.value)} />
          </FormRow>

          <div className="py-4"></div>

          <FormRow label="Specify the IPv4 DNS service address">
              <SquareSwitch isOn={enableIpv4Dns} onChange={() => setEnableIpv4Dns(!enableIpv4Dns)} />
          </FormRow>

          <FormRow label="IPv4 DNS1">
              <StyledInput value={ipv4Dns1} onChange={(e) => setIpv4Dns1(e.target.value)} />
          </FormRow>
          <FormRow label="IPv4 DNS2">
              <StyledInput value={ipv4Dns2} onChange={(e) => setIpv4Dns2(e.target.value)} />
          </FormRow>
          <FormRow label="IPv4 DNS3">
              <StyledInput value={ipv4Dns3} onChange={(e) => setIpv4Dns3(e.target.value)} />
          </FormRow>

          <div className="py-4"></div>

          <FormRow label="Specify the IPv6 DNS service address">
              <SquareSwitch isOn={enableIpv6Dns} onChange={() => setEnableIpv6Dns(!enableIpv6Dns)} />
          </FormRow>

          <FormRow label="IPv6 DNS1">
              <StyledInput value={ipv6Dns1} onChange={(e) => setIpv6Dns1(e.target.value)} />
          </FormRow>
          <FormRow label="IPv6 DNS2">
              <StyledInput value={ipv6Dns2} onChange={(e) => setIpv6Dns2(e.target.value)} />
          </FormRow>
          <FormRow label="IPv6 DNS3">
              <StyledInput value={ipv6Dns3} onChange={(e) => setIpv6Dns3(e.target.value)} />
          </FormRow>

          <div className="py-4"></div>

          <FormRow label="Detection interval" required>
              <StyledInput value={interval} onChange={(e) => setInterval(e.target.value)} suffix="Second" />
          </FormRow>

          <FormRow label="Link detection response action">
              <StyledSelect 
                value={action} 
                onChange={(e) => setAction(e.target.value)} 
                options={[{label: 'No action', value: 'no_action'}]} 
              />
          </FormRow>

          <div className="flex justify-end pt-12 mt-4">
            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center">
                <Save size={18} className="me-2" />
                Save
            </button>
          </div>

      </div>
    </div>
  );
};
