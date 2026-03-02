
import React, { useState, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, StyledSelect, PrimaryButton, PasswordInput } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';
import { useGlobalState } from '../../utils/GlobalStateContext';

const isValidIp = (ip: string) => {
  if (!ip) return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    return !isNaN(num) && num >= 0 && num <= 255;
  });
};

export const VpnPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { globalData } = useGlobalState();
  const [saving, setSaving] = useState(false);

  // Status Fields
  const [vpnStatus, setVpnStatus] = useState('');
  const [vpnLocalIp, setVpnLocalIp] = useState('');
  const [vpnPeerIp, setVpnPeerIp] = useState('');
  const [vpnIpsecStatus, setVpnIpsecStatus] = useState('');

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const vpnModeOptions = [
    { name: "L2TP", value: "0" },
    { name: "PPTP", value: "1" }
  ];

  useEffect(() => {
    if (globalData.statusInfo) {
      setVpnStatus(globalData.statusInfo.vpn_status || '');
      setVpnLocalIp(globalData.statusInfo.vpn_local_ip || '');
      setVpnPeerIp(globalData.statusInfo.vpn_peer_ip || '');
      setVpnIpsecStatus(globalData.statusInfo.vpn_ipsec_status || '');
    }
  }, [globalData.statusInfo]);

  useEffect(() => {
    const fetchVpnData = async () => {
      try {
        const settingsData = await apiRequest(272, 'GET');

        if (settingsData && settingsData.success) {
          setVpnEnabled(settingsData.vpn_switch === '1');
          setNatEnabled(settingsData.vpn_nat === '1');
          setDefaultRouting(settingsData.vpn_defualt === '1');
          setVpnMode(settingsData.vpn_mode || '0');
          setServerAddress(settingsData.vpn_url || '');
          setUsername(settingsData.username || '');
          setPassword(settingsData.passwd || '');
          setMtu(settingsData.vpn_mtu || '');
          
          setLnsSurvival(settingsData.lnsCheckup === '1');
          setIpsecEnabled(settingsData.IPSec === '1');
          setPresharedKey(settingsData.presharedKey || '');
          
          setLacTunnelName(settingsData.lac_tunnel_name || '');
          setIpAddressObtained(settingsData.lac_local_ip || '');
          setLacTunnelAuth(settingsData.lac_auth_enable === '1');
          setLacTunnelPassword(settingsData.lac_challenge_pass || '');
          
          setLnsTunnelAuth(settingsData.lns_auth_enable === '1');
          setLnsTunnelName(settingsData.lns_tunnel_name || '');
          setLnsTunnelPassword(settingsData.lns_challenge_pass || '');
        }
      } catch (error) {
        console.error("Failed to fetch VPN settings", error);
      }
    };
    fetchVpnData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!serverAddress.trim()) {
      newErrors.serverAddress = 'Server address can not be empty.';
      isValid = false;
    } else if (!isValidIp(serverAddress.trim())) {
      newErrors.serverAddress = 'Invalid IP Address.';
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = 'Username can not be empty.';
      isValid = false;
    }

    if (!password.trim()) {
      newErrors.password = 'Password can not be empty.';
      isValid = false;
    }

    const mtuNum = parseInt(mtu.trim(), 10);
    if (isNaN(mtuNum) || mtuNum < 576 || mtuNum > 1460 || !/^\d+$/.test(mtu.trim())) {
      newErrors.mtu = 'MTU must be between 576 and 1460.';
      isValid = false;
    }

    if (vpnMode === '0' && ipsecEnabled && !presharedKey.trim()) {
      newErrors.presharedKey = 'Pre-shared secret key can not be empty.';
      isValid = false;
    }

    let openAdvanced = false;

    if (vpnMode === '0' && lacTunnelAuth && !lacTunnelPassword.trim()) {
      newErrors.lacTunnelPassword = 'Tunnel Password can not be empty.';
      isValid = false;
      openAdvanced = true;
    }

    if (vpnMode === '0' && lnsTunnelAuth && !lnsTunnelPassword.trim()) {
      newErrors.lnsTunnelPassword = 'Tunnel Password can not be empty.';
      isValid = false;
      openAdvanced = true;
    }

    if (openAdvanced) {
      setIsAdvancedOpen(true);
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

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
      <div className="mb-6 space-y-4">
        <FormRow label="VPN connection status">
          <span className="text-sm font-medium text-gray-900">
            {vpnStatus === '1' ? 'Connected' : 'Disconnected'}
          </span>
        </FormRow>

        <FormRow label="VPN Local IP">
          <span className="text-sm font-medium text-gray-900">
            {vpnLocalIp && vpnLocalIp !== '0' ? vpnLocalIp : 'No IP was obtained'}
          </span>
        </FormRow>

        <FormRow label="VPN peer IP">
          <span className="text-sm font-medium text-gray-900">
            {vpnPeerIp && vpnPeerIp !== '0' ? vpnPeerIp : 'No IP was obtained'}
          </span>
        </FormRow>

        <FormRow label="IPsec connection status">
          <span className="text-sm font-medium text-gray-900">
            {vpnEnabled && vpnIpsecStatus && vpnIpsecStatus !== '0' ? 'Connected' : 'Disconnected'}
          </span>
        </FormRow>
      </div>

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

      <FormRow label="Server address" required error={errors.serverAddress}>
        <StyledInput value={serverAddress} onChange={(e) => { setServerAddress(e.target.value); setErrors({ ...errors, serverAddress: '' }); }} hasError={!!errors.serverAddress} />
      </FormRow>

      <FormRow label="Username" required error={errors.username}>
        <StyledInput value={username} onChange={(e) => { setUsername(e.target.value); setErrors({ ...errors, username: '' }); }} hasError={!!errors.username} />
      </FormRow>

      <FormRow label="Password" required error={errors.password}>
        <PasswordInput value={password} onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }} hasError={!!errors.password} />
      </FormRow>

      <FormRow label="MTU" required error={errors.mtu}>
        <StyledInput value={mtu} onChange={(e) => { setMtu(e.target.value); setErrors({ ...errors, mtu: '' }); }} hasError={!!errors.mtu} />
      </FormRow>

      {vpnMode === '0' && (
        <>
          <FormRow label="LNS survival test">
            <SquareSwitch isOn={lnsSurvival} onChange={() => setLnsSurvival(!lnsSurvival)} />
          </FormRow>

          <FormRow label="IPsec">
            <SquareSwitch isOn={ipsecEnabled} onChange={() => setIpsecEnabled(!ipsecEnabled)} />
          </FormRow>

          {ipsecEnabled && (
            <FormRow label="Pre-shared secret key" required error={errors.presharedKey}>
              <StyledInput value={presharedKey} onChange={(e) => { setPresharedKey(e.target.value); setErrors({ ...errors, presharedKey: '' }); }} hasError={!!errors.presharedKey} />
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
                  <FormRow label="Tunnel Password" required error={errors.lacTunnelPassword}>
                    <PasswordInput value={lacTunnelPassword} onChange={(e) => { setLacTunnelPassword(e.target.value); setErrors({ ...errors, lacTunnelPassword: '' }); }} hasError={!!errors.lacTunnelPassword} />
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
                    <FormRow label="Tunnel Password" required error={errors.lnsTunnelPassword}>
                      <PasswordInput value={lnsTunnelPassword} onChange={(e) => { setLnsTunnelPassword(e.target.value); setErrors({ ...errors, lnsTunnelPassword: '' }); }} hasError={!!errors.lnsTunnelPassword} />
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
