import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchDmzSettings, saveDmzSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, StyledInput, SquareSwitch } from '../../components/UIComponents';

export const DmzPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [enabled, setEnabled] = useState(false);
  const [ip, setIp] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchDmzSettings();
        if (res && (res.success || res.cmd === 172)) {
          setEnabled(res.enabled === '1');
          setIp(res.ip || '');
        }
      } catch (e) {
        console.error("Failed to load DMZ settings", e);
        showAlert('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showAlert]);

  const validateIp = (ipAddress: string) => {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ipAddress);
  };

  const handleSave = async () => {
    if (enabled) {
      if (!ip.trim()) {
        setError('IP Address is required');
        return;
      }
      if (!validateIp(ip.trim())) {
        setError('Invalid IP Address format');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await saveDmzSettings(enabled ? '1' : '0', enabled ? ip.trim() : '');
      if (res && (res.success || res.cmd === 172)) {
        showAlert('Settings saved successfully', 'success');
      } else {
        showAlert('Failed to save settings', 'error');
      }
    } catch (e) {
      console.error(e);
      showAlert('An error occurred', 'error');
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
    <div className="w-full animate-fade-in py-6">
      <div className="max-w-3xl">
        <FormRow label="DMZ Switch">
          <SquareSwitch 
            isOn={enabled} 
            onChange={() => {
              setEnabled(!enabled);
              setError('');
            }} 
          />
        </FormRow>

        {enabled && (
          <FormRow label="IP" required={true} error={error}>
            <StyledInput
              type="text"
              value={ip}
              onChange={(e) => {
                setIp(e.target.value);
                setError('');
              }}
              hasError={!!error}
            />
          </FormRow>
        )}

        <div className="flex justify-end mt-12">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
