import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, StyledInput, StyledSelect } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

const logLevelOptions = [
    { name: 'Default', value: '0' },
    { name: 'Error', value: '1' },
    { name: 'Warn', value: '2' },
    { name: 'Debug', value: '3' },
    { name: 'Info', value: '4' },
];

export const LogSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingUserLog, setIsExportingUserLog] = useState(false);
  const [isExportingSystemLog, setIsExportingSystemLog] = useState(false);

  const [logText, setLogText] = useState('');
  const [logLevel, setLogLevel] = useState('0');
  const [logSize, setLogSize] = useState(''); // Stored in K for UI
  const [logSizeError, setLogSizeError] = useState('');

  const logTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchLogSettings = async () => {
      try {
        // Fetch log text
        const logRes = await apiRequest(17, 'GET');
        // Assuming the response from cmd 17 is just text or has a specific field. 
        // If it's raw text, apiRequest might try to parse it as JSON. 
        // We handle both cases here.
        if (typeof logRes === 'string') {
            setLogText(logRes);
        } else if (logRes && logRes.log) {
            setLogText(logRes.log);
        } else if (logRes && logRes.message) {
            setLogText(logRes.message);
        } else {
            // Fallback if it's an object but we don't know the key
            setLogText(JSON.stringify(logRes, null, 2));
        }

        // Fetch log parameters
        const paramsRes = await apiRequest(322, 'GET');
        if (paramsRes && paramsRes.success) {
            setLogLevel(paramsRes.logGrade || '0');
            if (paramsRes.logSize) {
                // Convert bytes to K
                const sizeInK = Math.floor(parseInt(paramsRes.logSize, 10) / 1000);
                setLogSize(sizeInK.toString());
            }
        }
      } catch (error) {
        console.error("Failed to fetch log settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogSettings();
  }, []);

  // Auto-scroll to bottom when log text changes
  useEffect(() => {
      if (logTextareaRef.current) {
          logTextareaRef.current.scrollTop = logTextareaRef.current.scrollHeight;
      }
  }, [logText]);

  const handleExportUserLog = async () => {
      setIsExportingUserLog(true);
      try {
          // Assuming cmd 17 is for user log export based on the UI
          // If there's a specific endpoint for downloading the file, we would use window.open or a hidden iframe
          // For now, we just fetch cmd 17 and trigger a download
          const res = await apiRequest(17, 'GET');
          let textData = '';
          if (typeof res === 'string') textData = res;
          else if (res && res.log) textData = res.log;
          else textData = JSON.stringify(res, null, 2);

          const blob = new Blob([textData], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'user_log.txt';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (error) {
          showAlert('Failed to export User LOG', 'error');
      } finally {
          setIsExportingUserLog(false);
      }
  };

  const handleExportSystemLog = async () => {
      setIsExportingSystemLog(true);
      try {
          // Assuming there's a different cmd for system log, e.g., 18 or similar. 
          // If not specified, we'll just show an alert or use a placeholder cmd.
          // For this example, let's assume cmd 18 for system log export.
          const res = await apiRequest(18, 'GET'); // Placeholder cmd
          let textData = '';
          if (typeof res === 'string') textData = res;
          else if (res && res.log) textData = res.log;
          else textData = JSON.stringify(res, null, 2);

          const blob = new Blob([textData], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'system_log.txt';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
      } catch (error) {
          showAlert('Failed to export System LOG', 'error');
      } finally {
          setIsExportingSystemLog(false);
      }
  };

  const handleSave = async () => {
      setLogSizeError('');
      
      if (!logSize) {
          setLogSizeError(t('emptyError') || 'Cannot be empty');
          return;
      }

      const sizeNum = parseInt(logSize, 10);
      if (isNaN(sizeNum) || sizeNum <= 0) {
          setLogSizeError('Invalid size');
          return;
      }

      setIsSaving(true);
      try {
          const payload = {
              cmd: 322,
              logGrade: logLevel,
              logSize: sizeNum * 1000, // Convert K back to bytes
              method: 'POST'
          };
          const res = await apiRequest(322, 'POST', payload);
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
        
        {/* Log Text Area */}
        <div className="mb-6">
            <textarea
                ref={logTextareaRef}
                value={logText}
                readOnly
                className="w-full h-64 p-3 text-sm font-mono text-gray-700 bg-gray-50 border border-gray-300 rounded-[2px] resize-none focus:outline-none"
                placeholder="No log data available..."
            />
        </div>

        <FormRow label="User log">
            <PrimaryButton 
                onClick={handleExportUserLog} 
                loading={isExportingUserLog} 
                disabled={isExportingUserLog}
            >
                Export LOG
            </PrimaryButton>
        </FormRow>

        <FormRow label="System Log">
            <PrimaryButton 
                onClick={handleExportSystemLog} 
                loading={isExportingSystemLog} 
                disabled={isExportingSystemLog}
            >
                Export LOG
            </PrimaryButton>
        </FormRow>

        <FormRow label="LOG Level">
            <StyledSelect
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                options={logLevelOptions}
            />
        </FormRow>

        <FormRow label="LOG Size" required error={logSizeError}>
            <StyledInput
                type="number"
                value={logSize}
                onChange={(e) => setLogSize(e.target.value)}
                hasError={!!logSizeError}
                suffix="K"
            />
        </FormRow>

        <div className="flex justify-end pt-6">
          <PrimaryButton onClick={handleSave} loading={isSaving} disabled={isSaving} className="w-32">
            {t('save') || 'Save'}
          </PrimaryButton>
        </div>

      </div>
    </div>
  );
};
