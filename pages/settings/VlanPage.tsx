import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { PrimaryButton } from '../../components/UIComponents';
import { apiRequest } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { useLanguage } from '../../utils/i18nContext';
import { VlanEditModal } from './VlanEditModal';
import { ConfirmModal } from '../../components/ConfirmModal';

export const VlanPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [rawData, setRawData] = useState<any>(null);
  const [vlanMask, setVlanMask] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editVlanId, setEditVlanId] = useState('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest(290, 'GET', { getfun: true });
      if (res && res.success) {
        setRawData(res);
        if (res.lanMark) {
          const mask = (parseInt(res.lanMark.slice(0, -4), 16) & 0xffff)
            .toString(2)
            .split('')
            .reverse()
            .join('');
          setVlanMask(mask);
        }
      }
    } catch (error) {
      console.error("Failed to fetch VLAN data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    const activeCount = vlanMask.split('').filter(c => c === '1').length;
    if (activeCount >= 16) {
      showAlert('Maximum number of rules reached', 'warning');
      return;
    }
    setEditIndex(null);
    setEditVlanId('');
    setIsModalOpen(true);
  };

  const handleEditClick = (index: number, currentVlanId: string) => {
    setEditIndex(index);
    setEditVlanId(currentVlanId);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      const newMask = vlanMask.split('');
      newMask[deleteIndex] = '0';
      setVlanMask(newMask.join(''));
    }
    setIsConfirmOpen(false);
    setDeleteIndex(null);
  };

  const handleModalSave = (vlanId: string) => {
    if (editIndex !== null) {
      setRawData((prev: any) => ({
        ...prev,
        [`vlanId${editIndex}`]: vlanId
      }));
    } else {
      let newIndex = -1;
      for (let i = 0; i < 16; i++) {
        if (vlanMask[i] !== '1') {
          newIndex = i;
          break;
        }
      }
      if (newIndex !== -1) {
        const newMask = vlanMask.split('');
        newMask[newIndex] = '1';
        for (let i = 0; i < newIndex; i++) {
          if (!newMask[i]) newMask[i] = '0';
        }
        setVlanMask(newMask.join(''));
        
        setRawData((prev: any) => ({
          ...prev,
          [`vlanId${newIndex}`]: vlanId,
          [`vlanIp${newIndex}`]: prev[`vlanIp${newIndex}`] || "",
          [`vlanNetMask${newIndex}`]: prev[`vlanNetMask${newIndex}`] || "",
          [`vlanDhcpServer${newIndex}`]: prev[`vlanDhcpServer${newIndex}`] || "0",
        }));
      }
    }
    setIsModalOpen(false);
  };

  const handleSaveAll = async () => {
    if (!rawData) return;
    setIsSaving(true);
    try {
      const payload = { ...rawData };
      payload.cmd = 290;
      payload.method = 'POST';
      
      const maskBinaryStr = vlanMask.split('').reverse().join('');
      const maskHex = parseInt(maskBinaryStr || '0', 2).toString(16);
      const originalSuffix = rawData.lanMark ? rawData.lanMark.slice(-4) : '0001';
      payload.lanMark = maskHex + originalSuffix;

      delete payload.success;
      delete payload.getfun;

      const res = await apiRequest(290, 'POST', payload);
      if (res && res.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
        fetchData();
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activeVlans = [];
  if (rawData) {
    for (let i = 0; i < 16; i++) {
      if (vlanMask[i] === '1') {
        activeVlans.push({
          index: i,
          vlanName: `VLAN${i}`,
          vlanId: rawData[`vlanId${i}`] || '',
          ip: rawData[`vlanIp${i}`] || '',
          mask: rawData[`vlanNetMask${i}`] || '',
          dhcp: rawData[`vlanDhcpServer${i}`] === '1' ? 'Enabled' : 'Disabled'
        });
      }
    }
  }

  if (isLoading) {
    return (
      <div className="w-full animate-fade-in py-2">
        <div className="bg-white border border-gray-200 rounded-[6px] p-8 text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in py-2">
      
      <div className="w-full border-t border-gray-100">
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-2 font-bold text-sm text-black uppercase ps-4">VLAN</div>
              <div className="col-span-2 font-bold text-sm text-black uppercase">VLAN ID</div>
              <div className="col-span-3 font-bold text-sm text-black uppercase">VLAN IP</div>
              <div className="col-span-3 font-bold text-sm text-black uppercase">Subnet Mask</div>
              <div className="col-span-2 font-bold text-sm text-black uppercase">DHCP Server</div>
          </div>

          {activeVlans.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                  No VLAN rules found.
              </div>
          ) : (
              activeVlans.map((item) => (
                  <div key={item.index} className="grid grid-cols-12 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                      <div className="col-span-2 text-sm text-black font-medium ps-4">{item.vlanName}</div>
                      <div className="col-span-2 text-sm text-black font-medium">{item.vlanId}</div>
                      <div className="col-span-3 text-sm text-black font-medium">{item.ip}</div>
                      <div className="col-span-3 text-sm text-black font-medium">{item.mask}</div>
                      <div className="col-span-2 flex justify-between items-center pe-4">
                          <span className="text-sm text-black font-medium">{item.dhcp}</span>
                          <div className="flex space-x-3">
                              <button 
                                onClick={() => handleEditClick(item.index, item.vlanId)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                  <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(item.index)}
                                className="text-black hover:text-red-500 transition-colors"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>

      <div className="flex justify-end items-center mt-8 space-x-4">
          <div className="relative">
              <select className="border border-gray-200 py-1.5 ps-3 pe-8 text-sm text-gray-600 rounded-[2px] appearance-none bg-white outline-none cursor-pointer hover:border-gray-300">
                  <option>10/page</option>
                  <option>20/page</option>
                  <option>50/page</option>
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
            <button 
                onClick={handleAddClick}
                className="px-6 py-2 bg-[#eeeeee] border-2 border-black text-black font-bold text-sm transition-colors hover:bg-gray-200"
            >
                Add Rule
            </button>
            <PrimaryButton onClick={handleSaveAll} loading={isSaving} disabled={isSaving} className="w-32">
                Save
            </PrimaryButton>
      </div>

      <VlanEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        initialVlanId={editVlanId}
        title={editIndex !== null ? 'Edit Rule' : 'Add Rule'}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm"
        message="Are you sure you want to delete this rule?"
      />

    </div>
  );
};
