
import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { fetchNetworkMode, setNetworkMode } from '../../../utils/api';
import { useAlert } from '../../../utils/AlertContext';

const NETWORK_MODES = [
    { name: '2G Only', value: '1'},
    { name: '3G Only', value: '2'},
    { name: '3G/2G', value: '3'},
    { name: '4G Only', value: '4'},
    { name: '4G TDD Only', value: '40'},
    { name: '4G FDD Only', value: '20'},
    { name: '4G/3G', value: '6'},
    { name: '4G/3G/2G', value: '7'},
    { name: '5G NSA Only', value: 'C'},
    { name: '5G SA Only', value: '10' },
    { name: '5G (SA+NSA)/4G', value: '1C' },
    { name: '5G NSA/4G/3G', value: 'E'},
    { name: '5G NSA/4G/3G/2G', value: 'F' },
    { name: '5G SA+NSA/4G/3G', value: '1E'},
    { name: '5G SA+NSA/4G/3G/2G', value: '1F'},
];

export const NetworkModePage: React.FC = () => {
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
      const loadData = async () => {
          try {
              const res = await fetchNetworkMode();
              if (res && res.success) {
                  // If returned mode is not in list, maybe default to something or just set it
                  // We set it directly, select will show empty if not found, but API returns standard values
                  setMode(res.networkMode);
              }
          } catch (e) {
              console.error("Failed to fetch network mode", e);
          } finally {
              setLoading(false);
          }
      };
      loadData();
  }, []);

  const handleSave = async () => {
      setSaving(true);
      try {
          const res = await setNetworkMode(mode);
          if (res && res.success) {
              showAlert('Settings saved successfully.', 'success');
          } else {
              showAlert('Failed to save settings.', 'error');
          }
      } catch (e) {
          console.error("Failed to set network mode", e);
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
      {/* Form Section */}
      <div className="space-y-0.5">
          <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
             <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                <label className="font-bold text-sm text-black">Network Mode</label>
             </div>
             <div className="w-full sm:w-2/3">
                 <div className="relative w-full">
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full border border-black px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer font-medium"
                    >
                        {NETWORK_MODES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-black">
                        <ChevronDown size={16} strokeWidth={3} />
                    </div>
                 </div>
             </div>
          </div>
       </div>

       {/* Footer Actions */}
       <div className="flex justify-end pt-8">
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
  );
};
