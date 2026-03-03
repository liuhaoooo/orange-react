import React, { useState } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, StyledInput, StyledSelect } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

export const ChangeUsernamePage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [resetLogin, setResetLogin] = useState('3'); // Default to Normal User
  const [newUsername, setNewUsername] = useState('');
  const [confirmUsername, setConfirmUsername] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const handleSubmit = async () => {
    setUsernameError('');
    setConfirmError('');

    let hasError = false;

    if (!newUsername) {
        setUsernameError(t('emptyError') || 'Cannot be empty');
        hasError = true;
    }
    if (newUsername && newUsername !== confirmUsername) {
        setConfirmError(t('usernamesDoNotMatch') || 'Usernames do not match.');
        hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
        const payload = {
            cmd: 98,
            setUsername: newUsername,
            subcmd: 2,
            tz_account: resetLogin,
            method: 'POST'
        };

        const res = await apiRequest(98, 'POST', payload);
        
        if (res.message === 'success') {
            showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
            setNewUsername('');
            setConfirmUsername('');
        } else if (res.message === '-1') {
            showAlert('The user name already exists.', 'error');
        } else {
            showAlert(t('errorSaving') || 'Failed to save settings', 'error');
        }
    } catch (e) {
        showAlert('An error occurred.', 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="space-y-0">
        
        <FormRow label="Reset Login">
            <StyledSelect
                value={resetLogin}
                onChange={(e) => setResetLogin(e.target.value)}
                options={[
                    { value: '2', label: 'Administrator User' },
                    { value: '3', label: 'Normal User' }
                ]}
            />
        </FormRow>

        <FormRow label="Reset New Name" required error={usernameError}>
            <StyledInput
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                hasError={!!usernameError}
            />
        </FormRow>

        <FormRow label="Confirm New Username" required error={confirmError}>
            <StyledInput
                type="text"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                hasError={!!confirmError}
            />
        </FormRow>

        <div className="flex justify-end pt-6">
          <PrimaryButton onClick={handleSubmit} loading={isLoading} disabled={isLoading} className="w-32">
            {t('save') || 'Save'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
