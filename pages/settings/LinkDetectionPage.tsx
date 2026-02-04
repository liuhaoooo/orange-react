
import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchLinkDetectionSettings, saveLinkDetectionSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const FormRow = ({ label, children, required = false }: { label: string; children?: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-orange me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const SwitchRow = ({ label, isOn, onChange }: { label: string, isOn: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <label className="font-bold text-sm text-black">{label}</label>
      <SquareSwitch isOn={isOn} onChange={onChange} />
  </div>
);

const StyledInput = ({ suffix, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) => (
  <div className="relative w-full">
      <input 
        {...props}
        className={`w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white ${suffix ? 'pe-16' : ''}`}
      />
      {suffix && (
          <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gray-100 border-l border-gray-300 px-3 text-sm text-gray-500 rounded-r-[2px]">
              {suffix}
          </div>
      )}
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const LinkDetectionPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const load = async () => {
        try {
            const res = await fetchLinkDetectionSettings();
            if (res && (res.success || res.success === undefined)) {
                setSettings(res);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    load();
  }, []);

  const handleChange = (key: string, value: any) => {
      setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          const res = await saveLinkDetectionSettings(settings);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully.', 'success');
          } else {
              showAlert('Failed to save settings.', 'error');
          }
      } catch(e) {
          console.error(e);
          showAlert('An error occurred.', 'error');
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-orange" size={40} /></div>;

  return (
    <div className="w-full animate-fade-in py-2">
        <SwitchRow label="Link Detection Switch" isOn={settings.wanLinkDetectSwitch === '1'} onChange={() => handleChange('wanLinkDetectSwitch', settings.wanLinkDetectSwitch === '1' ? '0' : '1')} />

        {settings.wanLinkDetectSwitch === '1' && (
            <>
                <FormRow label="Detection Mode">
                    <StyledSelect 
                        value={settings.checkWanLinkDetectMode || '0'} 
                        onChange={(e) => handleChange('checkWanLinkDetectMode', e.target.value)} 
                        options={[
                            { label: 'Ping', value: '0' },
                            { label: 'DNS', value: '1' }
                        ]}
                    />
                </FormRow>
                <FormRow label="Detection IP 1">
                    <StyledInput value={settings.wanLinkDetectIP1 || ''} onChange={(e) => handleChange('wanLinkDetectIP1', e.target.value)} />
                </FormRow>
                <FormRow label="Detection IP 2">
                    <StyledInput value={settings.wanLinkDetectIP2 || ''} onChange={(e) => handleChange('wanLinkDetectIP2', e.target.value)} />
                </FormRow>
                <FormRow label="Detection IP 3">
                    <StyledInput value={settings.wanLinkDetectIP3 || ''} onChange={(e) => handleChange('wanLinkDetectIP3', e.target.value)} />
                </FormRow>
                <FormRow label="Check Time">
                    <StyledInput value={settings.wanLinkDetectCheckTime || ''} onChange={(e) => handleChange('wanLinkDetectCheckTime', e.target.value)} suffix="s" />
                </FormRow>
                <FormRow label="Action">
                    <StyledSelect 
                        value={settings.LinkDetectAction || '0'} 
                        onChange={(e) => handleChange('LinkDetectAction', e.target.value)} 
                        options={[
                            { label: 'Reboot', value: '0' },
                            { label: 'Reconnect', value: '1' }
                        ]}
                    />
                </FormRow>
            </>
        )}

        <div className="flex justify-end pt-8">
            <button onClick={handleSave} disabled={saving} className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center">
                {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Save size={18} className="me-2" />}
                Save
            </button>
        </div>
    </div>
  );
};
