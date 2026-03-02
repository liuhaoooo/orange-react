import React, { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { UrlLimitRule, fetchUrlLimitRules, saveUrlLimitRules, applyUrlLimitSettings, fetchParentalModeSettings } from '../../utils/api';
import { UrlLimitEditModal } from '../../components/UrlLimitEditModal';
import { useAlert } from '../../utils/AlertContext';
import { SquareSwitch } from '../../components/UIComponents';
import { useGlobalState } from '../../utils/GlobalStateContext';

export const UrlLimitPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { globalData } = useGlobalState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<UrlLimitRule[]>([]);
  const [parentalModeEnabled, setParentalModeEnabled] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [prefilledMacs, setPrefilledMacs] = useState<string[]>([]);

  // Connected Devices State
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const connectedDevices = (globalData.statusInfo?.dhcp_list_info || []) as Array<{
    mac: string;
    hostname: string;
  }>;

  useEffect(() => {
    const load = async () => {
      try {
        const [parentalRes, rulesRes] = await Promise.all([
          fetchParentalModeSettings(),
          fetchUrlLimitRules()
        ]);
        
        if (parentalRes && (parentalRes.success || parentalRes.cmd === 391)) {
          setParentalModeEnabled(parentalRes.enable === '1');
        }

        if (rulesRes && (rulesRes.success || rulesRes.cmd === 383)) {
          setRules(rulesRes.datas || []);
        }
      } catch (e) {
        console.error("Failed to load URL Limit rules", e);
        showAlert('Failed to load rules', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showAlert]);

  const handleAddClick = () => {
    if (rules.length >= 32) {
      showAlert('The maximum number of entries is 32.', 'warning');
      return;
    }
    setEditingIndex(null);
    setPrefilledMacs([]);
    setIsModalOpen(true);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setPrefilledMacs([]);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setRules([]);
  };

  const handleModalSave = (newRules: UrlLimitRule[]) => {
    if (editingIndex !== null) {
      // Edit (replace the edited rule with the first new rule, ignore others if multiple were generated)
      setRules(prev => prev.map((r, i) => i === editingIndex ? newRules[0] : r));
    } else {
      // Add
      setRules(prev => [...prev, ...newRules]);
    }
  };

  const toggleRuleEnabled = (index: number) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, enableRule: !r.enableRule } : r));
  };

  const handleGlobalSave = async () => {
    setSaving(true);
    try {
      // Force enableLink to false for all rules before saving
      const rulesToSave = rules.map(r => ({ ...r, enableLink: false }));
      const rulesRes = await saveUrlLimitRules(rulesToSave);

      if (rulesRes?.success || rulesRes?.cmd === 383) {
        await applyUrlLimitSettings();
        showAlert('Settings saved successfully', 'success');
      } else {
        showAlert('Failed to save settings', 'error');
      }
    } catch (e) {
      console.error(e);
      showAlert('An error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Connected Devices Handlers
  const handleDeviceSelect = (mac: string) => {
    setSelectedDevices(prev => 
      prev.includes(mac) ? prev.filter(m => m !== mac) : [...prev, mac]
    );
  };

  const handleAddDeviceClick = (mac: string) => {
    setEditingIndex(null);
    setPrefilledMacs([mac]);
    setIsModalOpen(true);
  };

  const handleAddSelectedClick = () => {
    if (selectedDevices.length === 0) {
      showAlert('Please select at least one device', 'warning');
      return;
    }
    setEditingIndex(null);
    setPrefilledMacs(selectedDevices);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange" size={40} />
      </div>
    );
  }

  if (!parentalModeEnabled) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-black mb-2">Parental Mode is Disabled</h3>
        <p className="text-gray-500 text-sm text-center max-w-md">
          Please enable Parental Mode first to configure URL Limit rules.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in py-6">
      <div className="border-t border-gray-200 mt-2">
        {/* Rules Header */}
        <div className="grid grid-cols-12 py-4 border-b border-gray-100">
          <div className="col-span-2 ps-4 font-bold text-sm text-black">Enable Rule</div>
          <div className="col-span-4 font-bold text-sm text-black">MAC Address</div>
          <div className="col-span-4 font-bold text-sm text-black">URL</div>
          <div className="col-span-2 font-bold text-sm text-black text-right pe-4">Operate</div>
        </div>

        {/* Rules Rows */}
        {rules.length > 0 ? rules.map((item, index) => (
          <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
            <div className="col-span-2 ps-4">
              <SquareSwitch 
                isOn={item.enableRule} 
                onChange={() => toggleRuleEnabled(index)} 
              />
            </div>
            <div className="col-span-4 text-sm text-black">{item.mac}</div>
            <div className="col-span-4 text-sm text-black truncate pr-2">{item.url}</div>
            <div className="col-span-2 flex justify-end pe-4 space-x-3">
              <button 
                onClick={() => handleEditClick(index)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => handleDeleteClick(index)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-8 text-center text-gray-400 italic">No rules defined</div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-6 space-x-4">
        <div className="relative">
          <select className="border border-gray-200 py-1.5 ps-3 pe-8 text-sm text-gray-600 rounded-[2px] appearance-none bg-white outline-none cursor-pointer hover:border-gray-300">
            <option>10/page</option>
            <option>20/page</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex space-x-1">
          <button className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] text-gray-400 rounded-[2px] hover:bg-gray-200 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-[#333] text-white font-bold text-sm rounded-[2px]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] text-gray-400 rounded-[2px] hover:bg-gray-200 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end mt-6 space-x-4">
        <button 
          onClick={handleAddClick}
          className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
        >
          Add Rule
        </button>
        <button 
          onClick={handleClearAll}
          className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
        >
          Clear All
        </button>
        <button 
          onClick={handleGlobalSave}
          disabled={saving}
          className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
        >
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
        </button>
      </div>

      {/* Connected Devices Section */}
      <div className="mt-12 border-t border-gray-200">
        <div className="grid grid-cols-12 py-4 border-b border-gray-100 mt-2">
          <div className="col-span-1 ps-4">
             <div className="w-4 h-4 rounded-[2px] border border-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    if (selectedDevices.length === connectedDevices.length) {
                      setSelectedDevices([]);
                    } else {
                      setSelectedDevices(connectedDevices.map(d => d.mac));
                    }
                  }}>
                {selectedDevices.length === connectedDevices.length && connectedDevices.length > 0 && <div className="w-2 h-2 bg-black rounded-[1px]" />}
             </div>
          </div>
          <div className="col-span-4 font-bold text-sm text-black">Host</div>
          <div className="col-span-5 font-bold text-sm text-black">MAC Address</div>
          <div className="col-span-2 font-bold text-sm text-black text-right pe-4">Operate</div>
        </div>

        {connectedDevices.length > 0 ? connectedDevices.map((device, index) => (
          <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
            <div className="col-span-1 ps-4">
              <div className="w-4 h-4 rounded-[2px] border border-gray-300 flex items-center justify-center cursor-pointer"
                   onClick={() => handleDeviceSelect(device.mac)}>
                 {selectedDevices.includes(device.mac) && <div className="w-2 h-2 bg-black rounded-[1px]" />}
              </div>
            </div>
            <div className="col-span-4 text-sm text-black truncate pr-2">{device.hostname || 'Unknown Device'}</div>
            <div className="col-span-5 text-sm text-black">{device.mac}</div>
            <div className="col-span-2 flex justify-end pe-4">
              <button 
                onClick={() => handleAddDeviceClick(device.mac)}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-1 px-4 text-xs transition-all rounded-[2px] shadow-sm"
              >
                Add
              </button>
            </div>
          </div>
        )) : (
          <div className="py-8 text-center text-gray-400 italic">No connected devices</div>
        )}

        <div className="flex justify-end mt-6">
          <button 
            onClick={handleAddSelectedClick}
            className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
          >
            Add Selected
          </button>
        </div>
      </div>

      <UrlLimitEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={editingIndex !== null ? rules[editingIndex] : null}
        prefilledMacs={prefilledMacs}
        existingRules={rules}
        editingIndex={editingIndex}
      />
    </div>
  );
};
