
import React, { useState, useEffect } from 'react';
import { SquareSwitch, FormRow, StyledInput, PrimaryButton } from '../../components/UIComponents';
import { fetchWpsSettings, saveWpsSettings, startWpsPbc, setWpsPin, checkWifiStatus } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { Loader2 } from 'lucide-react';

interface WpsSettingsPanelProps {
    subcmd: number; // 0 for 2.4G, 1 for 5G (Settings/PIN)
}

export const WpsSettingsPanel: React.FC<WpsSettingsPanelProps> = ({ subcmd }) => {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [applyingPin, setApplyingPin] = useState(false);
    
    const [activeEnabled, setActiveEnabled] = useState(false);
    const [draftEnabled, setDraftEnabled] = useState(false);
    
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subcmd]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchWpsSettings(subcmd);
            if (res && (res.success || res.cmd === 132)) {
                const key = subcmd === 0 ? 'wlan2g_wps_switch' : 'wlan5g_wps_switch';
                const isEnabled = res[key] === '1';
                setDraftEnabled(isEnabled);
                setActiveEnabled(isEnabled);
            }
        } catch (e) {
            console.error("Failed to load WPS settings", e);
            showAlert("Failed to load settings", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSwitch = async () => {
        setSaving(true);
        try {
            const statusRes = await checkWifiStatus();
            if (statusRes && statusRes.wifiStatus !== '1') {
                showAlert('Wi-Fi is restarting, please try again later.', 'warning');
                setSaving(false);
                return;
            }

            const res = await saveWpsSettings(subcmd, draftEnabled);
            if (res && (res.success || res.result === 'success')) {
                showAlert('Settings saved successfully', 'success');
                setActiveEnabled(draftEnabled);
            } else {
                showAlert('Failed to save settings', 'error');
            }
        } catch(e) {
            console.error(e);
            showAlert('Error saving settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleApplyPin = async () => {
        setPinError('');
        
        if (!pin) {
            setPinError('PIN cannot be empty');
            return;
        }
        if (!/^\d{8}$/.test(pin)) {
            setPinError('WPS PIN must be 8 digits');
            return;
        }

        setApplyingPin(true);
        try {
            const res = await setWpsPin(subcmd, pin);
            if (res && (res.success || res.result === 'success')) {
                showAlert('PIN applied successfully', 'success');
                setPin(''); 
            } else {
                showAlert('Failed to apply PIN', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Error applying PIN', 'error');
        } finally {
            setApplyingPin(false);
        }
    };

    const handleStartPbc = async () => {
        const pbcSubcmd = subcmd === 0 ? 2 : 3;
        try {
            const res = await startWpsPbc(pbcSubcmd);
            if (res && (res.success || res.result === 'success')) {
                showAlert('PBC started successfully', 'success');
            } else {
                showAlert('Failed to start PBC', 'error');
            }
        } catch (e) {
            console.error(e);
            showAlert('Error starting PBC', 'error');
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
            
            <div className="flex items-center justify-between mb-6">
                <label className="font-bold text-sm text-black">WPS function switch</label>
                <div className="flex justify-end w-full sm:w-auto">
                    <SquareSwitch isOn={draftEnabled} onChange={() => setDraftEnabled(!draftEnabled)} />
                </div>
            </div>
            
            <div className="flex justify-end mb-12">
                <PrimaryButton 
                    onClick={handleSaveSwitch}
                    loading={saving}
                    className="bg-[#eeeeee] border-black text-black hover:bg-white"
                >
                    Save
                </PrimaryButton>
            </div>

            {activeEnabled && (
                <div className="animate-fade-in">
                    <FormRow label="WPSPIN" required alignTop>
                        <div className="flex gap-4 w-full">
                            <div className="flex-1">
                                <StyledInput 
                                    value={pin}
                                    onChange={(e) => {
                                        setPin(e.target.value);
                                        if(pinError) setPinError('');
                                    }}
                                    maxLength={8}
                                    placeholder="8 digits"
                                    hasError={!!pinError}
                                />
                                {pinError && (
                                    <p className="text-red-500 text-xs mt-1 font-bold">{pinError}</p>
                                )}
                            </div>
                            <PrimaryButton 
                                onClick={handleApplyPin}
                                loading={applyingPin}
                                className="bg-[#eeeeee] border-black text-black hover:bg-white h-[40px]"
                            >
                                Application
                            </PrimaryButton>
                        </div>
                    </FormRow>

                    <div className="flex items-center justify-between mt-4">
                        <label className="font-bold text-sm text-black">Start PBC</label>
                        <PrimaryButton 
                            onClick={handleStartPbc}
                            className="bg-[#eeeeee] border-black text-black hover:bg-white"
                        >
                            Start PBC
                        </PrimaryButton>
                    </div>
                </div>
            )}

        </div>
    );
};

export const WpsSettings24Page: React.FC = () => {
    // subcmd 0 for 2.4G
    return <WpsSettingsPanel subcmd={0} />;
};
