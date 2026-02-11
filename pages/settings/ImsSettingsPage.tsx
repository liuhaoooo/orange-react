
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { fetchImsSettings, saveImsSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { SquareSwitch, FormRow, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';

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
                    <StyledInput 
                        value={imsApn}
                        onChange={(e) => setImsApn(e.target.value)}
                    />
                </FormRow>

                {/* IMS PDP Type */}
                <FormRow label="IMS PDP Type">
                    <StyledSelect 
                        value={pdpType} 
                        onChange={(e) => setPdpType(e.target.value)}
                        options={PDP_OPTIONS}
                    />
                </FormRow>
              </>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-12 mt-2">
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
