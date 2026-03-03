import React, { useState } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, PasswordInput, StyledSelect } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

const b64EncodeUtf8 = (str: string) => {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode(Number('0x' + p1));
        }));
};

export const ChangePasswordPage: React.FC = () => {
  const { t } = useLanguage();
  const { globalData } = useGlobalState();
  const { showAlert } = useAlert();
  const accountLevel = globalData.accountLevel || '3'; // Default to normal user

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetUserRole, setResetUserRole] = useState('2'); // Default to Administrator User for level 1
  
  const [isLoading, setIsLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [oldPassError, setOldPassError] = useState('');

  const getStrength = (pass: string) => {
      if (!pass || pass.length === 0) return 0;
      if (pass.length < 8) return 1; // Weak
      if (pass.length < 12) return 2; // Medium
      return 3; // Strong
  };
  const strength = getStrength(newPassword);

  const handleSubmit = async () => {
    setPassError('');
    setConfirmError('');
    setOldPassError('');

    let hasError = false;

    if (accountLevel === '3' && !oldPassword) {
        setOldPassError(t('emptyError') || 'Cannot be empty');
        hasError = true;
    }

    if (!newPassword) {
        setPassError(t('emptyError') || 'Cannot be empty');
        hasError = true;
    }
    if (newPassword && newPassword !== confirmPassword) {
        setConfirmError(t('passwordsDoNotMatch') || 'Passwords do not match.');
        hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
        let payload: any = { cmd: 102 };
        if (accountLevel === '3') {
            payload = {
                ...payload,
                newPasswd: b64EncodeUtf8(newPassword),
                old_passwd: b64EncodeUtf8(oldPassword),
                subcmd: 0
            };
        } else if (accountLevel === '1') {
            payload = {
                ...payload,
                setPasswd: b64EncodeUtf8(newPassword),
                subcmd: 2,
                tz_account: b64EncodeUtf8(resetUserRole)
            };
        }

        const res = await apiRequest(102, 'POST', payload);
        
        if (res.message === 'success') {
            showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else if (res.message === 'ERROR') {
            showAlert(t('pwdModificationFailed') || 'Password modification failed', 'error');
        } else if (res.message === 'passwd same') {
            setPassError(t('pwdSameAsOld') || 'New password cannot be the same as the old password');
        } else if (res.message === 'username passwd same') {
            setPassError(t('pwdSameAsUser') || 'Password cannot be the same as username');
        } else {
            showAlert(res.message || t('pwdModificationFailed') || 'Password modification failed', 'error');
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
        
        {accountLevel === '1' && (
            <FormRow label="Reset User Password" required>
                <StyledSelect
                    value={resetUserRole}
                    onChange={(e) => setResetUserRole(e.target.value)}
                    options={[
                        { value: '2', label: 'Administrator User' },
                        { value: '3', label: 'Normal User' }
                    ]}
                />
            </FormRow>
        )}

        {accountLevel === '3' && (
            <FormRow label="Old Password" required error={oldPassError}>
                <PasswordInput
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    hasError={!!oldPassError}
                />
            </FormRow>
        )}

        <FormRow label="New Password" required error={passError} alignTop>
            <div className="w-full">
                <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    hasError={!!passError}
                />
                
                {/* Strength Indicator */}
                <div className="flex h-1.5 mt-2 gap-1">
                    <div className={`flex-1 transition-colors ${strength >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 transition-colors ${strength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 transition-colors ${strength >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
                    <span className={strength === 1 ? 'text-red-500' : ''}>Weak</span>
                    <span className={strength === 2 ? 'text-yellow-500' : ''}>Medium</span>
                    <span className={strength === 3 ? 'text-green-500' : ''}>Strong</span>
                </div>
            </div>
        </FormRow>

        <FormRow label="Confirm Password" required error={confirmError}>
            <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
