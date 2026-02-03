
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchUsageSettings, saveUsageSettings, UsageSettingsResponse } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const FormRow = ({ label, children, required = false, alignTop = false }: { label: string; children: React.ReactNode; required?: boolean, alignTop?: boolean }) => (
  <div className={`flex flex-col sm:flex-row ${alignTop ? 'items-start' : 'sm:items-center'} py-4 border-b border-gray-100 last:border-0`}>
    <div className={`w-full sm:w-1/3 mb-2 sm:mb-0 ${alignTop ? 'pt-2' : ''}`}>
      <label className="font-bold text-sm text-black">
        {required && <span className="text-orange me-1">*</span>}
        {label}
      </label>
    </div>
    <div className={`w-full sm:w-2/3 flex flex-col ${alignTop ? 'justify-start' : 'justify-center'} items-end`}>
      <div className={`w-full flex ${alignTop ? 'items-start' : 'items-center'} justify-start sm:justify-end`}>
        {children}
      </div>
    </div>
  </div>
);

const StyledInput = ({ hasError, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input 
    {...props}
    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white placeholder-gray-400 h-10 ${hasError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange focus:ring-1 focus:ring-orange'}`}
  />
);

const StyledTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white min-h-[120px] resize-y font-sans"
  />
);

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

  // Form State
  const [totalData, setTotalData] = useState('0');
  const [unit, setUnit] = useState('1'); // Default GB ('1')
  const [threshold, setThreshold] = useState('50');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Applied State (for remaining calculation, updated only on fetch or successful save)
  const [appliedTotalData, setAppliedTotalData] = useState('0');
  const [appliedUnit, setAppliedUnit] = useState('1');

  // Validation Errors
  const [errors, setErrors] = useState<{
      totalData?: string;
      threshold?: string;
      mobileNumber?: string;
      messageContent?: string;
  }>({});

  // Key Mapping based on type
  const isNational = type === 'national';
  const keys = useMemo(() => ({
      limitSize: isNational ? 'nation_limit_size' : 'internation_limit_size',
      warnPercent: isNational ? 'nation_warn_percentage' : 'internation_warn_percentage',
      smsSwitch: isNational ? 'national_flow_sms_notice_sw' : 'international_flow_sms_notice_sw',
      noticeNumber: isNational ? 'nation_flow_notice_number' : 'internation_flow_notice_number',
      noticeText: isNational ? 'nation_flow_notice_text' : 'internation_flow_notice_text',
      // For usage calculation
      dlFlow: isNational ? 'dl_mon_flow' : 'roam_dl_mon_flow',
      ulFlow: isNational ? 'ul_mon_flow' : 'roam_ul_mon_flow',
  }), [isNational]);

  // Helper: Format MB into appropriate unit string
  const formatBytes = (mb: number) => {
      if (mb >= 1024 * 1024) return `${(mb / (1024 * 1024)).toFixed(2)} TB`;
      if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
      return `${mb.toFixed(2)} MB`;
  };

  // Calculate Data Usage
  const usedDataMB = useMemo(() => {
      if (!rawData) return 0;
      const dl = parseFloat(rawData[keys.dlFlow] || '0');
      const ul = parseFloat(rawData[keys.ulFlow] || '0');
      return dl + ul;
  }, [rawData, keys]);

  // Calculate Remaining Data (Based on APPLIED values)
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

            // Map values to form state
            setTotalData(limit);
            setUnit(u); 
            setThreshold(res[keys.warnPercent] || '50');
            setAlertEnabled(res[keys.smsSwitch] === '1');
            setMobileNumber(res[keys.noticeNumber] || '');
            setMessageContent(res[keys.noticeText] || '');

            // Set applied state
            setAppliedTotalData(limit);
            setAppliedUnit(u);
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
      // Clear previous errors
      setErrors({});
      const newErrors: typeof errors = {};
      let hasError = false;

      // Validation
      const totalNum = parseFloat(totalData);
      if (isNaN(totalNum) || totalNum < 0) {
          newErrors.totalData = 'Invalid Total Data value.';
          hasError = true;
      } else if (unit === '2' && totalNum > 999) {
          newErrors.totalData = 'Total Data cannot exceed 999 TB.';
          hasError = true;
      }

      const threshNum = parseInt(threshold, 10);
      if (isNaN(threshNum) || threshNum < 1 || threshNum > 100) {
          newErrors.threshold = 'Threshold must be between 1 and 100.';
          hasError = true;
      }

      if (alertEnabled) {
          if (!mobileNumber) {
              newErrors.mobileNumber = 'Mobile Number is required.';
              hasError = true;
          }
          if (!messageContent) {
              newErrors.messageContent = 'Message Content is required.';
              hasError = true;
          }
      }

      if (hasError) {
          setErrors(newErrors);
          return;
      }

      setSaving(true);
      
      // Construct Explicit Payload for CMD 337
      // Using values from state for current type, and rawData fallbacks for other type
      const payload = {
          // National Settings
          national_flow_sms_notice_sw: isNational ? (alertEnabled ? '1' : '0') : (rawData?.national_flow_sms_notice_sw || '0'),
          nation_flow_notice_number: isNational ? mobileNumber : (rawData?.nation_flow_notice_number || ''),
          nation_flow_notice_text: isNational ? messageContent : (rawData?.nation_flow_notice_text || ''),
          nation_limit_size: isNational ? totalData : (rawData?.nation_limit_size || '0'),
          nation_warn_percentage: isNational ? threshold : (rawData?.nation_warn_percentage || '50'),

          // International Settings
          international_flow_sms_notice_sw: !isNational ? (alertEnabled ? '1' : '0') : (rawData?.international_flow_sms_notice_sw || '0'),
          internation_flow_notice_number: !isNational ? mobileNumber : (rawData?.internation_flow_notice_number || ''),
          internation_flow_notice_text: !isNational ? messageContent : (rawData?.internation_flow_notice_text || ''),
          internation_limit_size: !isNational ? totalData : (rawData?.internation_limit_size || '0'),
          internation_warn_percentage: !isNational ? threshold : (rawData?.internation_warn_percentage || '50'),

          // Common
          flow_limit_unit: unit,
      };
      
      try {
          const res = await saveUsageSettings(payload);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully.', 'success');
              // Update local rawData to match what we sent so toggling tabs works correctly without refetch
              setRawData(prev => ({...prev, ...payload} as UsageSettingsResponse));
              
              // Update applied values to reflect saved changes in calculation
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
        {/* Read Only Stats */}
        <FormRow label="Data usage">
            <span className="text-black text-sm font-bold">{formatBytes(usedDataMB)}</span>
        </FormRow>

        <FormRow label="Remaining Data">
            <span className="text-black text-sm font-bold">{remainingDataStr}</span>
        </FormRow>

        {/* Total Data Input */}
        <FormRow label="Total Data" required>
            <div className="flex flex-col items-end w-full sm:max-w-xs">
                <div className="flex w-full">
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
                {errors.totalData && <span className="text-red-500 text-xs mt-1 text-right w-full">{errors.totalData}</span>}
            </div>
        </FormRow>

        {/* Threshold */}
        <FormRow label="When reached" required>
            <div className="flex flex-col items-start w-full sm:w-auto">
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
                {errors.threshold && <span className="text-red-500 text-xs mt-1 w-full">{errors.threshold}</span>}
            </div>
        </FormRow>

        {/* Alert Switch */}
        <FormRow label="Data alert message push">
            <SquareSwitch isOn={alertEnabled} onChange={() => setAlertEnabled(!alertEnabled)} />
        </FormRow>

        {/* Conditional Inputs */}
        {alertEnabled && (
            <>
                <FormRow label="Mobile Number" required>
                    <div className="w-full sm:max-w-xs flex flex-col">
                        <StyledInput 
                            value={mobileNumber} 
                            hasError={!!errors.mobileNumber}
                            onChange={(e) => {
                                setMobileNumber(e.target.value);
                                if (errors.mobileNumber) setErrors(prev => ({...prev, mobileNumber: undefined}));
                            }} 
                        />
                        {errors.mobileNumber && <span className="text-red-500 text-xs mt-1 text-right">{errors.mobileNumber}</span>}
                    </div>
                </FormRow>

                <FormRow label="Message Content" required alignTop>
                    <div className="w-full sm:max-w-md flex flex-col">
                        <StyledTextarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
                        {errors.messageContent && <span className="text-red-500 text-xs mt-1 text-right">{errors.messageContent}</span>}
                    </div>
                </FormRow>
            </>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-8 mt-4 pb-6 border-t border-transparent">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center"
            >
                {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Save size={18} className="me-2" />}
                Save
            </button>
        </div>
      </div>
    </div>
  );
};
