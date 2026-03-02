import React, { useState, useEffect } from 'react';
import { Save, Edit2 } from 'lucide-react';
import { PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';
import { MultipleIpPassthroughEditModal, IpPassRow } from '../../components/MultipleIpPassthroughEditModal';

export const MultipleIpPassthroughPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState<IpPassRow[]>([
    { id: 1, flag: '0', mode: '0', mac: '' },
    { id: 2, flag: '0', mode: '0', mac: '' },
    { id: 3, flag: '0', mode: '0', mac: '' },
  ]);

  const [editingRow, setEditingRow] = useState<IpPassRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMultipleIpPassthroughData = async () => {
      try {
        const data = await apiRequest(458, 'GET');
        if (data && data.success) {
          setRows([
            { id: 1, flag: data.ipPassFlag1 || '0', mode: data.mode1 || '0', mac: data.ipPassMac1 || '' },
            { id: 2, flag: data.ipPassFlag2 || '0', mode: data.mode2 || '0', mac: data.ipPassMac2 || '' },
            { id: 3, flag: data.ipPassFlag3 || '0', mode: data.mode3 || '0', mac: data.ipPassMac3 || '' },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch Multiple IP Passthrough settings", error);
      }
    };
    fetchMultipleIpPassthroughData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ipPassFlag1: rows[0].flag,
        mode1: rows[0].mode,
        ipPassMac1: rows[0].mac,
        ipPassFlag2: rows[1].flag,
        mode2: rows[1].mode,
        ipPassMac2: rows[1].mac,
        ipPassFlag3: rows[2].flag,
        mode3: rows[2].mode,
        ipPassMac3: rows[2].mac,
      };

      const data = await apiRequest(458, 'POST', payload);
      if (data && data.success) {
        showAlert(t('settingsSaved') || 'Settings saved successfully', 'success');
      } else {
        showAlert(t('errorSaving') || 'Failed to save settings', 'error');
      }
    } catch (error) {
      console.error("Failed to save Multiple IP Passthrough settings", error);
      showAlert(t('errorSaving') || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (row: IpPassRow) => {
    setEditingRow(row);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
  };

  const saveEditModal = (updatedRow: IpPassRow) => {
    setRows(rows.map(r => r.id === updatedRow.id ? updatedRow : r));
    closeEditModal();
  };

  return (
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="bg-white border border-gray-200 rounded-[6px] overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-4 text-sm font-medium text-gray-600">IP Passthrough</th>
              <th className="p-4 text-sm font-medium text-gray-600">State</th>
              <th className="p-4 text-sm font-medium text-gray-600">Mode</th>
              <th className="p-4 text-sm font-medium text-gray-600 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 last:border-b-0">
                <td className="p-4 text-sm text-gray-900">IP Passthrough{row.id}</td>
                <td className="p-4 text-sm text-gray-900">{row.flag === '1' ? 'Enabled' : 'Disabled'}</td>
                <td className="p-4 text-sm text-gray-900">{row.mode === '0' ? 'Standard Mode' : 'Compatibility Mode'}</td>
                <td className="p-4 text-sm text-gray-900">
                  <button onClick={() => openEditModal(row)} className="text-gray-500 hover:text-black transition-colors">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <PrimaryButton
          onClick={handleSave}
          loading={saving}
          icon={<Save size={18} />}
        >
          Save
        </PrimaryButton>
      </div>

      <MultipleIpPassthroughEditModal
        isOpen={isModalOpen}
        onClose={closeEditModal}
        onSave={saveEditModal}
        initialData={editingRow}
      />
    </div>
  );
};
