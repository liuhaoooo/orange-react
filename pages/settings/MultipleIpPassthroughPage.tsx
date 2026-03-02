import React, { useState, useEffect } from 'react';
import { Save, Edit2, X } from 'lucide-react';
import { FormRow, SquareSwitch, StyledInput, StyledSelect, PrimaryButton } from '../../components/UIComponents';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { apiRequest } from '../../utils/services/core';

interface IpPassRow {
  id: number;
  flag: string;
  mode: string;
  mac: string;
}

const modeOptions = [
  { label: 'Standard Mode', value: '0' },
  { label: 'Compatibility Mode', value: '1' },
];

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
  const [editFlag, setEditFlag] = useState('0');
  const [editMode, setEditMode] = useState('0');
  const [editMac, setEditMac] = useState('');
  const [editError, setEditError] = useState('');

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
    setEditFlag(row.flag);
    setEditMode(row.mode);
    setEditMac(row.mac);
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingRow(null);
  };

  const saveEditModal = () => {
    if (editFlag === '1' && editMode === '0') {
      if (!editMac.trim()) {
        setEditError('MAC Address is required');
        return;
      } else {
        const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
        if (!macRegex.test(editMac)) {
          setEditError('Invalid MAC Address format');
          return;
        }
      }
    }

    setRows(rows.map(r => r.id === editingRow?.id ? { ...r, flag: editFlag, mode: editMode, mac: editMac } : r));
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

      {editingRow && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[6px] shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Edit IP Passthrough{editingRow.id}</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-black transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <FormRow label="Enabled">
                <SquareSwitch isOn={editFlag === '1'} onChange={() => setEditFlag(editFlag === '1' ? '0' : '1')} />
              </FormRow>
              
              {editFlag === '1' && (
                <>
                  <FormRow label="Mode">
                    <StyledSelect
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value)}
                      options={modeOptions}
                    />
                  </FormRow>

                  {editMode === '0' && (
                    <FormRow label="MAC Address" required error={editError}>
                      <StyledInput 
                        value={editMac} 
                        onChange={(e) => { setEditMac(e.target.value); setEditError(''); }} 
                        hasError={!!editError} 
                        placeholder="e.g., AA:AA:AA:AA:AA:AA"
                      />
                    </FormRow>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200 space-x-4 bg-gray-50">
              <button 
                onClick={closeEditModal} 
                className="px-6 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors uppercase"
              >
                Cancel
              </button>
              <button 
                onClick={saveEditModal} 
                className="px-6 py-2 text-sm font-bold text-black bg-orange hover:bg-orange-dark transition-colors uppercase"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
