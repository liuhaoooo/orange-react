
import React, { useState, useEffect } from 'react';
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
    <div className={`w-full sm:w-2/3 flex ${alignTop ? 'items-start' : 'items-center'} justify-start sm:justify-end`}>
      {children}
    </div>
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white placeholder-gray-400 h-10"
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
  const [unit, setUnit] = useState('1'); // Default GB ('1') based on typical usage
  const [threshold, setThreshold] = useState('50');
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Calculated State
  const [dataUsage, setDataUsage] = useState('0.00 MB');
  const [remainingData, setRemainingData] = useState('0.00 MB');

  // Key Mapping based on type
  const isNational = type === 'national';
  const keys = {
      limitSize: isNational ? 'nation_limit_size' : 'internation_limit_size',
      warnPercent: isNational ? 'nation_warn_percentage' : 'internation_warn_percentage',
      smsSwitch: isNational ? 'national_flow_sms_notice_sw' : 'international_flow_sms_notice_sw',
      noticeNumber: isNational ? 'nation_flow_notice_number' : 'internation_flow_notice_number',
      noticeText: isNational ? 'nation_flow_notice_text' : 'internation_flow_notice_text',
      // For usage calculation
      dlFlow: isNational ? 'dl_mon_flow' : 'roam_dl_mon_flow',
      ulFlow: isNational ? 'ul_mon_flow' : 'roam_ul_mon_flow',
  };

  // Helper: Format MB into appropriate unit string
  const formatBytes = (mb: number) => {
      if (mb >= 1024 * 1024) return `${(mb / (1024 * 1024)).toFixed(2)} TB`;
      if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
      return `${mb.toFixed(2)} MB`;
  };

  const calculate = (res: UsageSettingsResponse, newTotal?: string, newUnit?: string) => {
      // 1. Used Data (MB)
      const used = parseFloat(res[keys.dlFlow] || '0') + parseFloat(res[keys.ulFlow] || '0');
      setDataUsage(formatBytes(used));

      // 2. Total Limit (converted to MB)
      const tVal = parseFloat(newTotal !== undefined ? newTotal : (res[keys.limitSize] || '0'));
      const tUnit = newUnit !== undefined ? newUnit : (res.flow_limit_unit || '1');
      
      let limitMB = 0;
      if (tUnit === '0') limitMB = tVal; // MB
      else if (tUnit === '1') limitMB = tVal * 1024; // GB
      else if (tUnit === '2') limitMB = tVal * 1024 * 1024; // TB

      // 3. Remaining (MB)
      const remain = Math.max(0, limitMB - used);
      setRemainingData(formatBytes(remain));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchUsageSettings();
        if (res && res.success) {
            setRawData(res);
            
            // Map values to state
            setTotalData(res[keys.limitSize] || '0');
            setUnit(res.flow_limit_unit || '1'); // Assuming unit is global for both, typically per router logic
            setThreshold(res[keys.warnPercent] || '50');
            setAlertEnabled(res[keys.smsSwitch] === '1');
            setMobileNumber(res[keys.noticeNumber] || '');
            setMessageContent(res[keys.noticeText] || '');

            calculate(res, res[keys.limitSize], res.flow_limit_unit);
        }
      } catch (e) {
        console.error("Failed to fetch usage settings", e);
        showAlert('Failed to load settings.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [type, showAlert, keys.limitSize, keys.warnPercent, keys.smsSwitch, keys.noticeNumber, keys.noticeText, keys.dlFlow, keys.ulFlow]);

  // Recalculate remaining when inputs change
  useEffect(() => {
      if (rawData) {
          calculate(rawData, totalData, unit);
      }
  }, [totalData, unit, rawData]);

  const handleSave = async () => {
      // Validation
      const totalNum = parseFloat(totalData);
      if (isNaN(totalNum)) {
          showAlert('Invalid Total Data value.', 'error');
          return;
      }
      
      // Max check (999 TB approx)
      // 999 TB = 999 * 1024 GB = 1,022,976 MB
      // If Unit is TB, limit input to 999
      if (unit === '2' && totalNum > 999) {
          showAlert('Total Data cannot exceed 999 TB.', 'error');
          return;
      }

      const threshNum = parseInt(threshold, 10);
      if (isNaN(threshNum) || threshNum < 1 || threshNum > 100) {
          showAlert('Threshold must be between 1 and 100.', 'error');
          return;
      }

      setSaving(true);
      
      // Construct Payload
      // Merge with existing rawData to preserve other fields not on this screen
      const payload: any = { ...rawData };
      
      payload[keys.limitSize] = totalData;
      payload.flow_limit_unit = unit; // Updating global unit based on this page's selection
      payload[keys.warnPercent] = threshold;
      payload[keys.smsSwitch] = alertEnabled ? '1' : '0';
      payload[keys.noticeNumber] = mobileNumber;
      payload[keys.noticeText] = messageContent;

      try {
          const res = await saveUsageSettings(payload);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully.', 'success');
              // Update raw data locally to reflect save
              setRawData(payload);
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
            <span className="text-black text-sm font-bold">{dataUsage}</span>
        </FormRow>

        <FormRow label="Remaining Data">
            <span className="text-black text-sm font-bold">{remainingData}</span>
        </FormRow>

        {/* Total Data Input */}
        <FormRow label="Total Data" required>
            <div className="flex w-full sm:max-w-xs">
                <div className="flex-1">
                    <input 
                        type="text"
                        value={totalData} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) setTotalData(val);
                        }} 
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-l-[2px] bg-white border-r-0 h-10"
                    />
                </div>
                <div className="w-24 relative">
                    <select 
                        value={unit} 
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-r-[2px] appearance-none bg-[#f3f4f6] cursor-pointer font-bold h-10"
                    >
                        {UNIT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
            </div>
        </FormRow>

        {/* Threshold */}
        <FormRow label="When reached" required>
            <div className="flex items-center">
                <div className="w-32 me-3">
                    <StyledInput 
                        value={threshold} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setThreshold(val);
                        }} 
                        maxLength={3}
                    />
                </div>
                <span className="text-black text-sm font-medium whitespace-nowrap">% to remind me</span>
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
                    <div className="w-full sm:max-w-xs">
                        <StyledInput value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                    </div>
                </FormRow>

                <FormRow label="Message Content" required alignTop>
                    <div className="w-full sm:max-w-md">
                        <StyledTextarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} />
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
