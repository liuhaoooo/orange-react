
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { fetchMacFilter, saveMacFilter, checkWifiStatus } from '../../utils/api';
import { MacFilterRule } from '../../utils/services/types';
import { useAlert } from '../../utils/AlertContext';
import { MacFilterEditModal } from '../../components/MacFilterEditModal';
import { StyledSelect, PrimaryButton, TabToggle } from '../../components/UIComponents';

interface MacFilteringPanelProps {
    subcmd: string; // '1' for 2.4G, '0' for 5G (based on original file logic, check API docs if available, assuming correct)
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
      const load = async () => {
          setLoading(true);
          try {
              const res = await fetchMacFilter(subcmd);
              if (res && (res.success || res.cmd === 278)) {
                  if (res.datas) {
                      setMode(res.datas.macfilter || 'close');
                      setRules(res.datas.maclist || []);
                  } else {
                      setMode('close');
                      setRules([]);
                  }
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

  const handleModalSave = (rule: MacFilterRule) => {
      if (editingIndex !== null) {
          setRules(prev => prev.map((r, i) => i === editingIndex ? rule : r));
      } else {
          setRules(prev => [...prev, rule]);
      }
  };

  const handleGlobalSave = async () => {
      setSaving(true);
      try {
          const statusRes = await checkWifiStatus();
          if (statusRes && statusRes.wifiStatus !== '1') {
              showAlert('Wi-Fi is restarting, please try again later.', 'warning');
              setSaving(false);
              return;
          }

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
      <div className="flex justify-between items-center mb-6">
        <label className="font-bold text-sm text-black">Filtering Rules:</label>
        <div className="w-48">
            <StyledSelect
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                options={FILTER_OPTIONS.map(o => ({ label: o.name, value: o.value }))}
            />
        </div>
      </div>

      <div className="w-full border-t border-gray-100">
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-2 ps-4 font-bold text-sm text-black">Index</div>
              <div className="col-span-5 font-bold text-sm text-black">MAC Address</div>
              <div className="col-span-5 font-bold text-sm text-black">Remark</div>
          </div>

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

export const MacFilteringPage: React.FC = () => {
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
                // subcmd '1' for 2.4G based on previous implementation
                <MacFilteringPanel key="2.4g" subcmd="1" />
            ) : (
                // subcmd '0' for 5G based on previous implementation
                <MacFilteringPanel key="5g" subcmd="0" />
            )}
        </div>
    );
};
// Export alias
export const MacFiltering24Page = MacFilteringPage;