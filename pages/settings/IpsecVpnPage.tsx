import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
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

const connectionModeOptions = [
  { name: 'Tunnel', value: 'tunnel' },
  { name: 'Transport', value: 'transport' },
];

const ikeVersionOptions = [
  { name: 'IKE V1', value: '1' },
  { name: 'IKE V2', value: '2' },
];

const encryptionOptions = [
  { name: 'des', value: 'des' },
  { name: '3des', value: '3des' },
  { name: 'aes-128', value: 'aes128' },
  { name: 'aes-192', value: 'aes192' },
  { name: 'aes-256', value: 'aes256' },
  { name: 'sm4cbc', value: 'sm4cbc' }
];

const authenticationOptions = [
  { name: 'md5', value: 'md5' },
  { name: 'sha1', value: 'sha1' },
  { name: 'sha256', value: 'sha256' },
  { name: 'sm3', value: 'sm3' }
];

const dhGroupOptions = [
  { name: 'Group1(768 Bit)', value: 'modp768' },
  { name: 'Group2(1024 Bit)', value: 'modp1024' },
  { name: 'Group5(1536 Bit)', value: 'modp1536' },
  { name: 'Group14(2048 Bit)', value: 'modp2048' },
];

const pfsKeyGroupOptions = [
  { name: 'Group1(768 Bit)', value: 'modp768' },
  { name: 'Group2(1024 Bit)', value: 'modp1024' },
  { name: 'Group5(1536 Bit)', value: 'modp1536' },
  { name: 'Group14(2048 Bit)', value: 'modp2048' },
  { name: 'None', value: 'none' },
];

export const IpsecVpnPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);

  const [ipsecSwitch, setIpsecSwitch] = useState(false);
  
  // IKE Policy Configuration
  const [ruleName, setRuleName] = useState('');
  const [connectionMode, setConnectionMode] = useState('tunnel');
  const [mtu, setMtu] = useState('1500');

  // Local parameter settings (Tunnel only)
  const [localGateway, setLocalGateway] = useState('');
  const [localSubnet, setLocalSubnet] = useState('');
  const [localSubnetMask, setLocalSubnetMask] = useState('');

  // Remote parameter settings
  const [peerGateway, setPeerGateway] = useState('');
  const [terminalNetwork, setTerminalNetwork] = useState(''); // Tunnel only
  const [remoteSubnetMask, setRemoteSubnetMask] = useState(''); // Tunnel only

  // IKE SA Parameters
  const [ikeVersion, setIkeVersion] = useState('1');
  const [ikeEncryption, setIkeEncryption] = useState('des');
  const [ikeAuthentication, setIkeAuthentication] = useState('md5');
  const [preSharedKey, setPreSharedKey] = useState('');
  const [dhGroup, setDhGroup] = useState('modp2048');
  const [ikeSaSurvivalCycle, setIkeSaSurvivalCycle] = useState('24');
  const [dpdEnabled, setDpdEnabled] = useState(true);
  const [dpdDelay, setDpdDelay] = useState('30');
  const [dpdTimeout, setDpdTimeout] = useState('120');

  // IPsec SA parameters
  const [ipsecSaSurvivalCycle, setIpsecSaSurvivalCycle] = useState('24');
  const [ipsecEncryption, setIpsecEncryption] = useState('des');
  const [ipsecIntegrity, setIpsecIntegrity] = useState('md5');
  const [pfsKeyGroup, setPfsKeyGroup] = useState('none');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIpsecData = async () => {
      try {
        const data = await apiRequest(281, 'GET');
        if (data && data.success) {
          setIpsecSwitch(data.ipsecSwitch === '1');
          setRuleName(data.ruleName || '');
          setConnectionMode(data.connectType || 'tunnel');
          setMtu(data.mtu || '1500');
          
          setLocalGateway(data.localIp || '');
          setLocalSubnet(data.localSubnetIp || '');
          setLocalSubnetMask(data.localMask || '');
          
          setPeerGateway(data.peerIp || '');
          setTerminalNetwork(data.peerSubnetIp || '');
          setRemoteSubnetMask(data.peerMask || '');
          
          setIkeVersion(data.ikeVersion || '1');
          setIkeEncryption(data.ikeEncrypt || 'des');
          setIkeAuthentication(data.ikeDic || 'md5');
          setPreSharedKey(data.preshare || '');
          setDhGroup(data.ikeGroup || 'modp2048');
          setIkeSaSurvivalCycle(data.ikeLifeTime || '24');
          
          setDpdEnabled(data.ikeDpdSwitch === '1');
          setDpdDelay(data.ikeDpddelay || '30');
          setDpdTimeout(data.ikeDpdtimeout || '120');
          
          setIpsecSaSurvivalCycle(data.lifeTime || '24');
          setIpsecEncryption(data.encrypt || 'des');
          setIpsecIntegrity(data.dic || 'md5');
          setPfsKeyGroup(data.group || 'none');
        }
      } catch (error) {
        console.error("Failed to fetch IPsec settings", error);
      }
    };
    fetchIpsecData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (ipsecSwitch) {
      if (!ruleName.trim()) {
        newErrors.ruleName = 'Rule name is required';
        isValid = false;
      }
      if (!mtu.trim()) {
        newErrors.mtu = 'MTU is required';
        isValid = false;
      }

      if (connectionMode === 'tunnel') {
        if (!localGateway.trim()) {
          newErrors.localGateway = 'Local gateway is required';
          isValid = false;
        }
        if (!localSubnet.trim()) {
          newErrors.localSubnet = 'Local subnet is required';
          isValid = false;
        }
        if (!localSubnetMask.trim()) {
          newErrors.localSubnetMask = 'Subnet Mask is required';
          isValid = false;
        }
        if (!terminalNetwork.trim()) {
          newErrors.terminalNetwork = 'Terminal network is required';
          isValid = false;
        }
        if (!remoteSubnetMask.trim()) {
          newErrors.remoteSubnetMask = 'Subnet Mask is required';
          isValid = false;
        }
      }

      if (!peerGateway.trim()) {
        newErrors.peerGateway = 'Peer gateway is required';
        isValid = false;
      }

      if (!ikeSaSurvivalCycle.trim()) {
        newErrors.ikeSaSurvivalCycle = 'SA Survival Cycle is required';
        isValid = false;
      }

      if (dpdEnabled) {
        if (!dpdDelay.trim()) {
          newErrors.dpdDelay = 'DPD delay is required';
          isValid = false;
        }
        if (!dpdTimeout.trim()) {
          newErrors.dpdTimeout = 'DPD timeout is required';
          isValid = false;
        }
      }

      if (!ipsecSaSurvivalCycle.trim()) {
        newErrors.ipsecSaSurvivalCycle = 'SA Survival Cycle is required';
        isValid = false;
      }
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
      let payload: any = {
        ipsecSwitch: ipsecSwitch ? '1' : '0',
      };

      if (ipsecSwitch) {
        payload = {
          ...payload,
          ruleName: ruleName,
          connectType: connectionMode,
          mtu: mtu,
          peerIp: peerGateway,
          ikeVersion: ikeVersion,
          preshare: preSharedKey,
          ikeGroup: dhGroup,
          ikeLifeTime: ikeSaSurvivalCycle,
          ikeDpdSwitch: dpdEnabled ? '1' : '0',
          lifeTime: ipsecSaSurvivalCycle,
          encrypt: ipsecEncryption,
          dic: ipsecIntegrity,
          group: pfsKeyGroup
        };

        if (dpdEnabled) {
          payload.ikeDpddelay = dpdDelay;
          payload.ikeDpdtimeout = dpdTimeout;
        }

        if (connectionMode === 'tunnel') {
          payload.localIp = localGateway;
          payload.localSubnetIp = localSubnet;
          payload.localMask = localSubnetMask;
          payload.peerSubnetIp = terminalNetwork;
          payload.peerMask = remoteSubnetMask;
        } else if (connectionMode === 'transport') {
          payload.ikeEncrypt = ikeEncryption;
          payload.ikeDic = ikeAuthentication;
        }
      }

      const data = await apiRequest(281, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save IPsec settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <FormRow label="IPsec switch">
        <SquareSwitch isOn={ipsecSwitch} onChange={() => setIpsecSwitch(!ipsecSwitch)} />
      </FormRow>

      {ipsecSwitch && (
        <div className="mt-6 space-y-6">
          {/* IKE Policy Configuration */}
          <div>
            <h3 className="text-sm font-bold text-black border-b border-gray-300 pb-2 mb-4">Add/Edit IKE Policy Configuration</h3>
            
            <FormRow label="Rule name" required error={errors.ruleName}>
              <StyledInput value={ruleName} onChange={(e) => { setRuleName(e.target.value); setErrors({ ...errors, ruleName: '' }); }} hasError={!!errors.ruleName} />
            </FormRow>

            <FormRow label="Connection mode">
              <StyledSelect
                value={connectionMode}
                onChange={(e) => setConnectionMode(e.target.value)}
                options={connectionModeOptions}
              />
            </FormRow>

            <FormRow label="MTU" required error={errors.mtu}>
              <StyledInput value={mtu} onChange={(e) => { setMtu(e.target.value); setErrors({ ...errors, mtu: '' }); }} hasError={!!errors.mtu} />
            </FormRow>
          </div>

          {/* Local parameter settings */}
          {connectionMode === 'tunnel' && (
            <div>
              <h3 className="text-sm font-bold text-black border-b border-gray-300 pb-2 mb-4">Local parameter settings</h3>
              
              <FormRow label="Local gateway" required error={errors.localGateway}>
                <StyledInput value={localGateway} onChange={(e) => { setLocalGateway(e.target.value); setErrors({ ...errors, localGateway: '' }); }} hasError={!!errors.localGateway} />
              </FormRow>

              <FormRow label="Local subnet" required error={errors.localSubnet}>
                <StyledInput value={localSubnet} onChange={(e) => { setLocalSubnet(e.target.value); setErrors({ ...errors, localSubnet: '' }); }} hasError={!!errors.localSubnet} />
              </FormRow>

              <FormRow label="Subnet Mask" required error={errors.localSubnetMask}>
                <StyledInput value={localSubnetMask} onChange={(e) => { setLocalSubnetMask(e.target.value); setErrors({ ...errors, localSubnetMask: '' }); }} hasError={!!errors.localSubnetMask} />
              </FormRow>
            </div>
          )}

          {/* Remote parameter settings */}
          <div>
            <h3 className="text-sm font-bold text-black border-b border-gray-300 pb-2 mb-4">Remote parameter settings</h3>
            
            <FormRow label="Peer gateway" required error={errors.peerGateway}>
              <StyledInput value={peerGateway} onChange={(e) => { setPeerGateway(e.target.value); setErrors({ ...errors, peerGateway: '' }); }} hasError={!!errors.peerGateway} />
            </FormRow>

            {connectionMode === 'tunnel' && (
              <>
                <FormRow label="Terminal network" required error={errors.terminalNetwork}>
                  <StyledInput value={terminalNetwork} onChange={(e) => { setTerminalNetwork(e.target.value); setErrors({ ...errors, terminalNetwork: '' }); }} hasError={!!errors.terminalNetwork} />
                </FormRow>

                <FormRow label="Subnet Mask" required error={errors.remoteSubnetMask}>
                  <StyledInput value={remoteSubnetMask} onChange={(e) => { setRemoteSubnetMask(e.target.value); setErrors({ ...errors, remoteSubnetMask: '' }); }} hasError={!!errors.remoteSubnetMask} />
                </FormRow>
              </>
            )}
          </div>

          {/* IKE SA Parameters */}
          <div>
            <h3 className="text-sm font-bold text-black border-b border-gray-300 pb-2 mb-4">IKE SA Parameters</h3>
            
            <FormRow label="IKE version">
              <StyledSelect
                value={ikeVersion}
                onChange={(e) => setIkeVersion(e.target.value)}
                options={ikeVersionOptions}
              />
            </FormRow>

            {connectionMode === 'transport' && (
              <>
                <FormRow label="Encryption algorithm">
                  <StyledSelect
                    value={ikeEncryption}
                    onChange={(e) => setIkeEncryption(e.target.value)}
                    options={encryptionOptions}
                  />
                </FormRow>

                <FormRow label="Authentication Algorithm">
                  <StyledSelect
                    value={ikeAuthentication}
                    onChange={(e) => setIkeAuthentication(e.target.value)}
                    options={authenticationOptions}
                  />
                </FormRow>
              </>
            )}

            <FormRow label="Pre-shared key">
              <StyledInput value={preSharedKey} onChange={(e) => setPreSharedKey(e.target.value)} />
            </FormRow>

            <FormRow label="Diffie-Hellman(DH) Group">
              <StyledSelect
                value={dhGroup}
                onChange={(e) => setDhGroup(e.target.value)}
                options={dhGroupOptions}
              />
            </FormRow>

            <FormRow label="SA Survival Cycle" required error={errors.ikeSaSurvivalCycle}>
              <StyledInput value={ikeSaSurvivalCycle} onChange={(e) => { setIkeSaSurvivalCycle(e.target.value); setErrors({ ...errors, ikeSaSurvivalCycle: '' }); }} hasError={!!errors.ikeSaSurvivalCycle} suffix="Hour" />
            </FormRow>

            <FormRow label="Failed peer detection">
              <Checkbox label="Enabled" checked={dpdEnabled} onChange={setDpdEnabled} />
            </FormRow>

            <FormRow label="DPD delay" required error={errors.dpdDelay}>
              <StyledInput value={dpdDelay} onChange={(e) => { setDpdDelay(e.target.value); setErrors({ ...errors, dpdDelay: '' }); }} hasError={!!errors.dpdDelay} suffix="Second" disabled={!dpdEnabled} />
            </FormRow>

            <FormRow label="DPD timeout" required error={errors.dpdTimeout}>
              <StyledInput value={dpdTimeout} onChange={(e) => { setDpdTimeout(e.target.value); setErrors({ ...errors, dpdTimeout: '' }); }} hasError={!!errors.dpdTimeout} suffix="Second" disabled={!dpdEnabled} />
            </FormRow>
          </div>

          {/* IPsec SA parameters */}
          <div>
            <h3 className="text-sm font-bold text-black border-b border-gray-300 pb-2 mb-4">IPsec SA parameters</h3>
            
            <FormRow label="SA Survival Cycle" required error={errors.ipsecSaSurvivalCycle}>
              <StyledInput value={ipsecSaSurvivalCycle} onChange={(e) => { setIpsecSaSurvivalCycle(e.target.value); setErrors({ ...errors, ipsecSaSurvivalCycle: '' }); }} hasError={!!errors.ipsecSaSurvivalCycle} suffix="Hour" />
            </FormRow>

            <FormRow label="Encryption algorithm">
              <StyledSelect
                value={ipsecEncryption}
                onChange={(e) => setIpsecEncryption(e.target.value)}
                options={encryptionOptions}
              />
            </FormRow>

            <FormRow label="Integrity algorithm">
              <StyledSelect
                value={ipsecIntegrity}
                onChange={(e) => setIpsecIntegrity(e.target.value)}
                options={authenticationOptions}
              />
            </FormRow>

            <FormRow label="PFS Key Group">
              <StyledSelect
                value={pfsKeyGroup}
                onChange={(e) => setPfsKeyGroup(e.target.value)}
                options={pfsKeyGroupOptions}
              />
            </FormRow>
          </div>
        </div>
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
