import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { PortForwardingRule } from '../utils/api';
import { FormRow, StyledInput } from './UIComponents';

interface PortForwardingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: PortForwardingRule) => void;
  initialData: PortForwardingRule | null;
  existingRules: PortForwardingRule[];
}

export const PortForwardingEditModal: React.FC<PortForwardingEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingRules
}) => {
  const [protocol, setProtocol] = useState('TCP');
  const [sourcePort, setSourcePort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [destinationIp, setDestinationIp] = useState('');
  const [remark, setRemark] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProtocol(initialData.protocol || 'TCP');
        setSourcePort(initialData.port);
        setDestinationPort(initialData.mappingPort);
        setDestinationIp(initialData.mappingIp);
        setRemark(initialData.remark);
      } else {
        setProtocol('TCP');
        setSourcePort('');
        setDestinationPort('');
        setDestinationIp('');
        setRemark('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validatePort = (p: string) => {
    const portNum = parseInt(p, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const validateIp = (ipAddress: string) => {
    const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ipAddress);
  };

  const handleSave = () => {
    const newErrors: { [key: string]: string } = {};

    if (!sourcePort.trim()) {
      newErrors.sourcePort = 'Source Port is required';
    } else if (!validatePort(sourcePort.trim())) {
      newErrors.sourcePort = 'Invalid Port. Must be between 1 and 65535';
    }

    if (!destinationPort.trim()) {
      newErrors.destinationPort = 'Destination Port is required';
    } else if (!validatePort(destinationPort.trim())) {
      newErrors.destinationPort = 'Invalid Port. Must be between 1 and 65535';
    }

    if (!destinationIp.trim()) {
      newErrors.destinationIp = 'Destination IP is required';
    } else if (!validateIp(destinationIp.trim())) {
      newErrors.destinationIp = 'Invalid IP Address format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check for duplicates
    const isDuplicate = existingRules.some(
      (r) => r.port === sourcePort.trim() && r.protocol === protocol && r !== initialData
    );
    if (isDuplicate) {
      setErrors({ sourcePort: 'This Source Port and Protocol combination already exists' });
      return;
    }

    onSave({
      enableRule: initialData ? initialData.enableRule : true,
      ifName: initialData ? initialData.ifName : 'APN',
      mappingIp: destinationIp.trim(),
      mappingIpPort: `${destinationIp.trim()}:${destinationPort.trim()}`,
      mappingPort: destinationPort.trim(),
      port: sourcePort.trim(),
      protocol: protocol,
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
          <FormRow label="Protocol" className="border-b-0 py-2">
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

          <FormRow label="Source Port" required={true} error={errors.sourcePort} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={sourcePort}
                onChange={(e) => {
                  setSourcePort(e.target.value);
                  setErrors(prev => ({ ...prev, sourcePort: '' }));
                }}
                hasError={!!errors.sourcePort}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">Example:80(http), 443(https)</div>
            </div>
          </FormRow>

          <FormRow label="Destination Port" required={true} error={errors.destinationPort} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={destinationPort}
                onChange={(e) => {
                  setDestinationPort(e.target.value);
                  setErrors(prev => ({ ...prev, destinationPort: '' }));
                }}
                hasError={!!errors.destinationPort}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">Example:200</div>
            </div>
          </FormRow>

          <FormRow label="Destination IP" required={true} error={errors.destinationIp} className="border-b-0 py-2 mt-4" alignTop={true}>
            <div className="w-full">
              <StyledInput
                type="text"
                value={destinationIp}
                onChange={(e) => {
                  setDestinationIp(e.target.value);
                  setErrors(prev => ({ ...prev, destinationIp: '' }));
                }}
                hasError={!!errors.destinationIp}
              />
              <div className="text-xs text-gray-400 mt-1 text-right">Example:192.168.0.1</div>
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
