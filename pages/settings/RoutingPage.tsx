
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { fetchRoutingSettings, saveRoutingSettings, applyRoutingSettings, fetchMultipleApnSettings, RoutingRule } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { RoutingEditModal } from '../../components/RoutingEditModal';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { PrimaryButton } from '../../components/UIComponents';

export const RoutingPage: React.FC = () => {
  const { showAlert } = useAlert();
  const { globalData } = useGlobalState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  
  const [interfaceOptions, setInterfaceOptions] = useState<{label: string, value: string}[]>([
      { label: 'WAN', value: 'WAN' },
      { label: 'LAN', value: 'LAN' },
      { label: 'GRE', value: 'GRE' },
      { label: 'PPP', value: 'PPP' },
      { label: 'Main APN', value: 'APN' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const hideGateway = globalData.connectionSettings?.aeraId === 'IO24071';

  useEffect(() => {
    const load = async () => {
      try {
        const [routingRes, apnRes] = await Promise.all([
            fetchRoutingSettings(),
            fetchMultipleApnSettings()
        ]);

        if (routingRes && (routingRes.success || routingRes.cmd === 164)) {
            setRules(routingRes.datas || []);
        }

        if (apnRes && (apnRes.success || apnRes.cmd === 130)) {
             const arr = [
                { label: 'WAN', value: 'WAN' },
                { label: 'LAN', value: 'LAN' },
                { label: 'GRE', value: 'GRE' },
                { label: 'PPP', value: 'PPP' },
                { label: 'Main APN', value: 'APN' },
             ];
             const num = parseInt(apnRes.multiApnNum || '0', 10);
             for (let i = 1; i <= num; i++) {
                 if (apnRes[`apnSwitch${i}`] === '1') {
                     arr.push({ label: `APN${i}`, value: `APN${i}` });
                 }
             }
             setInterfaceOptions(arr);
        }

      } catch (e) {
        console.error("Failed to load settings", e);
        showAlert('Failed to load settings.', 'error');
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
    setIsModalOpen(true);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setRules([]);
  };

  const handleModalSave = (rule: RoutingRule) => {
    if (editingIndex !== null) {
      setRules(prev => prev.map((r, i) => i === editingIndex ? rule : r));
    } else {
      setRules(prev => [...prev, rule]);
    }
  };

  const handleGlobalSave = async () => {
    setSaving(true);
    try {
      const processedRules = rules.map(r => {
         const bits = r.netmask.split('.').reduce((c, octet) => {
             const n = parseInt(octet, 10);
             return c + (n >>> 0).toString(2).split('1').length - 1;
         }, 0);
         return { ...r, netmaskBits: bits };
      });

      const res = await saveRoutingSettings(processedRules);
      
      if (res && (res.success || res.result === 'success')) {
        try {
            const applyRes = await applyRoutingSettings();
            if (applyRes && (applyRes.success || applyRes.result === 'success')) {
                showAlert('Settings saved successfully.', 'success');
            } else {
                showAlert('Settings saved but failed to apply.', 'warning');
            }
        } catch (applyErr) {
            console.error("Failed to apply settings", applyErr);
            showAlert('Settings saved but failed to apply.', 'warning');
        }
      } else {
        showAlert('Failed to save settings.', 'error');
      }
    } catch (e) {
      console.error("Failed to save routing settings", e);
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
      
      <div className="w-full border-t border-gray-100 overflow-x-auto">
        <div className="min-w-[700px]">
            <div className="grid grid-cols-12 py-4 border-b border-gray-100">
                <div className="col-span-2 ps-4 font-bold text-sm text-black">State</div>
                <div className={`${hideGateway ? 'col-span-3' : 'col-span-2'} font-bold text-sm text-black`}>Interface Name</div>
                <div className={`${hideGateway ? 'col-span-4' : 'col-span-3'} font-bold text-sm text-black`}>Destination IP</div>
                <div className="col-span-2 font-bold text-sm text-black">Subnet Mask</div>
                {!hideGateway && <div className="col-span-2 font-bold text-sm text-black">Gateway</div>}
                <div className="col-span-1"></div>
            </div>

            {rules.length > 0 ? rules.map((rule, index) => (
                <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                <div className="col-span-2 ps-4 text-sm text-black font-medium">{rule.valid ? 'Valid' : 'Invalid'}</div>
                <div className={`${hideGateway ? 'col-span-3' : 'col-span-2'} text-sm text-black font-medium`}>{rule.ifName}</div>
                <div className={`${hideGateway ? 'col-span-4' : 'col-span-3'} text-sm text-black font-medium`}>{rule.ip}</div>
                <div className="col-span-2 text-sm text-black font-medium">{rule.netmask}</div>
                {!hideGateway && <div className="col-span-2 text-sm text-black font-medium">{rule.gateway}</div>}
                <div className="col-span-1 flex justify-end pe-4 space-x-3">
                    <button 
                        onClick={() => handleEditClick(index)}
                        className="text-gray-500 hover:text-black transition-colors"
                    >
                        <Pencil size={16} />
                    </button>
                    <button 
                        onClick={() => handleDeleteClick(index)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                </div>
            )) : (
                <div className="py-8 text-center text-gray-400 italic">No Data</div>
            )}
        </div>
      </div>

      <div className="flex justify-end items-center mt-8 space-x-4">
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

      <div className="flex justify-end mt-12 space-x-4">
        <PrimaryButton 
            onClick={handleAddClick}
            className="bg-[#eeeeee] border-black text-black hover:bg-white"
        >
            Add Rule
        </PrimaryButton>
        <PrimaryButton 
            onClick={handleClearAll}
            className="bg-[#eeeeee] border-black text-black hover:bg-white"
        >
            Clear All
        </PrimaryButton>
        <PrimaryButton 
            onClick={handleGlobalSave}
            loading={saving}
        >
             Save
        </PrimaryButton>
      </div>

      <RoutingEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={editingIndex !== null ? rules[editingIndex] : null}
        interfaceOptions={interfaceOptions}
        hideGateway={hideGateway}
        existingIps={rules.map(r => r.ip)}
      />
    </div>
  );
};
