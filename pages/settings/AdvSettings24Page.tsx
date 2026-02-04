
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchWifiAdvanced, saveWifiAdvanced, checkWifiStatus } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { useGlobalState } from '../../utils/GlobalStateContext';

const FormRow = ({ label, children, required = false }: { label: string; children?: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-red-500 me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: { label: string, value: string }[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer hover:border-gray-300"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <ChevronDown size={16} />
    </div>
  </div>
);

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
    const [dfsSwitch, setDfsSwitch] = useState(false); // Only for 5G (dfsSwitch)
    const [txPower, setTxPower] = useState('100'); // txPower
    const [countryCode, setCountryCode] = useState('FR'); // countryCode
    const [channel, setChannel] = useState('auto'); // channel
    const [wifiWorkMode, setWifiWorkMode] = useState('16'); // wifiWorkMode
    const [bandWidth, setBandWidth] = useState('2'); // bandWidth
    const [maxNum, setMaxNum] = useState('32'); // maxNum (Max Station)
    const [wifiPMF, setWifiPMF] = useState('0'); // wifiPMF (PMF)

    // Store raw data to preserve other fields if necessary
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
                
                // DFS only available in 5G (cmd 231 usually returns dfsSwitch)
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
        setSaving(true);
        try {
            // 1. Check Wifi Status (CMD 417)
            const statusRes = await checkWifiStatus();
            // If wifiStatus is NOT '1', it means restarting or busy
            if (statusRes && statusRes.wifiStatus !== '1') {
                showAlert('Wi-Fi is restarting, please try again later.', 'warning');
                setSaving(false);
                return;
            }

            // 2. Prepare Payload
            const payload: any = {
                // Merge critical fields
                txPower,
                countryCode,
                channel,
                wifiWorkMode,
                bandWidth,
                maxNum,
                wifiPMF,
                // Preserve hidden fields required by backend usually
                wifiOpen: rawData.wifiOpen || '1',
                wifiwmm: rawData.wifiwmm || '1',
                apIsolateSw: rawData.apIsolateSw || '0',
            };

            // Only add DFS switch for 5G
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

    // --- Dynamic Options Computation from 1017 ---

    // 1. Country Codes
    const countryOptions = useMemo(() => {
        if (Array.isArray(globalConfig.countryCode)) {
            return globalConfig.countryCode.map((c: any) => ({ label: c.name, value: c.value }));
        }
        return [{ label: 'FRANCE', value: 'FR' }]; // Fallback
    }, [globalConfig.countryCode]);

    // 2. Channels (Dependent on Country Code)
    const channelOptions = useMemo(() => {
        // If config not loaded yet, fallback
        if (!globalConfig.countryCode) return [{ label: 'Auto', value: 'auto' }];

        // Find selected country object
        const selectedCountryObj = globalConfig.countryCode.find((c: any) => c.value === countryCode);
        
        if (!selectedCountryObj) return [{ label: 'Auto', value: 'auto' }];

        // Get key based on band (channel_2g or channel_5g from country object)
        const key = is5g ? selectedCountryObj.channel_5g : selectedCountryObj.channel_2g;
        
        // Retrieve list from globalConfig root using the key
        const list = globalConfig[key];
        if (Array.isArray(list)) {
            return list.map((c: any) => ({ label: c.name, value: c.value }));
        }
        
        return [{ label: 'Auto', value: 'auto' }];
    }, [globalConfig, countryCode, is5g]);

    // Ensure selected channel is valid when options change
    useEffect(() => {
        if (!loading && channelOptions.length > 0) {
            const exists = channelOptions.find(opt => opt.value === channel);
            if (!exists) {
                setChannel('auto');
            }
        }
    }, [channelOptions, channel, loading]);

    // 3. Wi-Fi Mode, Bandwidth, TX Power
    const configSection = is5g ? globalConfig.wlan_5g : globalConfig.wlan_2g;

    const modeOptions = useMemo(() => {
        if (configSection && Array.isArray(configSection.wifiWorkMode)) {
            return configSection.wifiWorkMode.map((i: any) => ({ label: i.name, value: i.value }));
        }
        return [];
    }, [configSection]);

    const bandwidthOptions = useMemo(() => {
        if (configSection && Array.isArray(configSection.bandWidth)) {
            return configSection.bandWidth.map((i: any) => ({ label: i.name, value: i.value }));
        }
        return [];
    }, [configSection]);

    const txOptions = useMemo(() => {
        if (configSection && Array.isArray(configSection.txOption)) {
            return configSection.txOption.map((i: any) => ({ label: i.name, value: i.value }));
        }
        return [];
    }, [configSection]);

    // 6. PMF Options (Fixed)
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
                
                {/* DFS Switch - Only for 5G */}
                {is5g && (
                    <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100">
                        <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                            <label className="font-bold text-sm text-black">DFS</label>
                        </div>
                        <div className="w-full sm:w-2/3 flex justify-end">
                            <SquareSwitch isOn={dfsSwitch} onChange={() => setDfsSwitch(!dfsSwitch)} />
                        </div>
                    </div>
                )}

                {/* Removed colons from labels as requested */}
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

                <FormRow label="Max Station" required>
                    <input 
                        type="text" 
                        value={maxNum}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setMaxNum(val);
                        }}
                        className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-300"
                        maxLength={3}
                    />
                </FormRow>

                <FormRow label="PMF">
                    <StyledSelect 
                        value={wifiPMF} 
                        onChange={(e) => setWifiPMF(e.target.value)} 
                        options={pmfOptions} 
                    />
                </FormRow>

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

export const AdvSettings24Page: React.FC = () => {
  // CMD 230 for 2.4G, is5g=false removes DFS switch
  return <WifiAdvancedPanel cmd={230} is5g={false} />;
};
