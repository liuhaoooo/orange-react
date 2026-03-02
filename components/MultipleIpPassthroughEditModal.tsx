import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { SquareSwitch, StyledInput, StyledSelect } from './UIComponents';

export interface IpPassRow {
  id: number;
  flag: string;
  mode: string;
  mac: string;
}

interface MultipleIpPassthroughEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (row: IpPassRow) => void;
  initialData: IpPassRow | null;
}

const modeOptions = [
  { label: 'Standard Mode', value: '0' },
  { label: 'Compatibility Mode', value: '1' },
];

export const MultipleIpPassthroughEditModal: React.FC<MultipleIpPassthroughEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData
}) => {
  const [editFlag, setEditFlag] = useState('0');
  const [editMode, setEditMode] = useState('0');
  const [editMac, setEditMac] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setEditFlag(initialData.flag);
      setEditMode(initialData.mode);
      setEditMac(initialData.mac);
      setEditError('');
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
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

    if (initialData) {
      onSave({
        id: initialData.id,
        flag: editFlag,
        mode: editMode,
        mac: editMac
      });
    }
  };

  if (!isOpen || !initialData) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">Edit IP Passthrough{initialData.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pb-8 pt-6">
          <div className="mb-6 flex items-center justify-between">
            <label className="block font-bold text-sm text-black">Enabled</label>
            <SquareSwitch isOn={editFlag === '1'} onChange={() => setEditFlag(editFlag === '1' ? '0' : '1')} />
          </div>

          {editFlag === '1' && (
            <>
              <div className="mb-6">
                <label className="block font-bold text-sm mb-2 text-black">Mode</label>
                <StyledSelect
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value)}
                  options={modeOptions}
                />
              </div>

              {editMode === '0' && (
                <div className="mb-6">
                  <label className="block font-bold text-sm mb-2 text-black">
                    <span className="text-red-500 me-1">*</span>MAC Address
                  </label>
                  <input 
                    type="text" 
                    value={editMac}
                    onChange={(e) => {
                        setEditMac(e.target.value);
                        if (editError) setEditError('');
                    }}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] ${editError ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                  />
                  {editError && (
                      <p className="text-red-500 text-sm mt-1">{editError}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-4 mt-8">
            <button 
                onClick={onClose}
                className="bg-white border-2 border-black text-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm hover:bg-gray-50"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm hover:bg-gray-200"
            >
                Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
