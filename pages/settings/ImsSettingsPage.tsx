
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { fetchImsSettings, saveImsSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { SquareSwitch, FormRow, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';

const PDP_OPTIONS = [
    { name: 'IPV4', value: 'IP' },
    { name: 'IPV6', value: 'IPV6' },
    { name: 'IPV4&V6', value: 'IPV4V6' },
];

export const ImsSettingsPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { globalData } = useGlobalState();
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

  const getVoipRegStatusText = (code: string) => {
    const statusMap: { [key: string]: string } = {
      "0": "Unregistered",
      "1": "Registering",
      "2": "Registration Failed",
      "3": "Registered",
      "400": "Registration Failed: Bad Request (400)",
      "401": "Registration failed: not authorized, the request requires user authentication (401)",
      "403": "Registration Failed: Forbidden (403)",
      "404": "Registration Failed: NotFound (404)",
      "406": "Registration Failed: Unacceptable (406)",
      "407": "Registration failed: proxy authentication is not required (407)",
      "408": "Registration failed: The request timed out and the user could not be found in time (408)",
      "409": "Registration failed: conflict, user is already registered (409)",
      "410": "Registration failed: disappeared, the user used to exist, but is no longer available here (410)",
      "411": "Registration failed: The server requires a valid content length (411)",
      "413": "Registration failed: the request entity is too large (413)",
      "414": "Registration failed: request URI is too long (414)",
      "415": "Registration failed: unsupported media type (415)",
      "417": "Registration failed: Unknown resource priority (417)",
      "480": "Registration Failed: Temporarily Unavailable (480)",
      "481": "Registration failed: call/transaction does not exist (481)",
      "486": "Registration failed: device is busy (486)",
      "487": "Registration failed: the request has been terminated (487)",
      "488": "Registration failed: not accepted here (488)",
      "50": "Failed to initialize PCM",
      "500": "Registration failed: server internal error (500)",
      "501": "Registration Failed: Not Implemented (501)",
      "502": "Registration Failed: Gateway Error (502)",
      "503": "Registration Failed: Service Unavailable (503)",
      "504": "Registration failed: server timed out (504)",
      "505": "Registration failed: version not supported (505)",
      "51": "SIM Card Not Detected",
      "513": "Registration failed: The message is too large (513)",
      "52": "Failed to set server parameters",
      "53": "Failed to set account parameters",
      "54": "Failed to initialize sound card",
      "55": "Failed to set the ring type",
      "56": "DNS Resolution Failed",
      "57": "Factory Mode",
      "58": "Data Link Disconnected"
    };
    return statusMap[code] || "Unknown error";
  };

  const getVoipAuthStatusText = (code: string) => {
    const statusMap: { [key: string]: string } = {
      "0": "Unauthorized",
      "1": "Authorized",
      "2": "Unauthorized Device",
      "3": "Authorization Failed: No Version File",
      "4": "Authorization failed: SIP program not found"
    };
    return statusMap[code] || "Unknown error";
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
                    <span className="text-black text-sm font-medium">{getVoipRegStatusText(globalData.statusInfo?.voipRegStatus || '')}</span>
                </FormRow>

                <FormRow label="Authorization Status">
                    <span className="text-black text-sm font-medium">{getVoipAuthStatusText(globalData.statusInfo?.voipAuthStatus || '')}</span>
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
