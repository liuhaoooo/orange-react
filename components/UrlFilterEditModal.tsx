import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { UrlFilterRule } from '../utils/api';
import { FormRow, StyledInput } from './UIComponents';

interface UrlFilterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: UrlFilterRule) => void;
  initialData: UrlFilterRule | null;
  existingRules: UrlFilterRule[];
}

export const UrlFilterEditModal: React.FC<UrlFilterEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingRules
}) => {
  const [url, setUrl] = useState('');
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setUrl(initialData.url);
        setRemark(initialData.remark);
      } else {
        setUrl('');
        setRemark('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    // Basic URL validation
    const urlPattern = /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
    if (!urlPattern.test(url.trim())) {
      setError('Invalid URL format');
      return;
    }

    // Check for duplicates
    const isDuplicate = existingRules.some(
      (r) => r.url === url.trim() && r !== initialData
    );
    if (isDuplicate) {
      setError('This URL already exists in the rules');
      return;
    }

    onSave({
      enableLink: initialData ? initialData.enableLink : false, // Will be overridden by parent based on mode
      enableRule: initialData ? initialData.enableRule : true,
      ippro: initialData ? initialData.ippro : 'IPV4V6',
      url: url.trim(),
      remark: remark.trim()
    });
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
          <FormRow label="URL" required={true} error={error && error.includes('URL') ? error : undefined} className="border-b-0 py-2" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                hasError={!!(error && error.includes('URL'))}
              />
              <div className="text-right text-gray-400 text-xs mt-1">
                Example: www.google.com
              </div>
            </div>
          </FormRow>

          <FormRow label="Remark" className="border-b-0 py-2" alignTop={true}>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] focus:border-orange focus:ring-1 focus:ring-orange resize-y"
            />
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
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
