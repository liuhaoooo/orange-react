import React, { useState, useEffect } from 'react';
import { SquareSwitch, PrimaryButton } from '../../components/UIComponents';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

export const SystemSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);

  const [telnet, setTelnet] = useState('0');
  const [adbSwitch, setAdbSwitch] = useState('0');

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showConfirm = (message: string, onConfirm: () => void, title?: string) => {
    setConfirmModalState({
      isOpen: true,
      title: title || t('confirm') || 'Confirm',
      message,
      onConfirm: () => {
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
        onConfirm();
      }
    });
  };

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const [telnetData, adbData] = await Promise.all([
          apiRequest(234, 'GET'),
          apiRequest(237, 'GET')
        ]);

        if (telnetData && telnetData.success) {
          setTelnet(telnetData.telnet || '0');
        }
        if (adbData && adbData.success) {
          setAdbSwitch(adbData.adbSwitch || '0');
        }
      } catch (error) {
        console.error("Failed to fetch System settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSystemSettings();
  }, []);

  const handleReboot = () => {
    showConfirm(
      t('confirmReboot') || 'Rebooting the device will temporarily disconnect your network. Are you sure you want to continue?',
      async () => {
        try {
          await apiRequest(6, 'POST', { cmd: 6, rebootType: 2 });
          showAlert(t('rebooting') || 'Device is rebooting...', 'success');
        } catch (error) {
          console.error("Failed to reboot", error);
          showAlert(t('errorRebooting') || 'Failed to reboot', 'error');
        }
      }
    );
  };

  const handleReset = () => {
    showConfirm(
      t('confirmReset') || 'Resetting to factory defaults will erase all your custom settings and restore the device to its original state. This action cannot be undone. Are you sure you want to continue?',
      async () => {
        try {
          const res = await apiRequest(112, 'POST', { cmd: 112 });
          if (res && res.success) {
            await apiRequest(6, 'POST', { cmd: 6, rebootType: 4 });
            showAlert(t('resetting') || 'Device is resetting...', 'success');
          } else {
            showAlert(t('errorResetting') || 'Failed to reset', 'error');
          }
        } catch (error) {
          console.error("Failed to reset", error);
          showAlert(t('errorResetting') || 'Failed to reset', 'error');
        }
      }
    );
  };

  const handleTelnetChange = () => {
    const newValue = telnet === '1' ? '0' : '1';
    const action = newValue === '1' ? 'enable' : 'disable';
    showConfirm(
      t('confirmTelnetChange') || `Are you sure you want to ${action} Telnet? ${newValue === '1' ? 'Enabling Telnet may pose a security risk.' : ''}`,
      async () => {
        try {
          const payload = {
            cmd: 234,
            telnet: newValue,
            telnet_orca: newValue
          };
          const res = await apiRequest(234, 'POST', payload);
          if (res && res.success) {
            setTelnet(newValue);
            showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
          } else {
            showAlert(t('errorSaving') || 'Failed to save settings', 'error');
          }
        } catch (error) {
          console.error("Failed to change Telnet settings", error);
          showAlert(t('errorSaving') || 'Failed to save settings', 'error');
        }
      }
    );
  };

  const handleAdbChange = () => {
    const newValue = adbSwitch === '1' ? '0' : '1';
    const action = newValue === '1' ? 'enable' : 'disable';
    showConfirm(
      t('confirmAdbChange') || `Are you sure you want to ${action} ADB? ${newValue === '1' ? 'Enabling ADB may pose a security risk.' : ''}`,
      async () => {
        try {
          const payload = {
            cmd: 237,
            adbSwitch: newValue
          };
          const res = await apiRequest(237, 'POST', payload);
          if (res && res.success) {
            setAdbSwitch(newValue);
            showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
          } else {
            showAlert(t('errorSaving') || 'Failed to save settings', 'error');
          }
        } catch (error) {
          console.error("Failed to change ADB settings", error);
          showAlert(t('errorSaving') || 'Failed to save settings', 'error');
        }
      }
    );
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
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900 w-1/3">Reboot</span>
        <div className="w-2/3 flex justify-end">
          <PrimaryButton onClick={handleReboot} className="w-32">
            Reboot
          </PrimaryButton>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900 w-1/3">Reset</span>
        <div className="w-2/3 flex justify-end">
          <PrimaryButton onClick={handleReset} className="w-32">
            Reset
          </PrimaryButton>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900 w-1/3">Telnet</span>
        <div className="w-2/3 flex justify-end">
          <SquareSwitch isOn={telnet === '1'} onChange={handleTelnetChange} />
        </div>
      </div>

      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900 w-1/3">ADB</span>
        <div className="w-2/3 flex justify-end">
          <SquareSwitch isOn={adbSwitch === '1'} onChange={handleAdbChange} />
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
      />
    </div>
  );
};
