
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Save } from 'lucide-react';
import { SquareSwitch, FormRow, StyledSelect, StyledInput, PrimaryButton, TabToggle } from '../../components/UIComponents';
import { fetchWifiAdvanced, saveWifiAdvanced, checkWifiStatus } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { useGlobalState } from '../../utils/GlobalStateContext';

interface WifiAdvancedPanelProps {
    cmd: number; // 230 for 2.4G, 231 for 5G
    is5g: boolean;
}

export const WifiAdvancedPanel: React.FC<WifiAdvancedPanelProps> = ({ cmd, is5g }) => {
    const { showAlert } = useAlert();
    const { globalData } = useGlobalState();
    const globalConfig = globalData.globalConfig || {};

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // API Data Mappings
    const [dfsSwitch, setDfsSwitch] = useState(false); 
    const [txPower, setTxPower] = useState('100'); 
    const [countryCode, setCountryCode] = useState('FR'); 
    const [channel, setChannel] = useState('auto'); 
    const [wifiWorkMode, setWifiWorkMode] = useState('16'); 
    const [bandWidth, setBandWidth] = useState('2'); 
    const [maxNum, setMaxNum] = useState('32'); 
    const [wifiPMF, setWifiPMF] = useState('0'); 
    
    // Validation Limits
    const [limitMaxNum, setLimitMaxNum] = useState(32);
    const [maxNumError, setMaxNumError] = useState('');

    const [rawData, setRawData] = useState<any>({});

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cmd]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchWifiAdvanced(cmd);
            if (res && (res.success || res.cmd === cmd)) {
                setRawData(res);
                setTxPower(res.txPower || '100');
                setCountryCode(res.countryCode || 'FR');
                setChannel(res.channel || 'auto');
                setWifiWorkMode(res.wifiWorkMode || '16');
                setBandWidth(res.bandWidth || '2');
                setMaxNum(res.maxNum || '32');
                setWifiPMF(res.wifiPMF || '0');
                
                let limitStr = '32';
                if (is5g) {
                    limitStr = res.maxNumLimit || '32';
                } else {
                    limitStr = res.maxNum24Limit || '32';
                }
                setLimitMaxNum(parseInt(limitStr, 10));
                
                if (is5g && res.dfsSwitch) {
                    setDfsSwitch(res.dfsSwitch === '1');
                }
            }
        } catch (e) {
            console.error("Failed to load advanced settings", e);
            showAlert("Failed to load settings", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setMaxNumError('');
        
        const currentMax = parseInt(maxNum, 10);
        if (isNaN(currentMax) || currentMax < 1 || currentMax > limitMaxNum) {
            setMaxNumError(`Max Station must be between 1 and ${limitMaxNum}.`);
            return;
        }

        setSaving(true);
        try {
            const statusRes = await checkWifiStatus();
            if (statusRes && statusRes.wifiStatus !== '1') {
                showAlert('Wi-Fi is restarting, please try again later.', 'warning');
                setSaving(false);
                return;
            }

            const payload: any = {
                txPower,
                countryCode,
                channel,
                wifiWorkMode,
                bandWidth,
                maxNum,
                wifiPMF,
                wifiOpen: rawData.wifiOpen || '1',
                wifiwmm: rawData.wifiwmm || '1',
                apIsolateSw: rawData.apIsolateSw || '0',
            };

            if (is5g) {
                payload.dfsSwitch = dfsSwitch ? '1' : '0';
            }

            const res = await saveWifiAdvanced(cmd, payload);
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

    const countryOptions = useMemo(() => {
        if (Array.isArray(globalConfig.countryCode)) {
            return globalConfig.countryCode.map((c: any) => ({ label: c.name, value: c.value }));
        }
        return [{ label: 'FRANCE', value: 'FR' }];
    }, [globalConfig.countryCode]);

    const rawChannelList = useMemo(() => {
        if (!globalConfig.countryCode) return [];
        const selectedCountryObj = globalConfig.countryCode.find((c: any) => c.value === countryCode);
        if (!selectedCountryObj) return [];
        const key = is5g ? selectedCountryObj.channel_5g : selectedCountryObj.channel_2g;
        const list = globalConfig[key];
        return Array.isArray(list) ? list : [];
    }, [globalConfig, countryCode, is5g]);

    const channelOptions = useMemo(() => {
        if (rawChannelList.length === 0) return [{ label: 'Auto', value: 'auto' }];
        
        let opts = rawChannelList.map((c: any) => ({ label: c.name, value: c.value }));

        if (is5g && !dfsSwitch) {
            opts = opts.filter((opt: { label: string, value: string }) => !opt.label.toUpperCase().includes('DFS'));
        }

        return opts;
    }, [rawChannelList, is5g, dfsSwitch]);

    useEffect(() => {
        if (!loading && channelOptions.length > 0) {
            const exists = channelOptions.find(opt => opt.value === channel);
            if (!exists) {
                setChannel('auto');
            }
        }
    }, [channelOptions, channel, loading]);

    const currentMaxBw = useMemo(() => {
        const selectedChObj = rawChannelList.find((c: any) => c.value === channel);
        if (selectedChObj && selectedChObj.maxBw !== undefined) {
            return parseInt(selectedChObj.maxBw, 10);
        }
        return null;
    }, [channel, rawChannelList]);

    const configSection = is5g ? globalConfig.wlan_5g : globalConfig.wlan_2g;

    const modeOptions = useMemo(() => {
        if (configSection && Array.isArray(configSection.wifiWorkMode)) {
            return configSection.wifiWorkMode.map((i: any) => ({ label: i.name, value: i.value }));
        }
        return [];
    }, [configSection]);

    const bandwidthOptions = useMemo(() => {
        if (!is5g) {
            if (['0', '1', '3'].includes(wifiWorkMode)) {
                return [{ label: '20MHz', value: '0' }];
            }
        } else {
            if (['2', '7'].includes(wifiWorkMode)) {
                return [{ label: '20MHz', value: '0' }];
            }
            if (['8', '10'].includes(wifiWorkMode)) {
                return [
                    { label: '20MHz', value: '0' },
                    { label: '20MHz/40MHz', value: '1' }
                ];
            }
        }

        if (configSection && Array.isArray(configSection.bandWidth)) {
            let opts = configSection.bandWidth.map((i: any) => ({ label: i.name, value: i.value }));
            
            if (currentMaxBw !== null) {
                opts = opts.filter((bw: any) => {
                    const val = parseInt(bw.value, 10);
                    return !isNaN(val) ? val <= currentMaxBw : true;
                });
            }

            return opts;
        }
        return [];
    }, [configSection, currentMaxBw, wifiWorkMode, is5g]);

    useEffect(() => {
        if (!loading && bandwidthOptions.length > 0) {
            const exists = bandwidthOptions.find(opt => opt.value === bandWidth);
            if (!exists) {
                setBandWidth(bandwidthOptions[0].value);
            }
        }
    }, [bandwidthOptions, bandWidth, loading]);

    const txOptions = useMemo(() => {
        if (configSection && Array.isArray(configSection.txOption)) {
            return configSection.txOption.map((i: any) => ({ label: i.name, value: i.value }));
        }
        return [];
    }, [configSection]);

    const pmfOptions = [
        { label: 'Disable', value: '0' },
        { label: 'Capable', value: '1' },
        { label: 'Required', value: '2' },
    ];

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
                
                {is5g && (
                    <FormRow label="DFS">
                        <SquareSwitch isOn={dfsSwitch} onChange={() => setDfsSwitch(!dfsSwitch)} />
                    </FormRow>
                )}

                <FormRow label="TX Power">
                    <StyledSelect 
                        value={txPower} 
                        onChange={(e) => setTxPower(e.target.value)} 
                        options={txOptions.length > 0 ? txOptions : [{ label: '100%', value: '100' }]} 
                    />
                </FormRow>

                <FormRow label="Wi-Fi Country Code">
                    <StyledSelect 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)} 
                        options={countryOptions} 
                    />
                </FormRow>

                <FormRow label="Channel">
                    <StyledSelect 
                        value={channel} 
                        onChange={(e) => setChannel(e.target.value)} 
                        options={channelOptions} 
                    />
                </FormRow>

                <FormRow label="Wi-Fi Mode">
                    <StyledSelect 
                        value={wifiWorkMode} 
                        onChange={(e) => setWifiWorkMode(e.target.value)} 
                        options={modeOptions.length > 0 ? modeOptions : [{ label: '11b/g/n/ax', value: '16' }]} 
                    />
                </FormRow>

                <FormRow label="BandWidth">
                    <StyledSelect 
                        value={bandWidth} 
                        onChange={(e) => setBandWidth(e.target.value)} 
                        options={bandwidthOptions.length > 0 ? bandwidthOptions : [{ label: '20MHz', value: '0' }]} 
                    />
                </FormRow>

                <FormRow label="Max Station" required error={maxNumError}>
                    <StyledInput 
                        value={maxNum}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setMaxNum(val);
                            setMaxNumError('');
                        }}
                        maxLength={3}
                        hasError={!!maxNumError}
                    />
                </FormRow>

                <FormRow label="PMF">
                    <StyledSelect 
                        value={wifiPMF} 
                        onChange={(e) => setWifiPMF(e.target.value)} 
                        options={pmfOptions} 
                    />
                </FormRow>

                <div className="flex justify-end pt-12 mt-2">
                    <PrimaryButton 
                        onClick={handleSave}
                        loading={saving}
                        icon={<Save size={18} />}
                    >
                        Save
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
};

export const WifiAdvancedSettingsPage: React.FC = () => {
    const [activeBand, setActiveBand] = useState('2.4g');

    return (
        <div className="w-full">
            <div className="mb-6 border-b border-gray-200 pb-2">
                <TabToggle 
                    options={[
                        { label: '2.4GHz', value: '2.4g' },
                        { label: '5GHz', value: '5g' }
                    ]}
                    activeValue={activeBand}
                    onChange={setActiveBand}
                />
            </div>
            
            {activeBand === '2.4g' ? (
                <WifiAdvancedPanel key="2.4g" cmd={230} is5g={false} />
            ) : (
                <WifiAdvancedPanel key="5g" cmd={231} is5g={true} />
            )}
        </div>
    );
};
// Export alias for backward compatibility or routing usage if needed
export const AdvSettings24Page = WifiAdvancedSettingsPage;