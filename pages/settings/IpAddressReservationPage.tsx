
import React, { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { IpReservationRule, fetchIpReservation, saveIpReservation, fetchConnectionSettings } from '../../utils/api';
import { IpReservationEditModal } from '../../components/IpReservationEditModal';
import { useAlert } from '../../utils/AlertContext';

export const IpAddressReservationPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<IpReservationRule[]>([]);
  const [lanIp, setLanIp] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
      const load = async () => {
          try {
              const [res, connRes] = await Promise.all([
                  fetchIpReservation(),
                  fetchConnectionSettings()
              ]);

              if (res && (res.success || res.cmd === 115)) {
                  setRules(res.datas || []);
              }

              if (connRes && (connRes.success !== false)) {
                  setLanIp(connRes.lanIp || '');
              }
          } catch (e) {
              console.error("Failed to load IP reservations", e);
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

  const handleModalSave = (rule: IpReservationRule) => {
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
          const res = await saveIpReservation(rules);
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
    <div className="w-full animate-fade-in py-6">
      <div className="text-center mb-6">
          <h3 className="font-bold text-base text-gray-700">IP Address Reservation</h3>
      </div>
      
      <div className="border-t border-gray-200">
          {/* Header */}
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-5 ps-4 font-bold text-sm text-black">IP</div>
              <div className="col-span-5 font-bold text-sm text-black">MAC</div>
              <div className="col-span-2"></div>
          </div>

          {/* Rows */}
          {rules.length > 0 ? rules.map((item, index) => (
              <div key={index} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-5 ps-4 text-sm text-black font-medium">{item.ip}</div>
                  <div className="col-span-5 text-sm text-black font-medium uppercase">{item.mac}</div>
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

      <IpReservationEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialData={editingIndex !== null ? rules[editingIndex] : null}
        existingRules={rules}
        currentLanIp={lanIp}
      />
    </div>
  );
};
