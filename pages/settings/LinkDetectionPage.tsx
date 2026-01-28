
import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchLinkDetectionSettings, saveLinkDetectionSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const FormRow = ({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
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

const SwitchRow = ({ label, isOn, onChange }: { label: string, isOn: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <label className="font-bold text-sm text-black">{label}</label>
      <SquareSwitch isOn={isOn} onChange={onChange} />
  </div>
);

const StyledInput = ({ suffix, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) => (
  <div className="relative w-full">
      <input 
        {...props}
        className={`w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white ${suffix ? 'pe-16' : ''}`}
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
      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const LinkDetectionPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Variables
  const [enableSwitch, setEnableSwitch] = useState(false);
  const [method, setMethod] = useState('F');
  const [server1, setServer1] = useState('');
  const [server2, setServer2] = useState('');
  const [server3, setServer3] = useState('');
  
  const [enableIpv4Dns, setEnableIpv4Dns] = useState(false);
  const [ipv4Dns1, setIpv4Dns1] = useState('');
  const [ipv4Dns2, setIpv4Dns2] = useState('');
  const [ipv4Dns3, setIpv4Dns3] = useState('');

  const [enableIpv6Dns, setEnableIpv6Dns] = useState(false);
  const [ipv6Dns1, setIpv6Dns1] = useState('');
  const [ipv6Dns2, setIpv6Dns2] = useState('');
  const [ipv6Dns3, setIpv6Dns3] = useState('');

  const [interval, setInterval] = useState('');
  const [action, setAction] = useState('0');
  const [restartTime, setRestartTime] = useState('');

  // Dropdown Options
  const methodOptions = [
    { label: 'DNS', value: '3' },
    { label: 'NTP', value: '2' },
    { label: 'PING', value: '0' },
    { label: 'Auto', value: 'F' },
  ];

  const actionOptions = [
    { label: "No action", value: '0' },
    { label: "Restart the whole machine", value: '1' },
  ];

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetchLinkDetectionSettings();
            if (res && res.success) {
                setEnableSwitch(res.wanLinkDetectSwitch === '1');
                setMethod(res.checkWanLinkDetectMode || 'F');
                setServer1(res.wanLinkDetectIP1 || '');
                setServer2(res.wanLinkDetectIP2 || '');
                setServer3(res.wanLinkDetectIP3 || '');
                
                setEnableIpv4Dns(res.dnsv4_server_sw === '1');
                setIpv4Dns1(res.dnsv4_server1 || '');
                setIpv4Dns2(res.dnsv4_server2 || '');
                setIpv4Dns3(res.dnsv4_server3 || '');

                setEnableIpv6Dns(res.dnsv6_server_sw === '1');
                setIpv6Dns1(res.dnsv6_server1 || '');
                setIpv6Dns2(res.dnsv6_server2 || '');
                setIpv6Dns3(res.dnsv6_server3 || '');

                setInterval(res.wanLinkDetectCheckTime || '');
                setAction(res.LinkDetectAction || '0');
                setRestartTime(res.reboot_wait_time || '');
            }
        } catch (e) {
            console.error("Failed to fetch link detection settings", e);
            showAlert("Failed to load settings.", "error");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [showAlert]);

  const handleSave = async () => {
      setSaving(true);
      const payload = {
          wanLinkDetectSwitch: enableSwitch ? '1' : '0',
          checkWanLinkDetectMode: method,
          wanLinkDetectIP1: server1,
          wanLinkDetectIP2: server2,
          wanLinkDetectIP3: server3,
          wanLinkDetectCheckTime: interval,
          LinkDetectAction: action,
          reboot_wait_time: restartTime,
          dnsv4_server_sw: enableIpv4Dns ? '1' : '0',
          dnsv4_server1: ipv4Dns1,
          dnsv4_server2: ipv4Dns2,
          dnsv4_server3: ipv4Dns3,
          dnsv6_server_sw: enableIpv6Dns ? '1' : '0',
          dnsv6_server1: ipv6Dns1,
          dnsv6_server2: ipv6Dns2,
          dnsv6_server3: ipv6Dns3,
      };

      try {
          const res = await saveLinkDetectionSettings(payload);
          if (res && res.success) {
              showAlert("Settings saved successfully.", "success");
          } else {
              showAlert("Failed to save settings.", "error");
          }
      } catch (e) {
          console.error("Failed to save link detection settings", e);
          showAlert("An error occurred.", "error");
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="space-y-0.5">
          
          <SwitchRow 
            label="Link detection switch" 
            isOn={enableSwitch} 
            onChange={() => setEnableSwitch(!enableSwitch)} 
          />

          <FormRow label="Link detection method">
              <StyledSelect 
                value={method} 
                onChange={(e) => setMethod(e.target.value)} 
                options={methodOptions} 
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

          {/* Compact Divider */}
          <div className="border-b border-gray-100 my-2"></div>

          <SwitchRow 
            label="Specify the IPv4 DNS service address" 
            isOn={enableIpv4Dns} 
            onChange={() => setEnableIpv4Dns(!enableIpv4Dns)} 
          />

          <FormRow label="IPv4 DNS1">
              <StyledInput value={ipv4Dns1} onChange={(e) => setIpv4Dns1(e.target.value)} />
          </FormRow>
          <FormRow label="IPv4 DNS2">
              <StyledInput value={ipv4Dns2} onChange={(e) => setIpv4Dns2(e.target.value)} />
          </FormRow>
          <FormRow label="IPv4 DNS3">
              <StyledInput value={ipv4Dns3} onChange={(e) => setIpv4Dns3(e.target.value)} />
          </FormRow>

          {/* Compact Divider */}
          <div className="border-b border-gray-100 my-2"></div>

          <SwitchRow 
            label="Specify the IPv6 DNS service address" 
            isOn={enableIpv6Dns} 
            onChange={() => setEnableIpv6Dns(!enableIpv6Dns)} 
          />

          <FormRow label="IPv6 DNS1">
              <StyledInput value={ipv6Dns1} onChange={(e) => setIpv6Dns1(e.target.value)} />
          </FormRow>
          <FormRow label="IPv6 DNS2">
              <StyledInput value={ipv6Dns2} onChange={(e) => setIpv6Dns2(e.target.value)} />
          </FormRow>
          <FormRow label="IPv6 DNS3">
              <StyledInput value={ipv6Dns3} onChange={(e) => setIpv6Dns3(e.target.value)} />
          </FormRow>

          {/* Compact Divider */}
          <div className="border-b border-gray-100 my-2"></div>

          <FormRow label="Detection interval" required>
              <StyledInput value={interval} onChange={(e) => setInterval(e.target.value)} suffix="Second" />
          </FormRow>

          <FormRow label="Link detection response action">
              <StyledSelect 
                value={action} 
                onChange={(e) => setAction(e.target.value)} 
                options={actionOptions} 
              />
          </FormRow>

          <FormRow label="Restart time" required>
              <StyledInput value={restartTime} onChange={(e) => setRestartTime(e.target.value)} suffix="Second" />
          </FormRow>

          <div className="flex justify-end pt-8 mt-4">
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
