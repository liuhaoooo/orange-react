
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { fetchSimCardType, setSimCardType } from '../../utils/services/simService';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, StyledSelect, PrimaryButton } from '../../components/UIComponents';

export const SimSwitchingPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [simCardType, setSimCardTypeState] = useState('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const OPTIONS = [
    { name: 'External SIM card', value: '0' },
    { name: 'Built-in SIM card', value: '1' },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchSimCardType();
        if (res && (res.success || res.success === undefined)) {
          if (res.current_card_type) {
            setSimCardTypeState(res.current_card_type);
          }
        }
      } catch (e) {
        console.error("Failed to fetch SIM card type", e);
        showAlert('Failed to load settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [showAlert]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await setSimCardType(simCardType);
      if (res && (res.success || res.message === 'success' || res.result === 'success')) {
        showAlert('Settings saved successfully.', 'success');
      } else {
        showAlert('Failed to save settings.', 'error');
      }
    } catch (e) {
      console.error("Failed to set SIM card type", e);
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
        <FormRow label="SIM card switching">
            <StyledSelect 
                value={simCardType} 
                onChange={(e) => setSimCardTypeState(e.target.value)} 
                options={OPTIONS} 
            />
        </FormRow>

        <div className="flex justify-end pt-12 mt-4">
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
