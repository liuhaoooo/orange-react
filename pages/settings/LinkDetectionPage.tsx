
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { SquareSwitch, FormRow, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';
import { fetchLinkDetectionSettings, saveLinkDetectionSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

export const LinkDetectionPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const load = async () => {
        try {
            const res = await fetchLinkDetectionSettings();
            if (res && (res.success || res.success === undefined)) {
                setSettings(res);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    load();
  }, []);

  const handleChange = (key: string, value: any) => {
      setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          const res = await saveLinkDetectionSettings(settings);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully.', 'success');
          } else {
              showAlert('Failed to save settings.', 'error');
          }
      } catch(e) {
          console.error(e);
          showAlert('An error occurred.', 'error');
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-orange" size={40} /></div>;

  return (
    <div className="w-full animate-fade-in py-2">
        <div className="max-w-4xl">
            <FormRow label="Link Detection Switch">
                <SquareSwitch isOn={settings.wanLinkDetectSwitch === '1'} onChange={() => handleChange('wanLinkDetectSwitch', settings.wanLinkDetectSwitch === '1' ? '0' : '1')} />
            </FormRow>

            {settings.wanLinkDetectSwitch === '1' && (
                <>
                    <FormRow label="Detection Mode">
                        <StyledSelect 
                            value={settings.checkWanLinkDetectMode || '0'} 
                            onChange={(e) => handleChange('checkWanLinkDetectMode', e.target.value)} 
                            options={[
                                { label: 'Ping', value: '0' },
                                { label: 'DNS', value: '1' }
                            ]}
                        />
                    </FormRow>
                    <FormRow label="Detection IP 1">
                        <StyledInput value={settings.wanLinkDetectIP1 || ''} onChange={(e) => handleChange('wanLinkDetectIP1', e.target.value)} />
                    </FormRow>
                    <FormRow label="Detection IP 2">
                        <StyledInput value={settings.wanLinkDetectIP2 || ''} onChange={(e) => handleChange('wanLinkDetectIP2', e.target.value)} />
                    </FormRow>
                    <FormRow label="Detection IP 3">
                        <StyledInput value={settings.wanLinkDetectIP3 || ''} onChange={(e) => handleChange('wanLinkDetectIP3', e.target.value)} />
                    </FormRow>
                    <FormRow label="Check Time">
                        <StyledInput value={settings.wanLinkDetectCheckTime || ''} onChange={(e) => handleChange('wanLinkDetectCheckTime', e.target.value)} suffix="s" />
                    </FormRow>
                    <FormRow label="Action">
                        <StyledSelect 
                            value={settings.LinkDetectAction || '0'} 
                            onChange={(e) => handleChange('LinkDetectAction', e.target.value)} 
                            options={[
                                { label: 'Reboot', value: '0' },
                                { label: 'Reconnect', value: '1' }
                            ]}
                        />
                    </FormRow>
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
    </div>
  );
};
