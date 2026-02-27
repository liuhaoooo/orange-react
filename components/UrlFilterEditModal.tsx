import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UrlFilterRule } from '../utils/api';

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
      enabled: initialData ? initialData.enabled : true,
      priority: initialData ? initialData.priority : existingRules.length + 1,
      url: url.trim(),
      remark: remark.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[2px] w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold text-black">
            {initialData ? 'Edit Rule' : 'Add Rule'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-3 pt-2">
              <label className="text-sm font-bold text-black">
                <span className="text-red-500 mr-1">*</span>URL
              </label>
            </div>
            <div className="col-span-9">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                className="w-full border border-gray-200 rounded-[2px] p-2 text-sm focus:outline-none focus:border-gray-400"
              />
              <div className="text-right text-gray-400 text-xs mt-1">
                Example: www.google.com
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-3 pt-2">
              <label className="text-sm font-bold text-black">Remark</label>
            </div>
            <div className="col-span-9">
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-[2px] p-2 text-sm focus:outline-none focus:border-gray-400 resize-y"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
        </div>

        <div className="flex justify-end space-x-4 p-6 pt-2">
          <button
            onClick={onClose}
            className="bg-[#f5f5f5] border-2 border-black text-black hover:bg-gray-200 font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#f5f5f5] border-2 border-black text-black hover:bg-gray-200 font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
