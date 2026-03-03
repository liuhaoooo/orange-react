import React, { useState } from 'react';
import { FormRow, SquareSwitch, StyledInput, PrimaryButton, PasswordInput, StyledSelect } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';

export const VoicePage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);

  const [voiceBasicSettings, setVoiceBasicSettings] = useState('VoIP');
  const [voipOnOff, setVoipOnOff] = useState('0');
  const [voipRegisterStatus, setVoipRegisterStatus] = useState('Unknown error!');
  const [regServerAddress, setRegServerAddress] = useState('');
  const [regServerPort, setRegServerPort] = useState('5060');
  const [sipDomain, setSipDomain] = useState('');
  const [sipDomainPort, setSipDomainPort] = useState('5060');
  const [sipProxyEnable, setSipProxyEnable] = useState('0');
  const [sipProxyAddress, setSipProxyAddress] = useState('');
  const [sipProxyPort, setSipProxyPort] = useState('5060');
  const [alternateSipServerEnable, setAlternateSipServerEnable] = useState('0');
  const [alternateRegServerAddress, setAlternateRegServerAddress] = useState('');
  const [alternateRegServerPort, setAlternateRegServerPort] = useState('');
  const [alternateSipProxyServerPort, setAlternateSipProxyServerPort] = useState('');
  const [authName, setAuthName] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [regAccount, setRegAccount] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock save action
      await new Promise(resolve => setTimeout(resolve, 1000));
      showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
    } catch (error) {
      console.error("Failed to save Voice settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <FormRow label="Voice Basic Settings">
        <StyledSelect
          value={voiceBasicSettings}
          onChange={(e) => setVoiceBasicSettings(e.target.value)}
          options={[{ value: 'VoIP', label: 'VoIP' }]}
        />
      </FormRow>

      <FormRow label="VoIP On/Off">
        <SquareSwitch isOn={voipOnOff === '1'} onChange={() => setVoipOnOff(voipOnOff === '1' ? '0' : '1')} />
      </FormRow>

      <FormRow label="VoIP Register Status">
        <div className="text-sm font-medium text-gray-900">{voipRegisterStatus}</div>
      </FormRow>

      <FormRow label="Reg Server Address">
        <StyledInput 
          value={regServerAddress} 
          onChange={(e) => setRegServerAddress(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Reg Server Port">
        <StyledInput 
          value={regServerPort} 
          onChange={(e) => setRegServerPort(e.target.value)} 
        />
      </FormRow>

      <FormRow label="SIP Domain">
        <StyledInput 
          value={sipDomain} 
          onChange={(e) => setSipDomain(e.target.value)} 
        />
      </FormRow>

      <FormRow label="SIP Domain Port">
        <StyledInput 
          value={sipDomainPort} 
          onChange={(e) => setSipDomainPort(e.target.value)} 
        />
      </FormRow>

      <FormRow label="SIP Proxy Enable">
        <SquareSwitch isOn={sipProxyEnable === '1'} onChange={() => setSipProxyEnable(sipProxyEnable === '1' ? '0' : '1')} />
      </FormRow>

      <FormRow label="SIP Proxy Address">
        <StyledInput 
          value={sipProxyAddress} 
          onChange={(e) => setSipProxyAddress(e.target.value)} 
        />
      </FormRow>

      <FormRow label="SIP Proxy Port">
        <StyledInput 
          value={sipProxyPort} 
          onChange={(e) => setSipProxyPort(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Alternate Sip Server Enable">
        <SquareSwitch isOn={alternateSipServerEnable === '1'} onChange={() => setAlternateSipServerEnable(alternateSipServerEnable === '1' ? '0' : '1')} />
      </FormRow>

      <FormRow label="Alternate Reg Server Address">
        <StyledInput 
          value={alternateRegServerAddress} 
          onChange={(e) => setAlternateRegServerAddress(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Alternate Reg Server Port">
        <StyledInput 
          value={alternateRegServerPort} 
          onChange={(e) => setAlternateRegServerPort(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Alternate SIP Proxy Server Port">
        <StyledInput 
          value={alternateSipProxyServerPort} 
          onChange={(e) => setAlternateSipProxyServerPort(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Auth Name">
        <StyledInput 
          value={authName} 
          onChange={(e) => setAuthName(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Phone Name">
        <StyledInput 
          value={phoneName} 
          onChange={(e) => setPhoneName(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Reg Account">
        <StyledInput 
          value={regAccount} 
          onChange={(e) => setRegAccount(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Reg Password">
        <PasswordInput 
          value={regPassword} 
          onChange={(e) => setRegPassword(e.target.value)} 
        />
      </FormRow>

      <div className="flex justify-end pt-8">
        <PrimaryButton
          onClick={handleSave}
          loading={saving}
        >
          {t('save') || 'Save'}
        </PrimaryButton>
      </div>
    </div>
  );
};
