import React, { useState, useEffect } from 'react';
import { FormRow, SquareSwitch, StyledInput, PrimaryButton, PasswordInput } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

export const FotaUpgradePage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fotaSwitch, setFotaSwitch] = useState('0');
  const [serverRule, setServerRule] = useState('');
  const [url, setUrl] = useState('');
  const [backupUrl, setBackupUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [idleTime, setIdleTime] = useState('');
  const [checkTime, setCheckTime] = useState('');

  useEffect(() => {
    const fetchFotaData = async () => {
      try {
        const data = await apiRequest(480, 'GET');
        if (data && data.success) {
          setFotaSwitch(data.fotaSwitch || '0');
          setServerRule(data.serverRule || '');
          setUrl(data.url || '');
          setBackupUrl(data.backupUrl || '');
          setUsername(data.username || '');
          setPassword(data.password || '');
          setIdleTime(data.idleTime || '');
          setCheckTime(data.checkTime || '');
        }
      } catch (error) {
        console.error("Failed to fetch FOTA settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFotaData();
  }, []);

  const handleSave = async () => {
    if (fotaSwitch === '1' && !url) {
      showAlert(t('serverAddressRequired') || 'Server address is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cmd: 480,
        fotaSwitch,
        serverRule,
        url,
        backupUrl,
        username,
        password,
        checkTime,
        idleTime
      };

      const data = await apiRequest(480, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save FOTA settings", error);
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
      <FormRow label="Enable FOTA">
        <SquareSwitch isOn={fotaSwitch === '1'} onChange={() => setFotaSwitch(fotaSwitch === '1' ? '0' : '1')} />
      </FormRow>

      {fotaSwitch === '1' && (
        <>
          <FormRow label="Platform Rules">
            <StyledInput 
              value={serverRule} 
              onChange={(e) => setServerRule(e.target.value)} 
            />
          </FormRow>

          <FormRow label={
            <div className="flex items-center">
              <span className="text-red-500 mr-1">*</span>
              Server address
            </div>
          }>
            <StyledInput 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
            />
          </FormRow>

          <FormRow label="Alternate server address">
            <StyledInput 
              value={backupUrl} 
              onChange={(e) => setBackupUrl(e.target.value)} 
            />
          </FormRow>

          <FormRow label="Username">
            <StyledInput 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
          </FormRow>

          <FormRow label="Password">
            <PasswordInput 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </FormRow>

          <FormRow label="Idle time">
            <StyledInput 
              value={idleTime} 
              onChange={(e) => setIdleTime(e.target.value)} 
            />
          </FormRow>

          <FormRow label="Cycle time">
            <StyledInput 
              value={checkTime} 
              onChange={(e) => setCheckTime(e.target.value)} 
            />
          </FormRow>
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
