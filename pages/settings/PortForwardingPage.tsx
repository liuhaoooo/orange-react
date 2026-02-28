import React, { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { PortForwardingRule, fetchPortForwardingRules, savePortForwardingRules, applyPortForwardingSettings } from '../../utils/api';
import { PortForwardingEditModal } from '../../components/PortForwardingEditModal';
import { useAlert } from '../../utils/AlertContext';
import { SquareSwitch } from '../../components/UIComponents';

export const PortForwardingPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<PortForwardingRule[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const rulesRes = await fetchPortForwardingRules();
        
        if (rulesRes && (rulesRes.success || rulesRes.cmd === 27)) {
          setRules(rulesRes.datas || []);
        }
      } catch (e) {
        console.error("Failed to load Port Forwarding rules", e);
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

  const handleModalSave = (rule: PortForwardingRule) => {
    if (editingIndex !== null) {
      // Edit
      setRules(prev => prev.map((r, i) => i === editingIndex ? rule : r));
    } else {
      // Add
      setRules(prev => [...prev, rule]);
    }
  };

  const toggleRuleEnabled = (index: number) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, enableRule: !r.enableRule } : r));
  };

  const handleGlobalSave = async () => {
    setSaving(true);
    try {
      const rulesRes = await savePortForwardingRules(rules);

      if (rulesRes?.success || rulesRes?.cmd === 27) {
        await applyPortForwardingSettings();
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

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange" size={40} />
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in py-6">
      <div className="border-t border-gray-200 mt-2">
        {/* Header */}
        <div className="grid grid-cols-12 py-4 border-b border-gray-100">
          <div className="col-span-2 ps-4 font-bold text-sm text-black">Enable Rule</div>
          <div className="col-span-1 font-bold text-sm text-black">Priority</div>
          <div className="col-span-1 font-bold text-sm text-black">Protocol</div>
          <div className="col-span-2 font-bold text-sm text-black">Source Port</div>
          <div className="col-span-2 font-bold text-sm text-black">Destination IP</div>
          <div className="col-span-2 font-bold text-sm text-black">Destination Port</div>
          <div className="col-span-1 font-bold text-sm text-black">Remark</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {rules.length > 0 ? rules.map((item, index) => (
          <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
            <div className="col-span-2 ps-4">
              <SquareSwitch 
                isOn={item.enableRule} 
                onChange={() => toggleRuleEnabled(index)} 
              />
            </div>
            <div className="col-span-1 text-sm text-black">{index + 1}</div>
            <div className="col-span-1 text-sm text-black">{item.protocol}</div>
            <div className="col-span-2 text-sm text-black">{item.port}</div>
            <div className="col-span-2 text-sm text-black">{item.mappingIp}</div>
            <div className="col-span-2 text-sm text-black">{item.mappingPort}</div>
            <div className="col-span-1 text-sm text-black truncate pr-2">{item.remark}</div>
            <div className="col-span-1 flex justify-end pe-4 space-x-3">
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
      <div className="flex justify-end mt-12 space-x-4">
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

      <PortForwardingEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={editingIndex !== null ? rules[editingIndex] : null}
        existingRules={rules}
      />
    </div>
  );
};
