import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchUpnpSettings, saveUpnpSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, SquareSwitch } from '../../components/UIComponents';

export const UpnpPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUpnpSettings();
        if (res && (res.success || res.cmd === 333)) {
          setEnabled(res.upnpSwitch === '1');
        }
      } catch (e) {
        console.error("Failed to load UPnP settings", e);
        showAlert('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showAlert]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveUpnpSettings(enabled ? '1' : '0');
      if (res && (res.success || res.cmd === 333)) {
        showAlert('Settings saved successfully', 'success');
      } else {
        showAlert('Failed to save settings', 'error');
      }
    } catch (e) {
      console.error(e);
      showAlert('An error occurred', 'error');
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
    <div className="w-full animate-fade-in py-6">
      <div className="w-full">
        <FormRow label="UPnP Status">
          <SquareSwitch 
            isOn={enabled} 
            onChange={() => setEnabled(!enabled)} 
          />
        </FormRow>

        <div className="flex justify-end mt-12">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
          >
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
