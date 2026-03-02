import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, PrimaryButton, PasswordInput } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

export const Tr069Page: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [enabled, setEnabled] = useState('0');
  const [url, setUrl] = useState('');
  const [noticeEnabled, setNoticeEnabled] = useState('0');
  const [noticeInterval, setNoticeInterval] = useState('');
  const [connectionRequestPort, setConnectionRequestPort] = useState('');
  const [acsAuthEnabled, setAcsAuthEnabled] = useState('0');
  const [userName, setUserName] = useState('');
  const [passwd, setPasswd] = useState('');
  const [cpeAuthEnabled, setCpeAuthEnabled] = useState('0');
  const [linkUserName, setLinkUserName] = useState('');
  const [linkPasswd, setLinkPasswd] = useState('');
  const [status, setStatus] = useState('');
  const [authType, setAuthType] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchTr069Data = async () => {
      try {
        const data = await apiRequest(212, 'GET');
        if (data && data.success) {
          setEnabled(data.enabled || '0');
          setUrl(data.url || '');
          setNoticeEnabled(data.noticeEnabled || '0');
          setNoticeInterval(data.noticeInterval || '');
          setConnectionRequestPort(data.connectionRequestPort || '');
          setAcsAuthEnabled(data.acsAuthEnabled || '0');
          setUserName(data.userName || '');
          setPasswd(data.passwd || '');
          setCpeAuthEnabled(data.cpeAuthEnabled || '0');
          setLinkUserName(data.linkUserName || '');
          setLinkPasswd(data.linkPasswd || '');
          setStatus(data.tr069_connect_status || '');
          setAuthType(data.tr069_auth_type || '');
        }
      } catch (error) {
        console.error("Failed to fetch TR069 settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTr069Data();
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (enabled === '1') {
      if (!url.trim()) {
        newErrors.url = 'Required';
        isValid = false;
      }
      if (!noticeInterval.trim()) {
        newErrors.noticeInterval = 'Required';
        isValid = false;
      }
      if (!connectionRequestPort.trim()) {
        newErrors.connectionRequestPort = 'Required';
        isValid = false;
      }
      if (acsAuthEnabled === '1') {
        if (!userName.trim()) {
          newErrors.userName = 'Required';
          isValid = false;
        }
        if (!passwd.trim()) {
          newErrors.passwd = 'Required';
          isValid = false;
        }
      }
      if (cpeAuthEnabled === '1') {
        if (!linkUserName.trim()) {
          newErrors.linkUserName = 'Required';
          isValid = false;
        }
        if (!linkPasswd.trim()) {
          newErrors.linkPasswd = 'Required';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: any = {
        enabled,
        url,
        noticeEnabled,
        noticeInterval,
        connectionRequestPort,
        acsAuthEnabled,
        userName,
        passwd,
        cpeAuthEnabled,
        linkUserName,
        linkPasswd
      };

      const data = await apiRequest(212, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save TR069 settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusText = (code: string) => {
    const statusMap: { [key: string]: string } = {
      "100": 'Connected',
      "101": 'Function not enabled.',
      "102": 'Initialization exception: configuration.',
      "103": 'Initialization exception: ACS URL.',
      "104": 'Initialization exception: log.',
      "105": 'Initialization exception: event.',
      "106": 'Initialization exception: openssl.',
      "107": 'Initialization exception: data model.',
      "108": 'Network exception.',
      "109": 'Domain name resolution exception.',
      "110": 'Session exception: session could not be established (out of memory or malformed ACS URL).',
      "111": 'Session exception: ACS connection could not be established.',
      "112": 'Session exception: Authentication failed.',
      "113": 'The session is abnormal: the returned data cannot be analyzed.',
      "114": 'Session exception: ACS connection interrupted.',
      "115": 'Session exception: ACS closed connection.',
      "116": 'Data sending failed.',
      "117": 'Receiving packets.',
      "118": 'The packet header data is parsed abnormally, and the complete data packet may not be received.',
      "119": 'Unknown Error Status Packet.',
      "120": 'No header data can be collected.',
      "121": 'No packet data can be collected.',
      "122": 'Data parsing, failed to apply for space.',
      "123": 'Data parsing, unsupported rpc.',
      "124": 'The session could not be established (the ACS URL is not formatted correctly).',
      "125": '400 Invalid request.',
      "126": '403 Forbidden.',
      "127": '404 The requested resource does not exist.',
      "128": '405 Resource forbidden.',
      "129": '406 Unacceptable.',
      "130": '410 never available.',
      "131": '412 Prerequisite failed.',
      "132": '414 Request URI too long.',
      "133": '500 An unexpected error occurred on the server.',
      "0": 'Disconnected',
      "": 'Disconnected',
    };
    return statusMap[code] || code;
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
      <FormRow label="Enable TR069">
        <SquareSwitch isOn={enabled === '1'} onChange={() => setEnabled(enabled === '1' ? '0' : '1')} />
      </FormRow>

      {enabled === '1' && (
        <>
          <FormRow label="TR069 Status">
            <div className="text-sm font-medium text-gray-900">{getStatusText(status)}</div>
          </FormRow>

          <FormRow label="Auth Type">
            <div className="text-sm font-medium text-gray-900">{authType || 'None'}</div>
          </FormRow>

          <FormRow label="ACS URL" required error={errors.url}>
            <StyledInput 
              value={url} 
              onChange={(e) => { setUrl(e.target.value); setErrors({ ...errors, url: '' }); }} 
              hasError={!!errors.url} 
            />
          </FormRow>

          <FormRow label="Enable Periodic Inform">
            <SquareSwitch isOn={noticeEnabled === '1'} onChange={() => setNoticeEnabled(noticeEnabled === '1' ? '0' : '1')} />
          </FormRow>

          <FormRow label="Periodic Inform Interval" required error={errors.noticeInterval}>
            <StyledInput 
              value={noticeInterval} 
              onChange={(e) => { setNoticeInterval(e.target.value); setErrors({ ...errors, noticeInterval: '' }); }} 
              hasError={!!errors.noticeInterval} 
            />
          </FormRow>

          <FormRow label="Connection Request Port" required error={errors.connectionRequestPort}>
            <StyledInput 
              value={connectionRequestPort} 
              onChange={(e) => { setConnectionRequestPort(e.target.value); setErrors({ ...errors, connectionRequestPort: '' }); }} 
              hasError={!!errors.connectionRequestPort} 
            />
          </FormRow>

          <FormRow label="Enable ACS Auth">
            <SquareSwitch isOn={acsAuthEnabled === '1'} onChange={() => setAcsAuthEnabled(acsAuthEnabled === '1' ? '0' : '1')} />
          </FormRow>

          {acsAuthEnabled === '1' && (
            <>
              <FormRow label="ACS Username" required error={errors.userName}>
                <StyledInput 
                  value={userName} 
                  onChange={(e) => { setUserName(e.target.value); setErrors({ ...errors, userName: '' }); }} 
                  hasError={!!errors.userName} 
                />
              </FormRow>

              <FormRow label="ACS Password" required error={errors.passwd}>
                <PasswordInput 
                  value={passwd} 
                  onChange={(e) => { setPasswd(e.target.value); setErrors({ ...errors, passwd: '' }); }} 
                  hasError={!!errors.passwd} 
                />
              </FormRow>
            </>
          )}

          <FormRow label="Enable CPE Auth">
            <SquareSwitch isOn={cpeAuthEnabled === '1'} onChange={() => setCpeAuthEnabled(cpeAuthEnabled === '1' ? '0' : '1')} />
          </FormRow>

          {cpeAuthEnabled === '1' && (
            <>
              <FormRow label="CPE Username" required error={errors.linkUserName}>
                <StyledInput 
                  value={linkUserName} 
                  onChange={(e) => { setLinkUserName(e.target.value); setErrors({ ...errors, linkUserName: '' }); }} 
                  hasError={!!errors.linkUserName} 
                />
              </FormRow>

              <FormRow label="CPE Password" required error={errors.linkPasswd}>
                <PasswordInput 
                  value={linkPasswd} 
                  onChange={(e) => { setLinkPasswd(e.target.value); setErrors({ ...errors, linkPasswd: '' }); }} 
                  hasError={!!errors.linkPasswd} 
                />
              </FormRow>
            </>
          )}
        </>
      )}

      <div className="flex justify-end pt-8">
        <PrimaryButton
          onClick={handleSave}
          loading={saving}
        >
          Save
        </PrimaryButton>
      </div>
    </div>
  );
};
