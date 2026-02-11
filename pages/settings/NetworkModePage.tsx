
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { fetchNetworkMode, setNetworkMode } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, StyledSelect, PrimaryButton } from '../../components/UIComponents';

const NETWORK_MODES = [
    { name: '2G Only', value: '1'},
    { name: '3G Only', value: '2'},
    { name: '3G/2G', value: '3'},
    { name: '4G Only', value: '4'},
    { name: '4G TDD Only', value: '40'},
    { name: '4G FDD Only', value: '20'},
    { name: '4G/3G', value: '6'},
    { name: '4G/3G/2G', value: '7'},
    { name: '5G NSA Only', value: 'C'},
    { name: '5G SA Only', value: '10' },
    { name: '5G (SA+NSA)/4G', value: '1C' },
    { name: '5G NSA/4G/3G', value: 'E'},
    { name: '5G NSA/4G/3G/2G', value: 'F' },
    { name: '5G SA+NSA/4G/3G', value: '1E'},
    { name: '5G SA+NSA/4G/3G/2G', value: '1F'},
];

export const NetworkModePage: React.FC = () => {
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
      const loadData = async () => {
          try {
              const res = await fetchNetworkMode();
              if (res && res.success) {
                  setMode(res.networkMode);
              }
          } catch (e) {
              console.error("Failed to fetch network mode", e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, []);

  const handleSave = async () => {
      setSaving(true);
      try {
          const res = await setNetworkMode(mode);
          if (res && res.success) {
              showAlert('Settings saved successfully.', 'success');
          } else {
              showAlert('Failed to save settings.', 'error');
          }
      } catch (e) {
          console.error("Failed to set network mode", e);
          showAlert('An error occurred.', 'error');
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
    <div className="w-full animate-fade-in py-2">
      <div className="max-w-4xl">
        <FormRow label="Network Mode">
            <StyledSelect
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                options={NETWORK_MODES.map(opt => ({ label: opt.name, value: opt.value }))}
            />
        </FormRow>

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
