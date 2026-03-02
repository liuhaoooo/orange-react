import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

const modeOptions = [
  { label: 'Standard Mode', value: '0' },
  { label: 'Compatibility Mode', value: '1' },
];

export const IpPassthroughPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);

  const [ipPassSwitch, setIpPassSwitch] = useState(false);
  const [mode, setMode] = useState('0');
  const [mac, setMac] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIpPassthroughData = async () => {
      try {
        const data = await apiRequest(251, 'GET');
        if (data && data.success) {
          setIpPassSwitch(data.ipPassSwitch === '1');
          setMode(data.mode || '0');
          setMac(data.mac || '');
        }
      } catch (error) {
        console.error("Failed to fetch IP Passthrough settings", error);
      }
    };
    fetchIpPassthroughData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (ipPassSwitch && mode === '0') {
      if (!mac.trim()) {
        newErrors.mac = 'MAC Address is required';
        isValid = false;
      } else {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(mac)) {
          newErrors.mac = 'Invalid MAC Address format';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const executeSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ipPassSwitch: ipPassSwitch ? '1' : '0',
        mode: mode,
        mac: mac
      };

      const data = await apiRequest(251, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save IP Passthrough settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (ipPassSwitch) {
      if (window.confirm('After turning on IP Passthrough, the following functions: DMZ, port forwarding, remote network, access control will be invalid. Are you sure you want to turn on?')) {
        executeSave();
      }
    } else {
      executeSave();
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <FormRow label="Enabled">
        <SquareSwitch isOn={ipPassSwitch} onChange={() => setIpPassSwitch(!ipPassSwitch)} />
      </FormRow>

      {ipPassSwitch && (
        <>
          <FormRow label="Mode">
            <StyledSelect
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={modeOptions}
            />
          </FormRow>

          {mode === '0' && (
            <FormRow label="MAC Address" required error={errors.mac}>
              <StyledInput 
                value={mac} 
                onChange={(e) => { setMac(e.target.value); setErrors({ ...errors, mac: '' }); }} 
                hasError={!!errors.mac} 
                placeholder="e.g., AA:AA:AA:AA:AA:AA"
              />
            </FormRow>
          )}
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
