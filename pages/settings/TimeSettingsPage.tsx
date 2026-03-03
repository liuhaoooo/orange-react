import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../utils/i18nContext';
import { apiRequest } from '../../utils/api';
import { PrimaryButton, FormRow, StyledInput, StyledSelect, SquareSwitch } from '../../components/UIComponents';
import { useAlert } from '../../utils/AlertContext';

const timeZoneOptions = [
    { name: 'GMT -12:00', value: 'UTC12' },
    { name: 'GMT -11:30', value: 'UTC11:30' },
    { name: 'GMT -11:00', value: 'UTC11' },
    { name: 'GMT -10:30', value: 'UTC10:30' },
    { name: 'GMT -10:00', value: 'UTC10' },
    { name: 'GMT -9:30', value: 'UTC9:30' },
    { name: 'GMT -9:00', value: 'UTC9' },
    { name: 'GMT -8:30', value: 'UTC8:30' },
    { name: 'GMT -8:00', value: 'UTC8' },
    { name: 'GMT -7:30', value: 'UTC7:30' },
    { name: 'GMT -7:00', value: 'UTC7' },
    { name: 'GMT -6:30', value: 'UTC6:30' },
    { name: 'GMT -6:00', value: 'UTC6' },
    { name: 'GMT -5:30', value: 'UTC5:30' },
    { name: 'GMT -5:00', value: 'UTC5' },
    { name: 'GMT -4:30', value: 'UTC4:30' },
    { name: 'GMT -4:00', value: 'UTC4' },
    { name: 'GMT -3:30', value: 'UTC3:30' },
    { name: 'GMT -3:00', value: 'UTC3' },
    { name: 'GMT -2:30', value: 'UTC2:30' },
    { name: 'GMT -2:00', value: 'UTC2' },
    { name: 'GMT -1:30', value: 'UTC1:30' },
    { name: 'GMT -1:00', value: 'UTC1' },
    { name: 'GMT -0:30', value: 'UTC0:30' },
    { name: 'GMT', value: 'UTC0' },
    { name: 'GMT +0:30', value: 'UTC-0:30' },
    { name: 'GMT +1:00', value: 'UTC-1' },
    { name: 'GMT +1:30', value: 'UTC-1:30' },
    { name: 'GMT +2:00', value: 'UTC-2' },
    { name: 'GMT +2:30', value: 'UTC-2:30' },
    { name: 'GMT +3:00', value: 'UTC-3' },
    { name: 'GMT +3:30', value: 'UTC-3:30' },
    { name: 'GMT +4:00', value: 'UTC-4' },
    { name: 'GMT +4:30', value: 'UTC-4:30' },
    { name: 'GMT +5:00', value: 'UTC-5' },
    { name: 'GMT +5:30', value: 'UTC-5:30' },
    { name: 'GMT +6:00', value: 'UTC-6' },
    { name: 'GMT +6:30', value: 'UTC-6:30' },
    { name: 'GMT +7:00', value: 'UTC-7' },
    { name: 'GMT +7:30', value: 'UTC-7:30' },
    { name: 'GMT +8:00', value: 'UTC-8' },
    { name: 'GMT +8:30', value: 'UTC-8:30' },
    { name: 'GMT +9:00', value: 'UTC-9' },
    { name: 'GMT +9:30', value: 'UTC-9:30' },
    { name: 'GMT +10:00', value: 'UTC-10' },
    { name: 'GMT +10:30', value: 'UTC-10:30' },
    { name: 'GMT +11:00', value: 'UTC-11' },
    { name: 'GMT +11:30', value: 'UTC-11:30' },
    { name: 'GMT +12:00', value: 'UTC-12' },
];

export const TimeSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [systemTime, setSystemTime] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState('UTC-8');
  const [ntpSwitch, setNtpSwitch] = useState('1');
  const [ntp1, setNtp1] = useState('');
  const [ntp2, setNtp2] = useState('');
  const [ntp3, setNtp3] = useState('');
  const [ntp4, setNtp4] = useState('');
  
  const [clientTime, setClientTime] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTimeSettings = async () => {
      try {
        const res = await apiRequest(11, 'GET');
        if (res && res.success) {
            setNtpSwitch(res.ntpSwitch || '0');
            setTimezone(res.timezone || 'UTC-8');
            setNtp1(res.timeServer || '');
            setNtp2(res.timeServer2 || '');
            setNtp3(res.timeServer3 || '');
            setNtp4(res.timeServer4 || '');
            
            if (res.systime) {
                // Parse "YYYY-MM-DD HH:mm:ss"
                const [datePart, timePart] = res.systime.split(' ');
                if (datePart && timePart) {
                    const [year, month, day] = datePart.split('-').map(Number);
                    const [hour, minute, second] = timePart.split(':').map(Number);
                    // month is 0-indexed in JS Date
                    const dateObj = new Date(year, month - 1, day, hour, minute, second);
                    setSystemTime(dateObj);
                    
                    const pad = (n: number) => n.toString().padStart(2, '0');
                    setClientTime(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`);
                }
            }
        }
      } catch (error) {
        console.error("Failed to fetch time settings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSettings();

    return () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
  }, []);

  useEffect(() => {
      if (systemTime) {
          timerRef.current = setInterval(() => {
              setSystemTime(prev => {
                  if (!prev) return prev;
                  return new Date(prev.getTime() + 1000);
              });
          }, 1000);
      }

      return () => {
          if (timerRef.current) {
              clearInterval(timerRef.current);
          }
      };
  }, [systemTime !== null]); // Only run once when systemTime is initially set

  const formatDateTime = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const formatClientTime = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const getDatetimeString = (date: Date) => {
      // Format: MMddHHmmyyyy.ss (or similar based on requirement, but example shows "030320282026" which looks like MMDDHHmmyyyy)
      // Wait, example: "030320282026" -> 03 (month) 03 (day) 20 (hour) 28 (min) 2026 (year)
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${date.getFullYear()}`;
  };

  const handleGetLocalTime = () => {
      const now = new Date();
      setClientTime(formatClientTime(now));
  };

  const handleSaveNetworkTime = async () => {
      setIsSaving(true);
      try {
          const payload = {
              cmd: 11,
              timeServer: ntp1,
              timeServer2: ntp2,
              timeServer3: ntp3,
              timeServer4: ntp4,
              ntpSwitch: ntpSwitch,
              timezone: timezone,
              datetime: getDatetimeString(new Date()),
              method: 'POST'
          };
          const res = await apiRequest(11, 'POST', payload);
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

  const handleSynchronizeClientTime = async () => {
      if (!clientTime) {
          showAlert('Please get local time first', 'error');
          return;
      }
      
      // Validate YYYY-MM-DDTHH:mm format (from datetime-local)
      const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
      if (!timeRegex.test(clientTime)) {
          showAlert('Invalid time format. Please use the date picker.', 'error');
          return;
      }
      
      setIsSaving(true);
      try {
          const payload = {
              cmd: 321,
              clientTime: clientTime.replace('T', ' '),
              method: 'POST'
          };
          const res = await apiRequest(321, 'POST', payload);
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
        
        <FormRow label="System Time">
            <div className="w-full text-right text-black">
                {systemTime ? formatDateTime(systemTime) : '--'}
            </div>
        </FormRow>

        <FormRow label="Time Zone">
            <StyledSelect
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                options={timeZoneOptions}
            />
        </FormRow>

        <FormRow label="NTP Switch">
            <SquareSwitch 
                isOn={ntpSwitch === '1'} 
                onChange={() => setNtpSwitch(ntpSwitch === '1' ? '0' : '1')} 
            />
        </FormRow>

        {ntpSwitch === '1' && (
            <>
                <FormRow label="NTP1">
                    <StyledInput
                        type="text"
                        value={ntp1}
                        onChange={(e) => setNtp1(e.target.value)}
                    />
                </FormRow>
                <FormRow label="NTP2">
                    <StyledInput
                        type="text"
                        value={ntp2}
                        onChange={(e) => setNtp2(e.target.value)}
                    />
                </FormRow>
                <FormRow label="NTP3">
                    <StyledInput
                        type="text"
                        value={ntp3}
                        onChange={(e) => setNtp3(e.target.value)}
                    />
                </FormRow>
                <FormRow label="NTP4">
                    <StyledInput
                        type="text"
                        value={ntp4}
                        onChange={(e) => setNtp4(e.target.value)}
                    />
                </FormRow>
            </>
        )}

        <div className="flex justify-end pt-6 pb-6 border-b border-gray-100">
          <PrimaryButton onClick={handleSaveNetworkTime} loading={isSaving} disabled={isSaving}>
            Save and Update Network Time
          </PrimaryButton>
        </div>

        <div className="pt-6">
            <FormRow label="Client Time">
                <StyledInput
                    type="datetime-local"
                    value={clientTime}
                    onChange={(e) => setClientTime(e.target.value)}
                />
            </FormRow>

            <div className="flex justify-end pt-6 gap-4">
                <PrimaryButton 
                    onClick={handleGetLocalTime} 
                    disabled={isSaving}
                >
                    Get Local Time
                </PrimaryButton>
                <PrimaryButton onClick={handleSynchronizeClientTime} loading={isSaving} disabled={isSaving}>
                    Synchronize Client Time
                </PrimaryButton>
            </div>
        </div>

      </div>
    </div>
  );
};
