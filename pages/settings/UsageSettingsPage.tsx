
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { fetchUsageSettings, saveUsageSettings, UsageSettingsResponse } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, StyledInput, StyledTextarea, SquareSwitch, PrimaryButton } from '../../components/UIComponents';

const UNIT_OPTIONS = [
    { name: 'MB', value: '0' },
    { name: 'GB', value: '1' },
    { name: 'TB', value: '2' },
];

export const UsageSettingsPage: React.FC<{ type: 'national' | 'international' }> = ({ type }) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rawData, setRawData] = useState<UsageSettingsResponse | null>(null);

  // Form State (Input values)
  const [totalData, setTotalData] = useState('0');
  const [unit, setUnit] = useState('1'); // Default GB ('1')
  const [threshold, setThreshold] = useState('50');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Applied State (Currently active values for calculation)
  const [appliedTotalData, setAppliedTotalData] = useState('0');
  const [appliedUnit, setAppliedUnit] = useState('1');

  // Validation Errors
  const [errors, setErrors] = useState<{
      totalData?: string;
      threshold?: string;
      mobileNumber?: string;
      messageContent?: string;
  }>({});

  const isNational = type === 'national';
  const keys = useMemo(() => ({
      limitSize: isNational ? 'nation_limit_size' : 'internation_limit_size',
      warnPercent: isNational ? 'nation_warn_percentage' : 'internation_warn_percentage',
      smsSwitch: isNational ? 'national_flow_sms_notice_sw' : 'international_flow_sms_notice_sw',
      noticeNumber: isNational ? 'nation_flow_notice_number' : 'internation_flow_notice_number',
      noticeText: isNational ? 'nation_flow_notice_text' : 'internation_flow_notice_text',
      dlFlow: isNational ? 'dl_mon_flow' : 'roam_dl_mon_flow',
      ulFlow: isNational ? 'ul_mon_flow' : 'roam_ul_mon_flow',
  }), [isNational]);

  const formatBytes = (mb: number) => {
      if (mb >= 1024 * 1024) return `${(mb / (1024 * 1024)).toFixed(2)} TB`;
      if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
      return `${mb.toFixed(2)} MB`;
  };

  const usedDataMB = useMemo(() => {
      if (!rawData) return 0;
      const dl = parseFloat(rawData[keys.dlFlow] || '0');
      const ul = parseFloat(rawData[keys.ulFlow] || '0');
      return dl + ul;
  }, [rawData, keys]);

  const remainingDataStr = useMemo(() => {
      const tVal = parseFloat(appliedTotalData);
      const tUnit = appliedUnit;
      
      let limitMB = 0;
      if (tUnit === '0') limitMB = tVal; // MB
      else if (tUnit === '1') limitMB = tVal * 1024; // GB
      else if (tUnit === '2') limitMB = tVal * 1024 * 1024; // TB

      const remain = Math.max(0, limitMB - usedDataMB);
      return formatBytes(remain);
  }, [appliedTotalData, appliedUnit, usedDataMB]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchUsageSettings();
        if (res && (res.success || res.cmd === 1021)) {
            setRawData(res);
            
            const limit = res[keys.limitSize] || '0';
            const u = res.flow_limit_unit || '1';

            setTotalData(limit);
            setUnit(u); 
            setThreshold(res[keys.warnPercent] || '50');
            setAlertEnabled(res[keys.smsSwitch] === '1');
            setMobileNumber(res[keys.noticeNumber] || '');
            setMessageContent(res[keys.noticeText] || '');

            setAppliedTotalData(limit);
            setAppliedUnit(u);
            
            setErrors({});
        }
      } catch (e) {
        console.error("Failed to fetch usage settings", e);
        showAlert('Failed to load settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [type, showAlert, keys]);

  const handleSave = async () => {
      setErrors({});
      const newErrors: typeof errors = {};
      let hasError = false;

      const totalNum = parseFloat(totalData);
      if (isNaN(totalNum) || totalNum < 0) {
          newErrors.totalData = 'Invalid Total Data value.';
          hasError = true;
      }

      const threshNum = parseInt(threshold, 10);
      if (isNaN(threshNum) || threshNum < 1 || threshNum > 100) {
          newErrors.threshold = 'Threshold must be between 1 and 100.';
          hasError = true;
      }

      if (alertEnabled) {
          if (!mobileNumber.trim()) {
              newErrors.mobileNumber = 'Mobile Number is required.';
              hasError = true;
          }
          if (!messageContent.trim()) {
              newErrors.messageContent = 'Message Content is required.';
              hasError = true;
          }
      }

      if (hasError) {
          setErrors(newErrors);
          return;
      }

      setSaving(true);
      
      const payload: any = { ...rawData };
      delete payload.cmd;
      delete payload.success;

      payload.flow_limit_unit = unit;
      payload[keys.limitSize] = totalData;
      payload[keys.warnPercent] = threshold;
      payload[keys.smsSwitch] = alertEnabled ? '1' : '0';
      payload[keys.noticeNumber] = mobileNumber;
      payload[keys.noticeText] = messageContent;
      
      try {
          const res = await saveUsageSettings(payload);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully.', 'success');
              setRawData(prev => ({ ...prev, ...payload }));
              setAppliedTotalData(totalData);
              setAppliedUnit(unit);
          } else {
              showAlert('Failed to save settings.', 'error');
          }
      } catch (e) {
          console.error(e);
          showAlert('An error occurred.', 'error');
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  return (
    <div className="w-full animate-fade-in py-2">
      <div className="max-w-4xl">
        <FormRow label="Data usage">
            <span className="text-black text-sm font-bold">{formatBytes(usedDataMB)}</span>
        </FormRow>

        <FormRow label="Remaining Data">
            <span className="text-black text-sm font-bold">{remainingDataStr}</span>
        </FormRow>

        <FormRow label="Total Data" required error={errors.totalData}>
            <div className="flex w-full sm:max-w-xs">
                <div className="flex-1">
                    <input 
                        type="text"
                        value={totalData} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) setTotalData(val);
                            if (errors.totalData) setErrors(prev => ({...prev, totalData: undefined}));
                        }} 
                        className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-l-[2px] bg-white border-r-0 h-10 ${errors.totalData ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'}`}
                    />
                </div>
                <div className="w-24 relative">
                    <select 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)}
                        className={`w-full border px-3 py-2 text-sm text-gray-600 outline-none transition-all rounded-r-[2px] appearance-none bg-[#f3f4f6] cursor-pointer font-bold h-10 ${errors.totalData ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'}`}
                    >
                        {UNIT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
            </div>
        </FormRow>

        <FormRow label="When reached" required error={errors.threshold}>
            <div className="flex items-center">
                <div className="w-32 me-3">
                    <StyledInput 
                        value={threshold} 
                        hasError={!!errors.threshold}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setThreshold(val);
                            if (errors.threshold) setErrors(prev => ({...prev, threshold: undefined}));
                        }} 
                        maxLength={3}
                    />
                </div>
                <span className="text-black text-sm font-medium whitespace-nowrap">% to remind me</span>
            </div>
        </FormRow>

        <FormRow label="Data alert message push">
            <SquareSwitch isOn={alertEnabled} onChange={() => setAlertEnabled(!alertEnabled)} />
        </FormRow>

        {alertEnabled && (
            <>
                <FormRow label="Mobile Number" required error={errors.mobileNumber}>
                    <div className="w-full sm:max-w-xs">
                        <StyledInput 
                            value={mobileNumber} 
                            hasError={!!errors.mobileNumber}
                            onChange={(e) => {
                                setMobileNumber(e.target.value);
                                if (errors.mobileNumber) setErrors(prev => ({...prev, mobileNumber: undefined}));
                            }} 
                        />
                    </div>
                </FormRow>

                <FormRow label="Message Content" required alignTop error={errors.messageContent}>
                    <div className="w-full sm:max-w-md">
                        <StyledTextarea 
                            value={messageContent} 
                            onChange={(e) => setMessageContent(e.target.value)} 
                            hasError={!!errors.messageContent}
                        />
                    </div>
                </FormRow>
            </>
        )}

        <div className="flex justify-end pt-8 mt-4 pb-6 border-t border-transparent">
            <PrimaryButton 
                onClick={handleSave}
                loading={saving}
                icon={<Save size={18} />}
            >
                Save
            </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
