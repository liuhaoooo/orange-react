import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PortFilterRule } from '../utils/api';
import { FormRow, StyledInput } from './UIComponents';

interface PortFilterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: PortFilterRule) => void;
  initialData: PortFilterRule | null;
  existingRules: PortFilterRule[];
}

export const PortFilterEditModal: React.FC<PortFilterEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingRules
}) => {
  const [port, setPort] = useState('');
  const [remark, setRemark] = useState('');
  const [ippro, setIppro] = useState('IPV4');
  const [protocol, setProtocol] = useState('TCP');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setPort(initialData.port);
        setRemark(initialData.remark);
        setIppro(initialData.ippro || 'IPV4');
        setProtocol(initialData.protocol || 'TCP');
      } else {
        setPort('');
        setRemark('');
        setIppro('IPV4');
        setProtocol('TCP');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validatePort = (p: string) => {
    const portNum = parseInt(p, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const handleSave = () => {
    if (!port.trim()) {
      setError('Port is required');
      return;
    }

    if (!validatePort(port.trim())) {
      setError('Invalid Port. Must be between 1 and 65535');
      return;
    }

    // Check for duplicates
    const isDuplicate = existingRules.some(
      (r) => r.port === port.trim() && r.protocol === protocol && r !== initialData
    );
    if (isDuplicate) {
      setError('This Port and Protocol combination already exists in the rules');
      return;
    }

    onSave({
      enableLink: initialData ? initialData.enableLink : false, // Will be overridden by parent based on mode
      enableRule: initialData ? initialData.enableRule : true,
      ippro: ippro,
      protocol: protocol,
      port: port.trim(),
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
          <FormRow label="IPv4/IPv6" className="border-b-0 py-2">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${ippro === 'IPV4' ? 'border-black' : 'border-gray-300'}`}>
                  {ippro === 'IPV4' && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span className="text-sm text-gray-700">IPv4</span>
                <input 
                  type="radio" 
                  name="ippro" 
                  value="IPV4" 
                  checked={ippro === 'IPV4'} 
                  onChange={() => setIppro('IPV4')} 
                  className="hidden" 
                />
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${ippro === 'IPV6' ? 'border-black' : 'border-gray-300'}`}>
                  {ippro === 'IPV6' && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span className="text-sm text-gray-700">IPv6</span>
                <input 
                  type="radio" 
                  name="ippro" 
                  value="IPV6" 
                  checked={ippro === 'IPV6'} 
                  onChange={() => setIppro('IPV6')} 
                  className="hidden" 
                />
              </label>
            </div>
          </FormRow>

          <FormRow label="Protocol" className="border-b-0 py-2 mt-4">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${protocol === 'TCP' ? 'border-black' : 'border-gray-300'}`}>
                  {protocol === 'TCP' && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span className="text-sm text-gray-700">TCP</span>
                <input 
                  type="radio" 
                  name="protocol" 
                  value="TCP" 
                  checked={protocol === 'TCP'} 
                  onChange={() => setProtocol('TCP')} 
                  className="hidden" 
                />
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${protocol === 'UDP' ? 'border-black' : 'border-gray-300'}`}>
                  {protocol === 'UDP' && <div className="w-2 h-2 bg-black rounded-full" />}
                </div>
                <span className="text-sm text-gray-700">UDP</span>
                <input 
                  type="radio" 
                  name="protocol" 
                  value="UDP" 
                  checked={protocol === 'UDP'} 
                  onChange={() => setProtocol('UDP')} 
                  className="hidden" 
                />
              </label>
            </div>
          </FormRow>

          <FormRow label="Port" required={true} error={error && error.includes('Port') ? error : undefined} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={port}
                onChange={(e) => {
                  setPort(e.target.value);
                  setError('');
                }}
                hasError={!!(error && error.includes('Port'))}
              />
            </div>
          </FormRow>

          <FormRow label="Remark" className="border-b-0 py-2 mt-4" alignTop={true}>
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
