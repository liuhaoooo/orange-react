import React, { useState, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchLockBandSettings, saveLockBandSettings, LockBandSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

// Custom Checkbox
const BandCheckbox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <div 
    className="flex items-center cursor-pointer select-none group"
    onClick={onChange}
  >
    <div className={`w-5 h-5 border flex items-center justify-center me-3 transition-colors rounded-[2px] ${checked ? 'bg-[#333] border-[#333]' : 'border-gray-200 bg-white group-hover:border-gray-300'}`}>
       {checked && <Check size={14} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-sm text-gray-600 font-medium">{label}</span>
  </div>
);

export const LockBandPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Available Bands (derived from all_band_X)
  const [all3g, setAll3g] = useState<string[]>([]);
  const [all4g, setAll4g] = useState<string[]>([]);
  const [all5g, setAll5g] = useState<string[]>([]);

  // Selected Bands (names of checked bands)
  const [sel3g, setSel3g] = useState<string[]>([]);
  const [sel4g, setSel4g] = useState<string[]>([]);
  const [sel5g, setSel5g] = useState<string[]>([]);

  // Switches
  const [sw3g, setSw3g] = useState(false);
  const [sw4g, setSw4g] = useState(false);
  const [sw5g, setSw5g] = useState(false);

  // Helper: Convert Hex String to Band Array
  // Logic: "Read from back (right), 1st bit=1 -> Band1, 2nd bit=1 -> Band2..."
  const hexToBands = (hex?: string): string[] => {
    if (!hex || hex === '0') return [];
    try {
        let n = BigInt('0x' + hex);
        const bands: string[] = [];
        let index = 1;
        while (n > 0n) {
            if ((n & 1n) === 1n) {
                bands.push(`Band${index}`);
            }
            n >>= 1n;
            index++;
        }
        // Sort numerically
        return bands.sort((a, b) => {
            const numA = parseInt(a.replace('Band', ''));
            const numB = parseInt(b.replace('Band', ''));
            return numA - numB;
        });
    } catch (e) {
        console.error("Hex parse error for", hex, e);
        return [];
    }
  };

  // Helper: Convert Band Array to Hex String
  const bandsToHex = (bands: string[]): string => {
    if (bands.length === 0) return "0";
    let n = 0n;
    bands.forEach(band => {
        const num = parseInt(band.replace('Band', ''), 10);
        if (!isNaN(num) && num > 0) {
            n |= (1n << BigInt(num - 1));
        }
    });
    return n.toString(16).toUpperCase();
  };

  useEffect(() => {
    const init = async () => {
        try {
            const res = await fetchLockBandSettings();
            if (res && (res.success || res.success === undefined)) {
                // Parse Available Bands
                setAll3g(hexToBands(res.all_band_3g));
                setAll4g(hexToBands(res.all_band_4g));
                setAll5g(hexToBands(res.all_band_5g));

                // Parse Selected Bands
                // If lock_band_X is present, it defines selection. If missing/empty but switch is off, usually implies default or all.
                // We use hexToBands on lock_band_X
                setSel3g(hexToBands(res.lock_band_3g || res.all_band_3g));
                setSel4g(hexToBands(res.lock_band_4g || res.all_band_4g));
                setSel5g(hexToBands(res.lock_band_5g || res.all_band_5g));

                // Parse Switches
                setSw3g(res.band_3g_switch === '1');
                setSw4g(res.band_4g_switch === '1');
                setSw5g(res.band_5g_switch === '1');
            }
        } catch (e) {
            console.error("Failed to fetch lock band settings", e);
            showAlert("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };
    init();
  }, [showAlert]);

  const toggleBand = (band: string, currentList: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentList.includes(band)) {
        setter(currentList.filter(b => b !== band));
    } else {
        setter([...currentList, band]);
    }
  };

  const handleSave = async () => {
      setSaving(true);
      
      const payload: Partial<LockBandSettings> = {
          band_3g_switch: sw3g ? '1' : '0',
          band_4g_switch: sw4g ? '1' : '0',
          band_5g_switch: sw5g ? '1' : '0',
          
          lock_band_3g: bandsToHex(sel3g),
          lock_band_4g: bandsToHex(sel4g),
          lock_band_5g: bandsToHex(sel5g)
      };

      try {
          const res = await saveLockBandSettings(payload);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully.', 'success');
          } else {
              showAlert('Failed to save settings.', 'error');
          }
      } catch (e) {
          console.error("Failed to save lock band", e);
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
      
      {/* 3G Section */}
      {all3g.length > 0 && (
      <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
             <label className="font-bold text-sm text-black">3G lock band switch</label>
             <SquareSwitch isOn={sw3g} onChange={() => setSw3g(!sw3g)} />
          </div>
          
          {sw3g && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-sm text-black mb-6">3G band</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    {all3g.map(band => (
                        <BandCheckbox 
                            key={band} 
                            label={band} 
                            checked={sel3g.includes(band)} 
                            onChange={() => toggleBand(band, sel3g, setSel3g)} 
                        />
                    ))}
                </div>
              </div>
          )}
      </div>
      )}

      {/* 4G Section */}
      {all4g.length > 0 && (
      <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
             <label className="font-bold text-sm text-black">4G lock band switch</label>
             <SquareSwitch isOn={sw4g} onChange={() => setSw4g(!sw4g)} />
          </div>
          
          {sw4g && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-sm text-black mb-6">4G frequency band</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    {all4g.map(band => (
                        <BandCheckbox 
                            key={band} 
                            label={band} 
                            checked={sel4g.includes(band)} 
                            onChange={() => toggleBand(band, sel4g, setSel4g)} 
                        />
                    ))}
                </div>
              </div>
          )}
      </div>
      )}

      {/* 5G Section */}
      {all5g.length > 0 && (
      <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
             <label className="font-bold text-sm text-black">5G lock band switch</label>
             <SquareSwitch isOn={sw5g} onChange={() => setSw5g(!sw5g)} />
          </div>
          
          {sw5g && (
              <div className="animate-fade-in">
                <h3 className="font-bold text-sm text-black mb-6">5G frequency band</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    {all5g.map(band => (
                        <BandCheckbox 
                            key={band} 
                            label={band} 
                            checked={sel5g.includes(band)} 
                            onChange={() => toggleBand(band, sel5g, setSel5g)} 
                        />
                    ))}
                </div>
              </div>
          )}
      </div>
      )}

      {/* Footer Actions */}
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