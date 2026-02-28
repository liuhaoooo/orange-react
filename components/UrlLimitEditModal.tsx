import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';
import { UrlLimitRule } from '../utils/api';
import { FormRow, StyledInput } from './UIComponents';

interface UrlLimitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: UrlLimitRule[]) => void;
  initialData: UrlLimitRule | null;
  prefilledMacs?: string[];
}

export const UrlLimitEditModal: React.FC<UrlLimitEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  prefilledMacs = []
}) => {
  const [macAddress, setMacAddress] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMacAddress(initialData.mac);
        setUrl(initialData.url);
      } else {
        setMacAddress(prefilledMacs.join(', '));
        setUrl('');
      }
      setErrors({});
    }
  }, [isOpen, initialData, prefilledMacs]);

  if (!isOpen) return null;

  const validateMac = (mac: string) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac.trim());
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!macAddress.trim()) {
      newErrors.macAddress = 'MAC Address is required';
    } else {
      const macs = macAddress.split(',').map(m => m.trim());
      const invalidMacs = macs.filter(m => !validateMac(m));
      if (invalidMacs.length > 0) {
        newErrors.macAddress = 'Invalid MAC Address format';
      }
    }

    if (!url.trim()) {
      newErrors.url = 'URL is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const macs = macAddress.split(',').map(m => m.trim());
    const urls = url.split(',').map(u => u.trim());

    const newRules: UrlLimitRule[] = [];

    macs.forEach(mac => {
      urls.forEach(u => {
        newRules.push({
          enableRule: initialData ? initialData.enableRule : true,
          enableLink: false,
          mac: mac,
          url: u,
          ippro: initialData ? initialData.ippro : 'IPV4V6'
        });
      });
    });

    onSave(newRules);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">
            {initialData ? 'Edit Rule' : 'Add Rule'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 pb-8 pt-6">
          <div className="bg-[#fff8e6] text-[#b38000] p-3 rounded-[2px] mb-6 flex items-center text-sm">
            <AlertCircle size={16} className="me-2 shrink-0" />
            Use when entering multiple urls, separated
          </div>

          <FormRow label="MAC Address" required={true} error={errors.macAddress} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={macAddress}
                onChange={(e) => {
                  setMacAddress(e.target.value);
                  setErrors(prev => ({ ...prev, macAddress: '' }));
                }}
                hasError={!!errors.macAddress}
              />
            </div>
          </FormRow>

          <FormRow label="URL" required={true} error={errors.url} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setErrors(prev => ({ ...prev, url: '' }));
                }}
                hasError={!!errors.url}
              />
            </div>
          </FormRow>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              onClick={onClose}
              className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]"
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
