import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, SquareSwitch } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { AlertCircle } from 'lucide-react';

export const WebSettingPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [enableHttp, setEnableHttp] = useState(false); // true for "3", false for "2"
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const fetchWebSetting = async () => {
      try {
        const res = await apiRequest(1022, 'GET');
        if (res && res.success) {
            setEnableHttp(res.web_protocol_type === '3');
        }
      } catch (error) {
        console.error("Failed to fetch web setting", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebSetting();
  }, []);

  const handleSave = () => {
      setIsConfirmOpen(true);
  };

  const processSave = async () => {
      setIsConfirmOpen(false);
      setIsSaving(true);
      try {
          const payload = {
              cmd: 1022,
              web_protocol_type: enableHttp ? '3' : '2',
              method: 'POST'
          };
          const res = await apiRequest(1022, 'POST', payload);
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
        
        {/* Warning Message */}
        <div className="flex items-start gap-3 p-4 mb-6 bg-[#fdf8f3] text-[#8b6b3d] rounded-[4px]">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 fill-[#8b6b3d] text-[#fdf8f3]" />
            <p className="text-sm leading-relaxed">
                For the Web management UI, When HTTP is enabled, both http and https can be accessed. When HTTP is disabled, only https can be accessed
            </p>
        </div>

        <FormRow label="Enable HTTP">
            <SquareSwitch 
                isOn={enableHttp} 
                onChange={() => setEnableHttp(!enableHttp)} 
            />
        </FormRow>

        <div className="flex justify-end pt-6">
          <PrimaryButton onClick={handleSave} loading={isSaving} disabled={isSaving} className="w-32">
            {t('save') || 'Save'}
          </PrimaryButton>
        </div>

      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={processSave}
        title="Confirm"
        message="You may need to log in again after saving. Please confirm whether to save the changes?"
      />
    </div>
  );
};
