import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest, API_BASE_URL, getSessionId } from '../../utils/api';
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
        const sessionId = getSessionId();
        const logResponse = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cmd: 17, method: 'GET', sessionId })
        });
        const logTextData = await logResponse.text();
        setLogText(logTextData);

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
          setTimeout(() => {
              if (logTextareaRef.current) {
                  logTextareaRef.current.scrollTop = logTextareaRef.current.scrollHeight;
              }
          }, 10);
      }
  }, [logText]);

  const handleExportUserLog = () => {
      try {
          const a = document.createElement('a');
          a.href = '/web_event_log.tar.gz.encode';
          a.download = 'web_event_log.tar.gz.encode';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      } catch (error) {
          showAlert('Failed to export User LOG', 'error');
      }
  };

  const handleExportSystemLog = async () => {
      setIsExportingSystemLog(true);
      try {
          const res = await apiRequest(241, 'POST');
          if (res && res.success && res.message) {
              const a = document.createElement('a');
              // Ensure the path starts with a slash
              const path = res.message.startsWith('/') ? res.message : `/${res.message}`;
              a.href = path;
              a.download = res.message.split('/').pop() || 'system_log.tar.gz.encode';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          } else {
              showAlert('Failed to export System LOG', 'error');
          }
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
