
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { MacFilterRule } from '../utils/services/types';

interface MacFilterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: MacFilterRule) => void;
  initialData?: MacFilterRule | null;
  existingMacs?: string[];
}

export const MacFilterEditModal: React.FC<MacFilterEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  existingMacs = []
}) => {
  const [mac, setMac] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<{ mac?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMac(initialData.mac);
        setRemark(initialData.remarks);
      } else {
        setMac('');
        setRemark('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateMac = (addr: string) => {
    // Basic MAC validation (e.g., AA:BB:CC:DD:EE:FF)
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(addr);
  };

  const handleSave = () => {
    const trimmedMac = mac.trim().toUpperCase();
    const trimmedRemark = remark.trim();
    const newErrors: { mac?: string } = {};
    let isValid = true;

    if (!trimmedMac) {
      newErrors.mac = 'can not be empty.';
      isValid = false;
    } else if (!validateMac(trimmedMac)) {
      newErrors.mac = 'Invalid MAC Address format (e.g. 00:11:22:33:44:55).';
      isValid = false;
    } else if (existingMacs.includes(trimmedMac) && trimmedMac !== initialData?.mac) {
      newErrors.mac = 'MAC Address already exists.';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onSave({ mac: trimmedMac, remarks: trimmedRemark });
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">{initialData ? 'Edit Rule' : 'Add Rule'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pb-8 pt-6">
          <div className="mb-6">
            <label className="block font-bold text-sm mb-2 text-black">
              <span className="text-red-500 me-1">*</span>MAC Address
            </label>
            <input 
              type="text" 
              value={mac}
              onChange={(e) => {
                  setMac(e.target.value);
                  if (errors.mac) setErrors({});
              }}
              placeholder="XX:XX:XX:XX:XX:XX"
              className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] ${errors.mac ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
            />
            {errors.mac && (
                <p className="text-red-500 text-sm mt-1">{errors.mac}</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block font-bold text-sm mb-2 text-black">Remark</label>
            <textarea 
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] resize-none h-24"
            />
          </div>

          <div className="flex justify-end space-x-4">
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
