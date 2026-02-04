
import React, { useState, useEffect } from 'react';
import { SquareSwitch } from '../../components/UIComponents';
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
    
    // activeEnabled: State from server (controls visibility of bottom section)
    const [activeEnabled, setActiveEnabled] = useState(false);
    // draftEnabled: State of the switch UI
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
                // Dynamically select key based on band
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
            // 1. Check Wifi Status (CMD 417)
            const statusRes = await checkWifiStatus();
            // If wifiStatus is NOT '1', it means restarting
            if (statusRes && statusRes.wifiStatus !== '1') {
                showAlert('Wi-Fi is restarting, please try again later.', 'warning');
                setSaving(false);
                return;
            }

            // 2. Save Setting
            const res = await saveWpsSettings(subcmd, draftEnabled);
            if (res && (res.success || res.result === 'success')) {
                showAlert('Settings saved successfully', 'success');
                // 3. Update active state to reflect visibility changes
                setActiveEnabled(draftEnabled);
            } else {
                showAlert('Failed to save settings', 'error');
                // Revert draft to active on failure? Or keep it? keeping it allows retry.
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
        
        // Inline Validation
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
            // PIN Subcmd: 0 for 2.4G, 1 for 5G. Matches prop subcmd.
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
        // PBC Subcmd: 2 for 2.4G, 3 for 5G
        // prop subcmd: 0 for 2.4G, 1 for 5G
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
            
            {/* WPS Switch Section */}
            <div className="flex items-center justify-between mb-6">
                <label className="font-bold text-sm text-black">WPS function switch</label>
                <div className="flex justify-end w-full sm:w-auto">
                    <SquareSwitch isOn={draftEnabled} onChange={() => setDraftEnabled(!draftEnabled)} />
                </div>
            </div>
            
            {/* Save Button for Switch */}
            <div className="flex justify-end mb-12">
                <button 
                    onClick={handleSaveSwitch}
                    disabled={saving}
                    className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
                >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                </button>
            </div>

            {/* Conditional Content - Visibility controlled by activeEnabled (server state) */}
            {activeEnabled && (
                <div className="animate-fade-in">
                    {/* PIN Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start mb-6">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0 pt-2">
                            <label className="font-bold text-sm text-black">
                                <span className="text-red-500 me-1">*</span>WPSPIN
                            </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                            <input 
                                type="text" 
                                value={pin}
                                onChange={(e) => {
                                    setPin(e.target.value);
                                    if(pinError) setPinError('');
                                }}
                                maxLength={8}
                                placeholder="8 digits"
                                className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${pinError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                            />
                            {pinError && (
                                <p className="text-red-500 text-xs mt-1 font-bold">{pinError}</p>
                            )}
                        </div>
                    </div>

                    {/* Application Button for PIN */}
                    <div className="flex justify-end mb-12">
                        <button 
                            onClick={handleApplyPin}
                            disabled={applyingPin}
                            className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
                        >
                            {applyingPin ? <Loader2 className="animate-spin w-4 h-4" /> : 'Application'}
                        </button>
                    </div>

                    {/* PBC Section */}
                    <div className="flex items-center justify-between mt-4">
                        <label className="font-bold text-sm text-black">Start PBC</label>
                        <button 
                            onClick={handleStartPbc}
                            className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
                        >
                            Start PBC
                        </button>
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
