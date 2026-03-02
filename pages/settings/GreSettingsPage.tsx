import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

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

const isValidUrlOrIp = (value: string) => {
  if (!value) return false;
  if (isValidIp(value)) return true;
  // Basic URL format validation
  const urlRegex = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
  return urlRegex.test(value);
};

export const GreSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);

  const [greSwitch, setGreSwitch] = useState(false);
  const [greDefaultGW, setGreDefaultGW] = useState(false);
  const [greNatSwitch, setGreNatSwitch] = useState(false);
  const [tunnel, setTunnel] = useState('');
  const [url, setUrl] = useState('');
  const [peerIpValue, setPeerIpValue] = useState('');
  const [greIpValue, setGreIpValue] = useState('');
  const [greStatus, setGreStatus] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchGreData = async () => {
      try {
        const data = await apiRequest(260, 'GET');
        if (data && data.success) {
          setGreSwitch(data.greSwitch === '1');
          setGreDefaultGW(data.greDefaultGW === '1');
          setGreNatSwitch(data.greNatSwitch === '1');
          setTunnel(data.tunnel || '');
          setUrl(data.url || '');
          setPeerIpValue(data.peerIpValue || '');
          setGreIpValue(data.greIpValue || '');
          setGreStatus(data.greStatus || '');
        }
      } catch (error) {
        console.error("Failed to fetch GRE settings", error);
      }
    };
    fetchGreData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!url.trim()) {
      newErrors.url = 'GRE Server Address cannot be empty.';
      isValid = false;
    } else if (!isValidUrlOrIp(url.trim())) {
      newErrors.url = 'Invalid IP Address or URL.';
      isValid = false;
    }

    if (!peerIpValue.trim()) {
      newErrors.peerIpValue = 'Peer IP cannot be empty.';
      isValid = false;
    } else if (!isValidIp(peerIpValue.trim())) {
      newErrors.peerIpValue = 'Invalid IP Address.';
      isValid = false;
    }

    if (!greIpValue.trim()) {
      newErrors.greIpValue = 'Local IP cannot be empty.';
      isValid = false;
    } else if (!isValidIp(greIpValue.trim())) {
      newErrors.greIpValue = 'Invalid IP Address.';
      isValid = false;
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
        greSwitch: greSwitch ? '1' : '0',
      };

      if (greSwitch) {
        payload = {
          ...payload,
          url: url,
          tunnel: tunnel,
          peerIpValue: peerIpValue,
          greIpValue: greIpValue,
          greNatSwitch: greNatSwitch ? '1' : '0',
          greDefaultGW: greDefaultGW ? '1' : '0'
        };
      }

      const data = await apiRequest(260, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save GRE settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <FormRow label="GRE On/Off">
        <SquareSwitch isOn={greSwitch} onChange={() => setGreSwitch(!greSwitch)} />
      </FormRow>

      {greSwitch && (
        <div className="mt-6 space-y-6 animate-fade-in">
          <FormRow label="Default Gateway Switch">
            <SquareSwitch isOn={greDefaultGW} onChange={() => setGreDefaultGW(!greDefaultGW)} />
          </FormRow>

          <FormRow label="NAT">
            <SquareSwitch isOn={greNatSwitch} onChange={() => setGreNatSwitch(!greNatSwitch)} />
          </FormRow>

          <FormRow label="Tunnel Name">
            <StyledInput value={tunnel} readOnly disabled />
          </FormRow>

          <FormRow label="GRE Server Address" required error={errors.url}>
            <StyledInput value={url} onChange={(e) => { setUrl(e.target.value); setErrors({ ...errors, url: '' }); }} hasError={!!errors.url} />
          </FormRow>

          <FormRow label="Peer IP" required error={errors.peerIpValue}>
            <StyledInput value={peerIpValue} onChange={(e) => { setPeerIpValue(e.target.value); setErrors({ ...errors, peerIpValue: '' }); }} hasError={!!errors.peerIpValue} />
          </FormRow>

          <FormRow label="Local IP" required error={errors.greIpValue}>
            <StyledInput value={greIpValue} onChange={(e) => { setGreIpValue(e.target.value); setErrors({ ...errors, greIpValue: '' }); }} hasError={!!errors.greIpValue} />
          </FormRow>

          <FormRow label="GRE connection status">
            <span className={`text-sm font-medium ${!greStatus ? 'text-red-500' : 'text-gray-900'}`}>
              {!greStatus ? 'Disconnected' : 'Connected'}
            </span>
          </FormRow>
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
