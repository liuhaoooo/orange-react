import React, { useState, useEffect } from 'react';
import { FormRow, SquareSwitch, PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

export const SipAlgPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [sipSwich, setSipSwich] = useState('0');
  const [originalData, setOriginalData] = useState<any>({});

  useEffect(() => {
    const fetchSipAlgData = async () => {
      try {
        const data = await apiRequest(426, 'GET');
        if (data && data.success) {
          setSipSwich(data.sipSwich || '0');
          setOriginalData(data);
        }
      } catch (error) {
        console.error("Failed to fetch Sip Alg settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSipAlgData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        sipSwich,
        sipRedirectSwitch: originalData.sipRedirectSwitch || '0',
        sipPort: originalData.sipPort || '5060',
        sipStartPort: originalData.sipStartPort || '15060',
        sipEndPort: originalData.sipEndPort || '15070',
        sipAlgMode: originalData.sipAlgMode || '0'
      };

      const data = await apiRequest(426, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save Sip Alg settings", error);
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
      <FormRow label="Enabled">
        <SquareSwitch isOn={sipSwich === '1'} onChange={() => setSipSwich(sipSwich === '1' ? '0' : '1')} />
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
