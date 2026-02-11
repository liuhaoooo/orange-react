
import React, { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { SquareSwitch, FormRow, StyledSelect, PrimaryButton } from '../../components/UIComponents';
import { fetchMeshSettings, saveMeshSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useLanguage } from '../../utils/i18nContext';

export const MeshBasicConfigPage: React.FC = () => {
    const { showAlert } = useAlert();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [networkingLoading, setNetworkingLoading] = useState(false);

    // State
    const [meshSwitch, setMeshSwitch] = useState(false);
    const [meshRole, setMeshRole] = useState('0');
    const [curMode, setCurMode] = useState('');
    
    const [isMeshActive, setIsMeshActive] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
                    const isActive = res.mesh_switch === '1';
                    setMeshSwitch(isActive);
                    setIsMeshActive(isActive);
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

    const handleSaveClick = () => {
        if (meshSwitch) {
            setIsConfirmOpen(true);
        } else {
            processSave();
        }
    };

    const processSave = async () => {
        setSaving(true);
        setIsConfirmOpen(false);
        try {
            const payload = {
                mesh_switch: meshSwitch ? '1' : '0',
                mesh_role: meshRole,
                networking: 0
            };
            const res = await saveMeshSettings(payload);
            if (res && (res.success || res.result === 'success')) {
                showAlert('Settings saved successfully.', 'success');
                setIsMeshActive(meshSwitch);
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

    const handleOneClickNetworking = async () => {
        setNetworkingLoading(true);
        try {
            const payload = {
                mesh_switch: meshSwitch ? '1' : '0',
                mesh_role: meshRole,
                networking: 1
            };
            const res = await saveMeshSettings(payload);
            if (res && (res.success || res.result === 'success')) {
                showAlert('One click networking triggered successfully.', 'success');
            } else {
                showAlert('Failed to trigger networking.', 'error');
            }
        } catch (e) {
            console.error("Failed to trigger networking", e);
            showAlert('An error occurred.', 'error');
        } finally {
            setNetworkingLoading(false);
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
                
                <FormRow label="Networking Switch">
                    <SquareSwitch isOn={meshSwitch} onChange={() => setMeshSwitch(!meshSwitch)} />
                </FormRow>

                {meshSwitch && (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100">
                            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                                <label className="font-bold text-sm text-black">Current Role</label>
                            </div>
                            <div className="w-full sm:w-2/3 flex justify-end">
                                <span className="text-sm font-bold text-black">{getRoleLabel(curMode)}</span>
                            </div>
                        </div>

                        <FormRow label="Networking Role">
                            <StyledSelect 
                                value={meshRole}
                                onChange={(e) => setMeshRole(e.target.value)}
                                options={ROLE_OPTIONS}
                            />
                        </FormRow>
                    </>
                )}

                {isMeshActive && (
                    <FormRow label="Operate">
                        <button 
                            onClick={handleOneClickNetworking}
                            disabled={networkingLoading}
                            className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2 px-6 text-sm transition-all rounded-[2px] shadow-sm whitespace-nowrap flex items-center"
                        >
                            {networkingLoading && <Loader2 className="animate-spin w-4 h-4 me-2" />}
                            One click networking
                        </button>
                    </FormRow>
                )}

                <div className="flex justify-end pt-12 mt-2">
                    <PrimaryButton 
                        onClick={handleSaveClick}
                        loading={saving}
                        icon={<Save size={18} />}
                    >
                        Save
                    </PrimaryButton>
                </div>

            </div>

            <ConfirmModal 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={processSave}
                title="Warning"
                message="After MESH is enabled, the WPS function will not be used"
                isLoading={saving}
            />
        </div>
    );
};
