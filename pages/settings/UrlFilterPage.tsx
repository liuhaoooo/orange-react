import React, { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';
import { UrlFilterRule, fetchUrlFilterDefault, saveUrlFilterDefault, fetchUrlFilterRules, saveUrlFilterRules, applyUrlFilterSettings } from '../../utils/api';
import { UrlFilterEditModal } from '../../components/UrlFilterEditModal';
import { useAlert } from '../../utils/AlertContext';

export const UrlFilterPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<UrlFilterRule[]>([]);
  const [mode, setMode] = useState<'whitelist' | 'blacklist'>('blacklist');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [defaultRes, rulesRes] = await Promise.all([
          fetchUrlFilterDefault(),
          fetchUrlFilterRules()
        ]);
        
        if (defaultRes && defaultRes.success && defaultRes.datas && defaultRes.datas.length > 0) {
          setMode(defaultRes.datas[0].acceptAll ? 'blacklist' : 'whitelist');
        }
        
        if (rulesRes && rulesRes.success) {
          setRules(rulesRes.datas || []);
        }
      } catch (e) {
        console.error("Failed to load URL filter rules", e);
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

  const handleModalSave = (rule: UrlFilterRule) => {
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
      const isBlacklist = mode === 'blacklist';
      
      const defaultDatas = [
        { enableRule: true, acceptAll: isBlacklist, ippro: "IPV4" },
        { enableRule: true, acceptAll: isBlacklist, ippro: "IPV6" }
      ];
      
      const rulesDatas = rules.map(r => ({
        ...r,
        enableLink: !isBlacklist // enableLink is false for blacklist, true for whitelist
      }));

      const [defaultRes, rulesRes] = await Promise.all([
        saveUrlFilterDefault(defaultDatas),
        saveUrlFilterRules(rulesDatas)
      ]);

      if (defaultRes?.success && rulesRes?.success) {
        await applyUrlFilterSettings();
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
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-base text-black mt-1">Default Filter Rules</h3>
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mode === 'whitelist' ? 'border-black' : 'border-gray-300'}`}>
              {mode === 'whitelist' && <div className="w-2 h-2 bg-black rounded-full" />}
            </div>
            <span className="text-sm text-gray-700">Whitelist</span>
            <input 
              type="radio" 
              name="filterMode" 
              value="whitelist" 
              checked={mode === 'whitelist'} 
              onChange={() => setMode('whitelist')} 
              className="hidden" 
            />
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mode === 'blacklist' ? 'border-black' : 'border-gray-300'}`}>
              {mode === 'blacklist' && <div className="w-2 h-2 bg-black rounded-full" />}
            </div>
            <span className="text-sm text-gray-700">Blacklist</span>
            <input 
              type="radio" 
              name="filterMode" 
              value="blacklist" 
              checked={mode === 'blacklist'} 
              onChange={() => setMode('blacklist')} 
              className="hidden" 
            />
          </label>
        </div>
      </div>
      
      <div className="border-t border-gray-200 mt-2">
        {/* Header */}
        <div className="grid grid-cols-12 py-4 border-b border-gray-100">
          <div className="col-span-2 ps-4 font-bold text-sm text-black">Enable Rule</div>
          <div className="col-span-6 font-bold text-sm text-black">URL</div>
          <div className="col-span-3 font-bold text-sm text-black">Remark</div>
          <div className="col-span-1"></div>
        </div>

        {/* Rows */}
        {rules.length > 0 ? rules.map((item, index) => (
          <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
            <div className="col-span-2 ps-4">
              <button 
                onClick={() => toggleRuleEnabled(index)}
                className="w-14 h-7 flex items-center border border-black rounded-[2px] overflow-hidden"
              >
                {item.enableRule ? (
                  <>
                    <div className="w-1/2 h-full bg-[#333] flex items-center justify-center text-white">
                      <Check size={16} strokeWidth={3} />
                    </div>
                    <div className="w-1/2 h-full bg-white"></div>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 h-full bg-white"></div>
                    <div className="w-1/2 h-full bg-[#eeeeee] flex items-center justify-center border-l border-black">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    </div>
                  </>
                )}
              </button>
            </div>
            <div className="col-span-6 text-sm text-black">{item.url}</div>
            <div className="col-span-3 text-sm text-black truncate pr-2">{item.remark}</div>
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

      <UrlFilterEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={editingIndex !== null ? rules[editingIndex] : null}
        existingRules={rules}
      />
    </div>
  );
};
