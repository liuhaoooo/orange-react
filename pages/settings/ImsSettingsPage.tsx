
import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2, Save } from 'lucide-react';
import { fetchImsSettings, saveImsSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { SquareSwitch } from '../../components/UIComponents';

const FormRow = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
      <label className="font-bold text-sm text-black">{label}</label>
    </div>
    <div className="w-full sm:w-2/3 flex sm:justify-end items-center justify-start">
      {children}
    </div>
  </div>
);

const PDP_OPTIONS = [
    { name: 'IPV4', value: 'IP' },
    { name: 'IPV6', value: 'IPV6' },
    { name: 'IPV4&V6', value: 'IPV4V6' },
];

export const ImsSettingsPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data State
  const [imsEnabled, setImsEnabled] = useState(false); // volteSw
  const [regStatus, setRegStatus] = useState(''); // volteRegStatus
  const [imsApn, setImsApn] = useState(''); // ims
  const [pdpType, setPdpType] = useState('IPV4V6'); // pdpType

  useEffect(() => {
    const init = async () => {
        try {
            const res = await fetchImsSettings();
            if (res && (res.success || res.cmd === 1023)) {
                setImsEnabled(res.volteSw === '1');
                setRegStatus(res.volteRegStatus || '9');
                setImsApn(res.ims || '');
                setPdpType(res.pdpType || 'IPV4V6');
            }
        } catch (e) {
            console.error("Failed to fetch IMS settings", e);
            showAlert('Failed to load settings.', 'error');
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [showAlert]);

  const handleSave = async () => {
      setSaving(true);
      try {
          const payload = {
              volteSw: imsEnabled ? '1' : '0',
              pdpType: pdpType,
              ims: imsApn
          };
          
          const res = await saveImsSettings(payload);
          if (res && (res.success || res.cmd === 1023)) {
              showAlert('Settings saved successfully.', 'success');
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

  const getStatusText = (status: string) => {
      switch(status) {
          case '0': return "The system is initializing";
          case '1': return "Initializing VoLTE Settings";
          case '2': return "Resetting Module";
          case '3': return "Registering";
          case '4': return "Registered";
          case '5': return "Error Configuring Module";
          case '6': return "SIM Card Not Detected";
          case '7': return "Factory Mode";
          case '8': return "Stationed in the Network";
          case '9': return "Unregistered";
          default: return "Unknown Mistake";
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
          {/* IMS On/Off */}
          <FormRow label="IMS On/Off">
              <SquareSwitch isOn={imsEnabled} onChange={() => setImsEnabled(!imsEnabled)} />
          </FormRow>

          {/* Conditional Fields */}
          {imsEnabled && (
              <>
                {/* IMS Register Status */}
                <FormRow label="IMS Register Status">
                    <span className="text-black text-sm font-medium">{getStatusText(regStatus)}</span>
                </FormRow>

                {/* IMS Input */}
                <FormRow label="IMS">
                    <input 
                        type="text" 
                        value={imsApn}
                        onChange={(e) => setImsApn(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white"
                    />
                </FormRow>

                {/* IMS PDP Type */}
                <FormRow label="IMS PDP Type">
                    <div className="relative w-full">
                        <select 
                        value={pdpType} 
                        onChange={(e) => setPdpType(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                        >
                        {PDP_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                        ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </FormRow>
              </>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-12 mt-2">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center"
            >
                {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Save size={18} className="me-2" />}
                Save
            </button>
          </div>
      </div>
    </div>
  );
};
