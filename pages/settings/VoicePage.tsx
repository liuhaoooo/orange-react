import React, { useState, useEffect } from 'react';
import { FormRow, SquareSwitch, StyledInput, PrimaryButton, PasswordInput, StyledSelect } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { useGlobalState } from '../../utils/GlobalStateContext';

import { apiRequest } from '../../utils/services/core';

export const VoicePage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const { globalData } = useGlobalState();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [voiceBasicSettings, setVoiceBasicSettings] = useState('0');
  const [originalData, setOriginalData] = useState<any>({});
  
  // VOLTE states
  const [volteOnOff, setVolteOnOff] = useState('0');
  const [volteRegister, setVolteRegister] = useState('Registered');
  const [ims, setIms] = useState('ims');
  const [imsPdpType, setImsPdpType] = useState('IPV4V6');

  // VoIP states
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
  const [alternateSipDomain, setAlternateSipDomain] = useState('');
  const [alternateSipDomainPort, setAlternateSipDomainPort] = useState('');
  const [alternateSipProxyServerAddress, setAlternateSipProxyServerAddress] = useState('');
  const [alternateSipProxyServerPort, setAlternateSipProxyServerPort] = useState('');
  const [authName, setAuthName] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [regAccount, setRegAccount] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    const fetchVoiceData = async () => {
      try {
        const data = await apiRequest(295, 'GET');
        if (data && data.success) {
          setOriginalData(data);
          setVoiceBasicSettings(data.voiceType || '0');
          setVolteOnOff(data.volteSw || '0');
          setVolteRegister(data.volteRegStatus || '');
          setIms(data.ims || '');
          setImsPdpType(data.pdpType || 'IPV4V6');
          
          setVoipOnOff(data.voipSw || '0');
          setVoipRegisterStatus(data.voipRegStatus || '');
          setRegServerAddress(data.regAddress || '');
          setRegServerPort(data.regPort || '5060');
          setSipDomain(data.regDomain || '');
          setSipDomainPort(data.domainPort || '5060');
          setSipProxyEnable(data.proxySw || '0');
          setSipProxyAddress(data.proxyAddress || '');
          setSipProxyPort(data.proxyPort || '5060');
          setAlternateSipServerEnable(data.altServerSw || '0');
          setAlternateRegServerAddress(data.altRegAddress || '');
          setAlternateRegServerPort(data.altRegPort || '');
          setAlternateSipDomain(data.altRegDomain || '');
          setAlternateSipDomainPort(data.altDomainPort || '');
          setAlternateSipProxyServerAddress(data.altProxyAddress || '');
          setAlternateSipProxyServerPort(data.altProxyPort || '');
          setAuthName(data.authName || '');
          setPhoneName(data.phoneName || '');
          setRegAccount(data.regAccount || '');
          setRegPassword(data.regPassword || '');
        }
      } catch (error) {
        console.error("Failed to fetch Voice settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVoiceData();
  }, []);

  const plmn = globalData.statusInfo?.PLMN || '';
  const isVolteMode = plmn === '60400';

  const voiceBasicOptions = isVolteMode 
    ? [
        { name: 'VOLTE', value: '0' },
        { name: 'VoIP', value: '1' }
      ]
    : [
        { name: 'CSFB', value: '0' },
        { name: 'VoIP', value: '1' }
      ];

  const imsPdpTypeOptions = [
    { name: 'IPV4', value: 'IP' },
    { name: 'IPV6', value: 'IPV6' },
    { name: 'IPV4&V6', value: 'IPV4V6' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      let payload: any = {
        cmd: 295,
        voiceType: voiceBasicSettings,
        voiceAutoSw: originalData.voiceAutoSw || '0',
      };

      if (voiceBasicSettings === '1') {
        // VoIP
        payload = {
          ...payload,
          voipSw: voipOnOff,
          authName,
          phoneName,
          regAccount,
          regPassword,
          regAddress: regServerAddress,
          regPort: regServerPort,
          regDomain: sipDomain,
          domainPort: sipDomainPort,
          proxySw: sipProxyEnable,
          proxyAddress: sipProxyAddress,
          proxyPort: sipProxyPort,
          altProxyAddress: alternateSipProxyServerAddress,
          altProxyPort: alternateSipProxyServerPort,
          altServerSw: alternateSipServerEnable,
          altRegAddress: alternateRegServerAddress,
          altRegPort: alternateRegServerPort,
          altRegDomain: alternateSipDomain,
          altDomainPort: alternateSipDomainPort,
          volteSw: volteOnOff,
        };
      } else {
        // CSFB or VOLTE
        payload = {
          ...payload,
          volteSw: volteOnOff,
          pdpType: isVolteMode ? imsPdpType : 'IPV4V6',
          ims,
        };
      }

      const data = await apiRequest(295, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save Voice settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl animate-fade-in py-2">
        <div className="bg-white border border-gray-200 rounded-[6px] p-8 text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <FormRow label="Voice Basic Settings">
        <StyledSelect
          value={voiceBasicSettings}
          onChange={(e) => setVoiceBasicSettings(e.target.value)}
          options={voiceBasicOptions}
        />
      </FormRow>

      {voiceBasicSettings === '0' && isVolteMode && (
        <>
          <FormRow label="VoLTE On/Off">
            <SquareSwitch isOn={volteOnOff === '1'} onChange={() => setVolteOnOff(volteOnOff === '1' ? '0' : '1')} />
          </FormRow>

          {volteOnOff === '1' && (
            <>
              <FormRow label="VoLTE Register">
                <div className="text-sm font-medium text-gray-900">{volteRegister}</div>
              </FormRow>

              <FormRow label="IMS">
                <StyledInput 
                  value={ims} 
                  onChange={(e) => setIms(e.target.value)} 
                />
              </FormRow>

              <FormRow label="IMS PDP Type">
                <StyledSelect
                  value={imsPdpType}
                  onChange={(e) => setImsPdpType(e.target.value)}
                  options={imsPdpTypeOptions}
                />
              </FormRow>
            </>
          )}
        </>
      )}

      {voiceBasicSettings === '1' && (
        <>
          <FormRow label="VoIP On/Off">
            <SquareSwitch isOn={voipOnOff === '1'} onChange={() => setVoipOnOff(voipOnOff === '1' ? '0' : '1')} />
          </FormRow>

          {voipOnOff === '1' && (
            <>
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

              {sipProxyEnable === '1' && (
                <>
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
                </>
              )}

              <FormRow label="Alternate Sip Server Enable">
                <SquareSwitch isOn={alternateSipServerEnable === '1'} onChange={() => setAlternateSipServerEnable(alternateSipServerEnable === '1' ? '0' : '1')} />
              </FormRow>

              {alternateSipServerEnable === '1' && (
                <>
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

                  <FormRow label="Alternate SIP Domain">
                    <StyledInput 
                      value={alternateSipDomain} 
                      onChange={(e) => setAlternateSipDomain(e.target.value)} 
                    />
                  </FormRow>

                  <FormRow label="Alternate SIP Domain Port">
                    <StyledInput 
                      value={alternateSipDomainPort} 
                      onChange={(e) => setAlternateSipDomainPort(e.target.value)} 
                    />
                  </FormRow>

                  <FormRow label="Alternate SIP Proxy Server Address">
                    <StyledInput 
                      value={alternateSipProxyServerAddress} 
                      onChange={(e) => setAlternateSipProxyServerAddress(e.target.value)} 
                    />
                  </FormRow>

                  <FormRow label="Alternate SIP Proxy Server Port">
                    <StyledInput 
                      value={alternateSipProxyServerPort} 
                      onChange={(e) => setAlternateSipProxyServerPort(e.target.value)} 
                    />
                  </FormRow>
                </>
              )}

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
            </>
          )}
        </>
      )}

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
