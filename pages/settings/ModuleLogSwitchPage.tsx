import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, SquareSwitch, StyledSelect } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

const logModeOptions = [
    { name: "Simple mode", value: '1' },
    { name: "Full mode", value: '0' },
    { name: "Special debug mode", value: '2' },
];

const usbModeOptions = [
    { name: 'USB 2.0', value: '1' },
    { name: 'USB 3.0', value: '2' },
];

export const ModuleLogSwitchPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [modemLogSwitch, setModemLogSwitch] = useState(false);
  const [logMode, setLogMode] = useState('0');
  const [usbMode, setUsbMode] = useState('2');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest(236, 'GET');
        if (res && res.success) {
            setModemLogSwitch(res.modemLogSwitch === '1');
            if (res.logMode !== undefined) setLogMode(res.logMode);
            if (res.usb_mode !== undefined) setUsbMode(res.usb_mode);
        }
      } catch (error) {
        console.error("Failed to fetch module log switch settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
      setIsSaving(true);
      try {
          const payload = {
              cmd: 236,
              modemLogSwitch: modemLogSwitch ? '1' : '0',
              logMode: logMode,
              usb_mode: usbMode,
              method: 'POST'
          };
          const res = await apiRequest(236, 'POST', payload);
          if (res && res.success) {
              showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
          } else {
              showAlert(t('errorSaving') || 'Failed to save settings', 'error');
          }
      } catch (error) {
          showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) {
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
      <div className="space-y-0">
        
        <FormRow label="Module LOG Switch">
            <SquareSwitch 
                isOn={modemLogSwitch} 
                onChange={() => setModemLogSwitch(!modemLogSwitch)} 
            />
        </FormRow>

        {modemLogSwitch && (
            <>
                <FormRow label="Log mode">
                    <StyledSelect
                        value={logMode}
                        onChange={(e) => setLogMode(e.target.value)}
                        options={logModeOptions}
                    />
                </FormRow>

                <FormRow label="USB mode">
                    <StyledSelect
                        value={usbMode}
                        onChange={(e) => setUsbMode(e.target.value)}
                        options={usbModeOptions}
                    />
                </FormRow>
            </>
        )}

        <div className="flex justify-end pt-6">
          <PrimaryButton onClick={handleSave} loading={isSaving} disabled={isSaving} className="w-32">
            {t('save') || 'Save'}
          </PrimaryButton>
        </div>

      </div>
    </div>
  );
};
