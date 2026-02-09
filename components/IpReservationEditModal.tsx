
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { IpReservationRule } from '../utils/services/types';

interface IpReservationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: IpReservationRule) => void;
  initialData?: IpReservationRule | null;
  existingRules?: IpReservationRule[];
  currentLanIp?: string;
  currentNetmask?: string;
}

const ipToLong = (ip: string) => {
    const octets = ip.split('.');
    if (octets.length !== 4) return 0;
    return octets.reduce((acc, octet) => {
        return ((acc << 8) + parseInt(octet, 10)) >>> 0;
    }, 0);
};

export const IpReservationEditModal: React.FC<IpReservationEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  existingRules = [],
  currentLanIp,
  currentNetmask
}) => {
  const [ip, setIp] = useState('');
  const [mac, setMac] = useState('');
  const [errors, setErrors] = useState<{ ip?: string; mac?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setIp(initialData.ip);
        setMac(initialData.mac);
      } else {
        setIp('');
        setMac('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const isValidIp = (ip: string) => {
    if (!ip) return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        if (!/^\d+$/.test(part)) return false;
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255;
    });
  };

  const validateMac = (addr: string) => {
    // Basic MAC validation (e.g., AA:BB:CC:DD:EE:FF)
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(addr);
  };

  const checkNetworkBroadcast = (ipAddr: string) => {
      if (!currentLanIp || !currentNetmask) return null;
      
      const ipNum = ipToLong(ipAddr);
      const maskNum = ipToLong(currentNetmask);
      const lanNum = ipToLong(currentLanIp);

      const network = (lanNum & maskNum) >>> 0;
      const broadcast = (network | (~maskNum >>> 0)) >>> 0;

      if (ipNum === network) return 'IP cannot be the Network Address.';
      if (ipNum === broadcast) return 'IP cannot be the Broadcast Address.';
      return null;
  };

  const handleSave = () => {
    const trimmedIp = ip.trim();
    const trimmedMac = mac.trim().toUpperCase();
    
    const newErrors: { ip?: string; mac?: string } = {};
    let isValid = true;

    // Validate IP
    if (!trimmedIp) {
      newErrors.ip = 'IP can not be empty.';
      isValid = false;
    } else if (!isValidIp(trimmedIp)) {
      newErrors.ip = 'Invalid IP Address format.';
      isValid = false;
    } else if (currentLanIp && trimmedIp === currentLanIp) {
        newErrors.ip = 'IP Address cannot be the same as LAN IP.';
        isValid = false;
    } else {
        const netErr = checkNetworkBroadcast(trimmedIp);
        if (netErr) {
            newErrors.ip = netErr;
            isValid = false;
        } else {
            // Check Duplicate IP
            const isIpDup = existingRules.some(r => r.ip === trimmedIp && r !== initialData);
            if (isIpDup) {
                newErrors.ip = 'IP Address already exists.';
                isValid = false;
            }
        }
    }

    // Validate MAC
    if (!trimmedMac) {
      newErrors.mac = 'MAC can not be empty.';
      isValid = false;
    } else if (!validateMac(trimmedMac)) {
      newErrors.mac = 'Invalid MAC Address format (e.g. 00:11:22:33:44:55).';
      isValid = false;
    } else {
        // Check Duplicate MAC
        const isMacDup = existingRules.some(r => r.mac === trimmedMac && r !== initialData);
        if (isMacDup) {
            newErrors.mac = 'MAC Address already exists.';
            isValid = false;
        }
    }

    setErrors(newErrors);

    if (isValid) {
      onSave({ ip: trimmedIp, mac: trimmedMac });
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
            <label className="block font-bold text-sm text-black w-full sm:w-1/4 mb-2 sm:mb-0">
              <span className="text-red-500 me-1">*</span>IP
            </label>
            <div className="w-full sm:w-3/4">
                <input 
                type="text" 
                value={ip}
                onChange={(e) => {
                    setIp(e.target.value);
                    if (errors.ip) setErrors(prev => ({ ...prev, ip: undefined }));
                }}
                className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] ${errors.ip ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.ip && (
                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.ip}</p>
                )}
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
            <label className="block font-bold text-sm text-black w-full sm:w-1/4 mb-2 sm:mb-0">
              <span className="text-red-500 me-1">*</span>MAC
            </label>
            <div className="w-full sm:w-3/4">
                <input 
                type="text" 
                value={mac}
                onChange={(e) => {
                    setMac(e.target.value);
                    if (errors.mac) setErrors(prev => ({ ...prev, mac: undefined }));
                }}
                className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] ${errors.mac ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.mac && (
                    <p className="text-red-500 text-xs mt-1 font-bold">{errors.mac}</p>
                )}
            </div>
          </div>

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
