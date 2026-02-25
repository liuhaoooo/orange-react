
import React, { useState } from 'react';
import { Save, ChevronDown, ChevronUp, Eye, EyeOff, Check } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';

// Helper Checkbox Component
const Checkbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <div className="flex items-center cursor-pointer select-none" onClick={() => onChange(!checked)}>
    <div className={`w-5 h-5 border rounded-[2px] flex items-center justify-center mr-2 transition-colors ${checked ? 'bg-black border-black' : 'bg-white border-gray-300'}`}>
      {checked && <Check size={16} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-sm font-bold text-black">{label}</span>
  </div>
);

// Helper Password Input Component
const PasswordInput = ({ value, onChange, placeholder, hasError }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; hasError?: boolean }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <StyledInput
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        hasError={hasError}
        style={{ paddingRight: '40px' }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

export const VpnPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);

  // Main Settings
  const [vpnEnabled, setVpnEnabled] = useState(true);
  const [natEnabled, setNatEnabled] = useState(true);
  const [defaultRouting, setDefaultRouting] = useState(true);
  const [vpnMode, setVpnMode] = useState('0'); // '0' = L2TP, '1' = PPTP
  
  // Common Fields
  const [serverAddress, setServerAddress] = useState('1.1.1.1');
  const [username, setUsername] = useState('test');
  const [password, setPassword] = useState('password');
  const [mtu, setMtu] = useState('1459');

  // L2TP Specific
  const [lnsSurvival, setLnsSurvival] = useState(true);
  const [ipsecEnabled, setIpsecEnabled] = useState(true);
  const [presharedKey, setPresharedKey] = useState('test');
  
  // Advanced Settings (L2TP)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [lacTunnelName, setLacTunnelName] = useState('');
  const [ipAddressObtained, setIpAddressObtained] = useState('');
  const [lacTunnelAuth, setLacTunnelAuth] = useState(false);
  const [lnsTunnelAuth, setLnsTunnelAuth] = useState(true);
  const [lnsTunnelName, setLnsTunnelName] = useState('');
  const [tunnelPassword, setTunnelPassword] = useState('');

  const vpnModeOptions = [
    { name: "L2TP", value: "0" },
    { name: "PPTP", value: "1" }
  ];

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      showAlert(t('settingsSaved'), 'success');
    }, 1000);
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <FormRow label="VPN switch">
        <SquareSwitch isOn={vpnEnabled} onChange={() => setVpnEnabled(!vpnEnabled)} />
      </FormRow>

      <FormRow label="NAT">
        <SquareSwitch isOn={natEnabled} onChange={() => setNatEnabled(!natEnabled)} />
      </FormRow>

      <FormRow label="Default routing">
        <SquareSwitch isOn={defaultRouting} onChange={() => setDefaultRouting(!defaultRouting)} />
      </FormRow>

      <FormRow label="VPN Mode">
        <StyledSelect
          value={vpnMode}
          onChange={(e) => setVpnMode(e.target.value)}
          options={vpnModeOptions.map(opt => ({ label: opt.name, value: opt.value }))}
        />
      </FormRow>

      <FormRow label="Server address" required>
        <StyledInput value={serverAddress} onChange={(e) => setServerAddress(e.target.value)} />
      </FormRow>

      <FormRow label="Username" required>
        <StyledInput value={username} onChange={(e) => setUsername(e.target.value)} />
      </FormRow>

      <FormRow label="Password" required>
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormRow>

      <FormRow label="MTU" required>
        <StyledInput value={mtu} onChange={(e) => setMtu(e.target.value)} />
      </FormRow>

      {vpnMode === '0' && (
        <>
          <FormRow label="LNS survival test">
            <Checkbox label="Enabled" checked={lnsSurvival} onChange={setLnsSurvival} />
          </FormRow>

          <FormRow label="IPsec">
            <Checkbox label="Enabled" checked={ipsecEnabled} onChange={setIpsecEnabled} />
          </FormRow>

          {ipsecEnabled && (
            <FormRow label="Pre-shared secret key" required>
              <StyledInput value={presharedKey} onChange={(e) => setPresharedKey(e.target.value)} />
            </FormRow>
          )}

          <div className="mt-6 border-t border-gray-100">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center justify-between w-full py-4 text-left focus:outline-none group"
            >
              <span className="font-bold text-gray-700 group-hover:text-black">Advanced Settings</span>
              {isAdvancedOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>

            {isAdvancedOpen && (
              <div className="animate-fade-in pb-4">
                <FormRow label="LAC tunnel name">
                  <StyledInput value={lacTunnelName} onChange={(e) => setLacTunnelName(e.target.value)} />
                </FormRow>

                <FormRow label="The IP address obtained">
                  <StyledInput value={ipAddressObtained} onChange={(e) => setIpAddressObtained(e.target.value)} />
                </FormRow>

                <FormRow label="LAC Tunnel Authentication">
                  <SquareSwitch isOn={lacTunnelAuth} onChange={() => setLacTunnelAuth(!lacTunnelAuth)} />
                </FormRow>

                <FormRow label="LNS Tunnel Authentication">
                  <SquareSwitch isOn={lnsTunnelAuth} onChange={() => setLnsTunnelAuth(!lnsTunnelAuth)} />
                </FormRow>

                <FormRow label="LNS tunnel name">
                  <StyledInput value={lnsTunnelName} onChange={(e) => setLnsTunnelName(e.target.value)} />
                </FormRow>

                <FormRow label="Tunnel Password">
                  <StyledInput value={tunnelPassword} onChange={(e) => setTunnelPassword(e.target.value)} />
                </FormRow>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end pt-8">
        <PrimaryButton
          onClick={handleSave}
          loading={saving}
          icon={<Save size={18} />}
        >
          Save
        </PrimaryButton>
      </div>
    </div>
  );
};
