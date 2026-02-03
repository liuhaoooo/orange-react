
import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Loader2 } from 'lucide-react';
import { fetchSimCardType, setSimCardType } from '../../../utils/services/simService';
import { useAlert } from '../../../utils/AlertContext';

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
      <label className="font-bold text-sm text-black">{label}</label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { name: string, value: string }[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const SimSwitchingPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [simCardType, setSimCardTypeState] = useState('0'); // Default '0' (External)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const OPTIONS = [
    { name: 'External SIM card', value: '0' },
    { name: 'Built-in SIM card', value: '1' },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchSimCardType();
        if (res && (res.success || res.success === undefined)) {
          // API returns current_card_type
          if (res.current_card_type) {
            setSimCardTypeState(res.current_card_type);
          }
        }
      } catch (e) {
        console.error("Failed to fetch SIM card type", e);
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
      const res = await setSimCardType(simCardType);
      if (res && (res.success || res.message === 'success' || res.result === 'success')) {
        showAlert('Settings saved successfully.', 'success');
      } else {
        showAlert('Failed to save settings.', 'error');
      }
    } catch (e) {
      console.error("Failed to set SIM card type", e);
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
      <FormRow label="SIM card switching">
          <StyledSelect 
            value={simCardType} 
            onChange={(e) => setSimCardTypeState(e.target.value)} 
            options={OPTIONS} 
          />
      </FormRow>

      <div className="flex justify-end pt-12 mt-4">
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
