
import React, { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, Loader2, Save } from 'lucide-react';
import { fetchMacFilter, saveMacFilter } from '../../utils/api';
import { MacFilterRule } from '../../utils/services/types';
import { useAlert } from '../../utils/AlertContext';
import { MacFilterEditModal } from '../../components/MacFilterEditModal';

interface MacFilteringPanelProps {
    subcmd: string; // '1' for 2.4G, '0' for 5G
}

const FILTER_OPTIONS = [
    { name: "Disabled", value: "close" },
    { name: "Whitelist", value: "allow" },
    { name: "Blacklist", value: "deny" },
];

export const MacFilteringPanel: React.FC<MacFilteringPanelProps> = ({ subcmd }) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('close');
  const [rules, setRules] = useState<MacFilterRule[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
      const load = async () => {
          try {
              const res = await fetchMacFilter(subcmd);
              if (res && (res.success || res.cmd === 278)) {
                  setMode(res.datas.macfilter || 'close');
                  setRules(res.datas.maclist || []);
              }
          } catch (e) {
              console.error("Failed to load MAC filter", e);
              showAlert('Failed to load settings', 'error');
          } finally {
              setLoading(false);
          }
      };
      load();
  }, [subcmd, showAlert]);

  const handleAddClick = () => {
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

  const handleModalSave = (rule: MacFilterRule) => {
      if (editingIndex !== null) {
          // Edit
          setRules(prev => prev.map((r, i) => i === editingIndex ? rule : r));
      } else {
          // Add
          setRules(prev => [...prev, rule]);
      }
  };

  const handleGlobalSave = async () => {
      setSaving(true);
      try {
          const res = await saveMacFilter(subcmd, mode, rules);
          if (res && (res.success || res.result === 'success')) {
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
    <div className="w-full animate-fade-in py-2">
      {/* Top Control */}
      <div className="flex justify-between items-center mb-6">
        <label className="font-bold text-sm text-black">Filtering Rules:</label>
        <div className="relative w-48">
            <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
            >
                {FILTER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.name}</option>
                ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="w-full border-t border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-2 ps-4 font-bold text-sm text-black">Index</div>
              <div className="col-span-5 font-bold text-sm text-black">MAC Address</div>
              <div className="col-span-5 font-bold text-sm text-black">Remark</div>
          </div>

          {/* Rows */}
          {rules.map((rule, index) => (
              <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-2 ps-4 text-sm text-black font-medium">{index + 1}</div>
                  <div className="col-span-5 text-sm text-black font-medium uppercase">{rule.mac}</div>
                  <div className="col-span-3 text-sm text-black font-medium">{rule.remarks}</div>
                  <div className="col-span-2 flex justify-end pe-4 space-x-3">
                        <button 
                            onClick={() => handleEditClick(index)}
                            className="text-gray-500 hover:text-black transition-colors"
                        >
                            <Pencil size={16} />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(index)}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                  </div>
              </div>
          ))}
          {rules.length === 0 && (
              <div className="py-8 text-center text-gray-400 italic">No rules defined</div>
          )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end mt-12 space-x-4">
            <button 
                onClick={handleAddClick}
                className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
            >
                Add Rule
            </button>
            <button 
                onClick={handleClearAll}
                className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
            >
                Clear All
            </button>
            <button 
                onClick={handleGlobalSave}
                disabled={saving}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
            >
                {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : 'Save'}
            </button>
      </div>

      <MacFilterEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={editingIndex !== null ? rules[editingIndex] : null}
        existingMacs={rules.map(r => r.mac)}
      />
    </div>
  );
};

export const MacFiltering24Page: React.FC = () => {
    return <MacFilteringPanel subcmd="1" />;
};
