import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, SquareSwitch, StyledInput } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

export const ClatPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [clatMode, setClatMode] = useState(false);
  const [clatPrefix, setClatPrefix] = useState('');
  const [prefixError, setPrefixError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest(1055, 'GET');
        if (res && res.success) {
            setClatMode(res.clatMode === '1');
            if (res.clatPrefix !== undefined) setClatPrefix(res.clatPrefix);
        }
      } catch (error) {
        console.error("Failed to fetch CLAT settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateIPv6Prefix = (prefix: string) => {
      if (!prefix) return true; // Can be empty
      
      // Basic IPv6 validation with optional subnet mask
      const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))(\/\d{1,3})?$/;
      
      return ipv6Regex.test(prefix);
  };

  const handleSave = async () => {
      setPrefixError('');
      
      if (clatMode && clatPrefix && !validateIPv6Prefix(clatPrefix)) {
          setPrefixError(t('invalidIpv6') || 'Invalid IPv6 address');
          return;
      }

      setIsSaving(true);
      try {
          const payload = {
              cmd: 1055,
              clatMode: clatMode ? '1' : '0',
              clatPrefix: clatPrefix,
              method: 'POST'
          };
          const res = await apiRequest(1055, 'POST', payload);
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
        
        <FormRow label="Enable CLAT">
            <SquareSwitch 
                isOn={clatMode} 
                onChange={() => setClatMode(!clatMode)} 
            />
        </FormRow>

        {clatMode && (
            <FormRow label="CLAT Prefix" error={prefixError}>
                <StyledInput 
                    value={clatPrefix}
                    onChange={(e) => {
                        setClatPrefix(e.target.value);
                        setPrefixError('');
                    }}
                    placeholder="64:ff9b::/96"
                />
            </FormRow>
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
