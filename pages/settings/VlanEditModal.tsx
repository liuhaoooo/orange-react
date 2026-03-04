import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '../../utils/i18nContext';
import { StyledInput, FormRow } from '../../components/UIComponents';

interface VlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vlanId: string) => void;
  initialVlanId?: string;
  title?: string;
}

export const VlanEditModal: React.FC<VlanEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialVlanId = '',
  title = 'Add Rule'
}) => {
  const { t } = useLanguage();
  const [vlanId, setVlanId] = useState(initialVlanId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVlanId(initialVlanId);
      setError('');
    }
  }, [isOpen, initialVlanId]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!vlanId) {
      setError(t('emptyError') || 'Cannot be empty');
      return;
    }
    const idNum = parseInt(vlanId, 10);
    if (isNaN(idNum) || idNum < 1 || idNum > 4094) {
      setError('VLAN ID must be between 1 and 4094');
      return;
    }
    onSave(vlanId);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <FormRow label="VLAN ID" required error={error}>
            <StyledInput 
              value={vlanId}
              onChange={(e) => {
                setVlanId(e.target.value);
                setError('');
              }}
            />
          </FormRow>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 pt-4 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#eeeeee] border-2 border-black text-black font-bold text-sm transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-white border-2 border-black text-black font-bold text-sm transition-colors hover:bg-gray-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
