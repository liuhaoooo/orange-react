
import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2, Save } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchMeshSettings, saveMeshSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const FormRow = ({ label, children, required = false }: { label: string; children?: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0 self-start sm:self-center">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-red-500 me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3 flex justify-end">
      {children}
    </div>
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { label: string, value: string }[] }) => (
  <div className="relative w-full sm:w-2/3">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

export const MeshBasicConfigPage: React.FC = () => {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // State
    const [meshSwitch, setMeshSwitch] = useState(false);
    const [meshRole, setMeshRole] = useState('0');
    const [curMode, setCurMode] = useState('');

    const ROLE_OPTIONS = [
        { label: "Auto", value: "0" },
        { label: "Master Role", value: "1" },
        { label: "Slave Role", value: "2" },
    ];

    const getRoleLabel = (val: string) => {
        const opt = ROLE_OPTIONS.find(o => o.value === val);
        return opt ? opt.label : 'Unknown';
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchMeshSettings();
                if (res && (res.success || res.cmd === 314)) {
                    setMeshSwitch(res.mesh_switch === '1');
                    setMeshRole(res.mesh_role || '0');
                    setCurMode(res.curMode || '0');
                }
            } catch (e) {
                console.error("Failed to fetch Mesh settings", e);
                showAlert('Failed to load settings.', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [showAlert]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                mesh_switch: meshSwitch ? '1' : '0',
                mesh_role: meshRole
            };
            const res = await saveMeshSettings(payload);
            if (res && (res.success || res.result === 'success')) {
                showAlert('Settings saved successfully.', 'success');
            } else {
                showAlert('Failed to save settings.', 'error');
            }
        } catch (e) {
            console.error("Failed to save Mesh settings", e);
            showAlert('An error occurred.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleOneClickNetworking = () => {
        // No specific CMD provided for this button, placeholder for UI completeness
        showAlert('One click networking triggered.', 'info');
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
                
                {/* Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100">
                    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                        <label className="font-bold text-sm text-black">Networking Switch</label>
                    </div>
                    <div className="w-full sm:w-2/3 flex justify-end">
                        <SquareSwitch isOn={meshSwitch} onChange={() => setMeshSwitch(!meshSwitch)} />
                    </div>
                </div>

                {/* Conditional Fields */}
                {meshSwitch && (
                    <>
                        {/* Current Role - Read Only */}
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100">
                            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                                <label className="font-bold text-sm text-black">Current Role</label>
                            </div>
                            <div className="w-full sm:w-2/3 flex justify-end">
                                <span className="text-sm font-bold text-black">{getRoleLabel(curMode)}</span>
                            </div>
                        </div>

                        {/* Networking Role */}
                        <FormRow label="Networking Role">
                            <StyledSelect 
                                value={meshRole}
                                onChange={(e) => setMeshRole(e.target.value)}
                                options={ROLE_OPTIONS}
                            />
                        </FormRow>

                        {/* Operate Button */}
                        <FormRow label="Operate">
                            <button 
                                onClick={handleOneClickNetworking}
                                className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2 px-6 text-sm transition-all rounded-[2px] shadow-sm whitespace-nowrap"
                            >
                                One click networking
                            </button>
                        </FormRow>
                    </>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-12 mt-2">
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
