import React, { useState } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton } from '../../components/UIComponents';
import { Eye, EyeOff } from 'lucide-react';
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

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    <div className="w-full animate-fade-in py-6">
      <div className="max-w-3xl space-y-8">
        
        {accountLevel === '1' && (
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <label className="text-sm font-bold text-gray-900 md:w-1/3">
                    <span className="text-red-500 mr-1">*</span>Reset User Password
                </label>
                <div className="md:w-2/3">
                    <select
                        value={resetUserRole}
                        onChange={(e) => setResetUserRole(e.target.value)}
                        className="w-full border border-gray-300 rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 bg-white"
                    >
                        <option value="2">Administrator User</option>
                        <option value="3">Normal User</option>
                    </select>
                </div>
            </div>
        )}

        {accountLevel === '3' && (
            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                <label className="text-sm font-bold text-gray-900 md:w-1/3 pt-2">
                    <span className="text-red-500 mr-1">*</span>Old Password
                </label>
                <div className="md:w-2/3">
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={`w-full border ${oldPassError ? 'border-red-500' : 'border-gray-300'} rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 pr-10`}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showOldPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                    </div>
                    {oldPassError && <p className="text-red-500 text-xs mt-1">{oldPassError}</p>}
                </div>
            </div>
        )}

        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
            <label className="text-sm font-bold text-gray-900 md:w-1/3 pt-2">
                <span className="text-red-500 mr-1">*</span>New Password
            </label>
            <div className="md:w-2/3">
                <div className="relative">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full border ${passError ? 'border-red-500' : 'border-gray-300'} rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 pr-10`}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showNewPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
                {passError && <p className="text-red-500 text-xs mt-1">{passError}</p>}
                
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
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
            <label className="text-sm font-bold text-gray-900 md:w-1/3 pt-2">
                <span className="text-red-500 mr-1">*</span>Confirm Password
            </label>
            <div className="md:w-2/3">
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full border ${confirmError ? 'border-red-500' : 'border-gray-300'} rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 pr-10`}
                    />
                    <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
                {confirmError && <p className="text-red-500 text-xs mt-1">{confirmError}</p>}
            </div>
        </div>

        <div className="flex justify-end pt-6">
          <PrimaryButton onClick={handleSubmit} loading={isLoading} disabled={isLoading}>
            {t('save') || 'Save'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
