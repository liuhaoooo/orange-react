import React, { useState, useEffect } from 'react';
import { Edit2, Save, Check, X, Loader2 } from 'lucide-react';
import { fetchMultipleApnSettings, saveMultipleApnSettings, MultipleApnResponse } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

// Custom switch to match the specific black/white style in the provided design
const BlackSquareSwitch = ({ isOn, onChange }: { isOn: boolean; onChange: () => void }) => (
  <div 
    className="flex border border-black w-14 h-8 cursor-pointer select-none"
    onClick={onChange}
  >
    <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-black text-white' : 'bg-white'}`}>
      {isOn && <Check size={18} strokeWidth={3} />}
    </div>
    <div className={`flex-1 flex items-center justify-center transition-colors ${!isOn ? 'bg-black text-white' : 'bg-white'}`}>
      {!isOn && <X size={18} strokeWidth={3} />}
    </div>
  </div>
);

interface ApnRow {
    id: string;
    isActive: boolean;
    apn: string;
    configName: string;
    profileName: string;
}

export const MultipleApnPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ApnRow[]>([]);
  // Keep raw response to merge back on save to preserve hidden fields
  const [rawData, setRawData] = useState<MultipleApnResponse | null>(null);

  useEffect(() => {
    const load = async () => {
        try {
            const res = await fetchMultipleApnSettings();
            if (res && (res.success || res.success === undefined)) {
                setRawData(res);
                const count = parseInt(res.multiApnNum || '0', 10);
                const rows: ApnRow[] = [];
                
                for (let i = 1; i <= count; i++) {
                    rows.push({
                        id: i.toString(),
                        isActive: res[`apnSwitch${i}`] === '1',
                        apn: i.toString(), // "APN为行的序号" -> APN is the row index
                        configName: res[`apnProfileName${i}`] || '',
                        profileName: res[`apnName${i}`] || ''
                    });
                }
                setData(rows);
            } else {
                showAlert('Failed to load data', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Error loading APN settings', 'error');
        } finally {
            setLoading(false);
        }
    };
    load();
  }, [showAlert]);

  const toggleSwitch = (id: string) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          const payload: Record<string, any> = { ...rawData };
          
          // Update switches in payload based on current UI state
          data.forEach(row => {
              const idx = row.id;
              payload[`apnSwitch${idx}`] = row.isActive ? '1' : '0';
              // Note: configName and profileName are displayed but typically managed via Edit logic.
              // Assuming for "display & save" we mostly persist the switch state here.
          });

          const res = await saveMultipleApnSettings(payload);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully', 'success');
          } else {
              showAlert('Failed to save settings', 'error');
          }
      } catch (e) {
          console.error(e);
          showAlert('Error saving settings', 'error');
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
    <div className="w-full animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 pe-4 font-bold text-black text-sm w-[120px]">APN switch</th>
              <th className="py-4 px-4 font-bold text-black text-sm w-[100px]">APN</th>
              <th className="py-4 px-4 font-bold text-black text-sm">Configuration name</th>
              <th className="py-4 px-4 font-bold text-black text-sm">Profile Name</th>
              <th className="py-4 ps-4 w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="py-3 pe-4">
                  <BlackSquareSwitch isOn={row.isActive} onChange={() => toggleSwitch(row.id)} />
                </td>
                <td className="py-3 px-4 text-sm text-black font-medium">{row.apn}</td>
                <td className="py-3 px-4 text-sm text-black font-medium">{row.configName}</td>
                <td className="py-3 px-4 text-sm text-black font-medium">{row.profileName}</td>
                <td className="py-3 ps-4 text-end">
                  <button className="text-gray-500 hover:text-black transition-colors p-1" title="Edit">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">No Data Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end pt-8 mt-4 border-t border-gray-200">
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