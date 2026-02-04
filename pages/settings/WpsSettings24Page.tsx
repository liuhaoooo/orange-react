
import React, { useState, useEffect } from 'react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchWpsSettings, saveWpsSettings, startWpsPbc } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { Loader2 } from 'lucide-react';

interface WpsSettingsPanelProps {
    subcmd: number;
}

export const WpsSettingsPanel: React.FC<WpsSettingsPanelProps> = ({ subcmd }) => {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [wpsEnabled, setWpsEnabled] = useState(false);
    const [pin, setPin] = useState('');

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subcmd]);

    const loadData = async () => {
        try {
            const res = await fetchWpsSettings(subcmd);
            if (res && (res.success || res.cmd === 132)) {
                // Dynamically select key based on band
                const key = subcmd === 0 ? 'wlan2g_wps_switch' : 'wlan5g_wps_switch';
                setWpsEnabled(res[key] === '1');
            }
        } catch (e) {
            console.error("Failed to load WPS settings", e);
            showAlert("Failed to load settings", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await saveWpsSettings(subcmd, wpsEnabled);
            if (res && (res.success || res.result === 'success')) {
                showAlert('Settings saved successfully', 'success');
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

    const handleStartPbc = async () => {
        // subcmd 0 (2.4G) -> send 2
        // subcmd 1 (5G) -> send 3
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
                    <SquareSwitch isOn={wpsEnabled} onChange={() => setWpsEnabled(!wpsEnabled)} />
                </div>
            </div>
            
            {/* Save Button for Switch */}
            <div className="flex justify-end mb-12">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
                >
                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
                </button>
            </div>

            {/* Conditional Content */}
            {wpsEnabled && (
                <div className="animate-fade-in">
                    {/* PIN Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                            <label className="font-bold text-sm text-black">
                                <span className="text-red-500 me-1">*</span>WPSPIN
                            </label>
                        </div>
                        <div className="w-full sm:w-2/3">
                            <input 
                                type="text" 
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white"
                            />
                        </div>
                    </div>

                    {/* Application Button for PIN */}
                    <div className="flex justify-end mb-12">
                        <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                            Application
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
