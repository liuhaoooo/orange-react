
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import { RoutingRule } from '../utils/services/types';

interface RoutingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: RoutingRule) => void;
  initialData?: RoutingRule | null;
  interfaceOptions: { label: string; value: string }[];
}

export const RoutingEditModal: React.FC<RoutingEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  interfaceOptions
}) => {
  const [ifName, setIfName] = useState('WAN');
  const [isValid, setIsValid] = useState(true);
  const [ip, setIp] = useState('');
  const [netmask, setNetmask] = useState('');
  const [gateway, setGateway] = useState('');
  const [errors, setErrors] = useState<{ ip?: string; netmask?: string; gateway?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setIfName(initialData.ifName);
        setIsValid(initialData.valid);
        setIp(initialData.ip);
        setNetmask(initialData.netmask);
        setGateway(initialData.gateway);
      } else {
        // Default to first option or WAN if available
        setIfName(interfaceOptions.length > 0 ? interfaceOptions[0].value : 'WAN');
        setIsValid(true);
        setIp('');
        setNetmask('');
        setGateway('');
      }
      setErrors({});
    }
  }, [isOpen, initialData, interfaceOptions]);

  const validateIp = (value: string) => {
    // Simple regex for IPv4 validation
    const regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(value);
  };

  const handleSave = () => {
    const newErrors: { ip?: string; netmask?: string; gateway?: string } = {};
    let validForm = true;

    if (!ip) {
      newErrors.ip = 'can not be empty';
      validForm = false;
    } else if (!validateIp(ip)) {
      newErrors.ip = 'Invalid IP Address';
      validForm = false;
    }

    if (!netmask) {
      newErrors.netmask = 'can not be empty';
      validForm = false;
    } else if (!validateIp(netmask)) {
      newErrors.netmask = 'Invalid Subnet Mask';
      validForm = false;
    }

    if (!gateway) {
      newErrors.gateway = 'can not be empty';
      validForm = false;
    } else if (!validateIp(gateway)) {
      newErrors.gateway = 'Invalid Gateway';
      validForm = false;
    }

    setErrors(newErrors);

    if (validForm) {
      onSave({
        ifName,
        valid: isValid,
        ip,
        netmask,
        gateway
      });
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
          
          {/* Interface */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">Interface</label>
             <div className="w-full sm:w-2/3 relative">
                <select 
                    value={ifName}
                    onChange={(e) => setIfName(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                >
                    {interfaceOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
             </div>
          </div>

          {/* State */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">State</label>
             <div className="w-full sm:w-2/3 flex items-center gap-6">
                <label className="flex items-center cursor-pointer select-none">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center me-2 transition-colors ${isValid ? 'border-black' : 'border-gray-300'}`}>
                        {isValid && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                    </div>
                    <span className={`text-sm ${isValid ? 'text-black font-bold' : 'text-gray-500'}`}>Take effect</span>
                    <input 
                        type="radio" 
                        className="hidden" 
                        checked={isValid} 
                        onChange={() => setIsValid(true)} 
                    />
                </label>
                <label className="flex items-center cursor-pointer select-none">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center me-2 transition-colors ${!isValid ? 'border-black' : 'border-gray-300'}`}>
                        {!isValid && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                    </div>
                    <span className={`text-sm ${!isValid ? 'text-black font-bold' : 'text-gray-500'}`}>Invalid status</span>
                    <input 
                        type="radio" 
                        className="hidden" 
                        checked={!isValid} 
                        onChange={() => setIsValid(false)} 
                    />
                </label>
             </div>
          </div>

          {/* Destination IP Address */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0 pt-2">
                <span className="text-red-500 me-1">*</span>Destination IP Address
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={ip}
                    onChange={(e) => {
                        setIp(e.target.value);
                        if(errors.ip) setErrors({...errors, ip: undefined});
                    }}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.ip ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.ip && (
                    <p className="text-red-500 text-sm mt-1">{errors.ip}</p>
                )}
             </div>
          </div>

          {/* Subnet Mask */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0 pt-2">
                <span className="text-red-500 me-1">*</span>Subnet Mask
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={netmask}
                    onChange={(e) => {
                        setNetmask(e.target.value);
                        if(errors.netmask) setErrors({...errors, netmask: undefined});
                    }}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.netmask ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.netmask && (
                    <p className="text-red-500 text-sm mt-1">{errors.netmask}</p>
                )}
             </div>
          </div>

          {/* Gateway */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-start">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0 pt-2">
                <span className="text-red-500 me-1">*</span>Gateway
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={gateway}
                    onChange={(e) => {
                        setGateway(e.target.value);
                        if(errors.gateway) setErrors({...errors, gateway: undefined});
                    }}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.gateway ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.gateway && (
                    <p className="text-red-500 text-sm mt-1">{errors.gateway}</p>
                )}
             </div>
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
