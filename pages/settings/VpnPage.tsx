
import React, { useState, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp, Eye, EyeOff, Check } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

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
  const [vpnEnabled, setVpnEnabled] = useState(false);
  const [natEnabled, setNatEnabled] = useState(true);
  const [defaultRouting, setDefaultRouting] = useState(true);
  const [vpnMode, setVpnMode] = useState('1'); // '0' = L2TP, '1' = PPTP
  
  // Common Fields
  const [serverAddress, setServerAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mtu, setMtu] = useState('588');

  // L2TP Specific
  const [lnsSurvival, setLnsSurvival] = useState(true);
  const [ipsecEnabled, setIpsecEnabled] = useState(false);
  const [presharedKey, setPresharedKey] = useState('');
  
  // Advanced Settings (L2TP)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [lacTunnelName, setLacTunnelName] = useState('');
  const [ipAddressObtained, setIpAddressObtained] = useState('');
  const [lacTunnelAuth, setLacTunnelAuth] = useState(false);
  const [lacTunnelPassword, setLacTunnelPassword] = useState('');
  const [lnsTunnelAuth, setLnsTunnelAuth] = useState(false);
  const [lnsTunnelName, setLnsTunnelName] = useState('');
  const [lnsTunnelPassword, setLnsTunnelPassword] = useState('');

  const vpnModeOptions = [
    { name: "L2TP", value: "0" },
    { name: "PPTP", value: "1" }
  ];

  useEffect(() => {
    const fetchVpnData = async () => {
      try {
        const data = await apiRequest(272, 'GET');
        if (data && data.success) {
          setVpnEnabled(data.vpn_switch === '1');
          setNatEnabled(data.vpn_nat === '1');
          setDefaultRouting(data.vpn_defualt === '1');
          setVpnMode(data.vpn_mode || '0');
          setServerAddress(data.vpn_url || '');
          setUsername(data.username || '');
          setPassword(data.passwd || '');
          setMtu(data.vpn_mtu || '');
          
          setLnsSurvival(data.lnsCheckup === '1');
          setIpsecEnabled(data.IPSec === '1');
          setPresharedKey(data.presharedKey || '');
          
          setLacTunnelName(data.lac_tunnel_name || '');
          setIpAddressObtained(data.lac_local_ip || '');
          setLacTunnelAuth(data.lac_auth_enable === '1');
          setLacTunnelPassword(data.lac_challenge_pass || '');
          
          setLnsTunnelAuth(data.lns_auth_enable === '1');
          setLnsTunnelName(data.lns_tunnel_name || '');
          setLnsTunnelPassword(data.lns_challenge_pass || '');
        }
      } catch (error) {
        console.error("Failed to fetch VPN settings", error);
      }
    };
    fetchVpnData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        subcmd: '0',
        vpn_switch: vpnEnabled ? '1' : '0',
        vpn_nat: natEnabled ? '1' : '0',
        vpn_defualt: defaultRouting ? '1' : '0',
        vpn_mode: vpnMode,
        vpn_url: serverAddress,
        username: username,
        passwd: password,
        vpn_mtu: mtu,
        lnsCheckup: lnsSurvival ? '1' : '0',
        IPSec: ipsecEnabled ? '1' : '0',
        presharedKey: presharedKey,
        lac_tunnel_name: lacTunnelName,
        lac_local_ip: ipAddressObtained,
        lac_auth_enable: lacTunnelAuth ? '1' : '0',
        lac_challenge_pass: lacTunnelPassword,
        lns_auth_enable: lnsTunnelAuth ? '1' : '0',
        lns_tunnel_name: lnsTunnelName,
        lns_challenge_pass: lnsTunnelPassword,
        client_ip_range: '',
        client_ip_netmask: ''
      };

      const data = await apiRequest(272, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save VPN settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
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

                {lacTunnelAuth && (
                  <FormRow label="Tunnel Password">
                    <PasswordInput value={lacTunnelPassword} onChange={(e) => setLacTunnelPassword(e.target.value)} />
                  </FormRow>
                )}

                <FormRow label="LNS Tunnel Authentication">
                  <SquareSwitch isOn={lnsTunnelAuth} onChange={() => setLnsTunnelAuth(!lnsTunnelAuth)} />
                </FormRow>

                {lnsTunnelAuth && (
                  <>
                    <FormRow label="LNS tunnel name">
                      <StyledInput value={lnsTunnelName} onChange={(e) => setLnsTunnelName(e.target.value)} />
                    </FormRow>
                    <FormRow label="Tunnel Password">
                      <PasswordInput value={lnsTunnelPassword} onChange={(e) => setLnsTunnelPassword(e.target.value)} />
                    </FormRow>
                  </>
                )}
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
