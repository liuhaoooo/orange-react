
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { ApnProfile } from '../utils/api';

interface ApnAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newApn: ApnProfile) => void;
  initialData?: ApnProfile | null;
}

export const ApnAddModal: React.FC<ApnAddModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { t } = useLanguage();
  
  // Form State
  const [pdpType, setPdpType] = useState('IPV4');
  const [profileName, setProfileName] = useState('');
  const [apn, setApn] = useState('');
  const [authType, setAuthType] = useState('1'); // Default to PAP ('1') based on design
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<{ profileName?: boolean; apn?: boolean }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode: Pre-fill data
        setPdpType(initialData.ipVersion || 'IPV4');
        setProfileName(initialData.name || '');
        setApn(initialData.apnName || '');
        setAuthType(initialData.selectAuthtication || '0');
        setUsername(initialData.apnUserName || '');
        setPassword(initialData.apnUserPassword || '');
      } else {
        // Add Mode: Reset form
        setPdpType('IPV4');
        setProfileName('');
        setApn('');
        setAuthType('1'); // 1 = PAP
        setUsername('');
        setPassword('');
      }
      setShowPassword(false);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors: { profileName?: boolean; apn?: boolean } = {};
    let isValid = true;

    if (!profileName.trim()) {
      newErrors.profileName = true;
      isValid = false;
    }
    if (!apn.trim()) {
      newErrors.apn = true;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validate()) {
      const newApn: ApnProfile = {
        // Preserve flags if editing, otherwise set defaults for new
        default_flag: initialData?.default_flag || '0', 
        edit_flag: '1',    // Always editable if created/edited via UI
        name: profileName,
        apnName: apn,
        ipVersion: pdpType,
        selectAuthtication: authType,
        apnUserName: username,
        apnUserPassword: password
      };
      onSave(newApn);
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold text-black">{initialData ? 'Edit Rule' : 'Add Rule'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-2">
          
          {/* PDP Type */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">PDP Type</label>
             <div className="w-full sm:w-2/3 relative">
                <select 
                    value={pdpType}
                    onChange={(e) => setPdpType(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                >
                    <option value="IPV4">IPV4</option>
                    <option value="IPV6">IPV6</option>
                    <option value="IPV4&IPV6">IPV4 & IPv6</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
             </div>
          </div>

          {/* Profile Name */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0 pt-2">
                <span className="text-red-500 me-1">*</span>Profile Name
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => {
                        setProfileName(e.target.value);
                        if(errors.profileName) setErrors({...errors, profileName: false});
                    }}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.profileName ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.profileName && (
                    <p className="text-red-500 text-sm mt-1">can not be empty.</p>
                )}
             </div>
          </div>

          {/* APN */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-start">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0 pt-2">
                <span className="text-red-500 me-1">*</span>APN
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={apn}
                    onChange={(e) => {
                        setApn(e.target.value);
                        if(errors.apn) setErrors({...errors, apn: false});
                    }}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.apn ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
                {errors.apn && (
                    <p className="text-red-500 text-sm mt-1">can not be empty.</p>
                )}
             </div>
          </div>

          {/* Authentication */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">Authentication</label>
             <div className="w-full sm:w-2/3 relative">
                <select 
                    value={authType}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                >
                    <option value="0">NONE</option>
                    <option value="1">PAP</option>
                    <option value="2">CHAP</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
             </div>
          </div>

          {/* Username */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">Username</label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white"
                />
             </div>
          </div>

          {/* Password */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">Password</label>
             <div className="w-full sm:w-2/3 relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
             </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <button 
                onClick={onClose}
                className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-10 text-sm transition-all rounded-[2px] shadow-sm hover:bg-gray-200"
            >
                Cancel
            </button>
            <button 
                onClick={handleSave}
                className="bg-[#eeeeee] border-2 border-black text-black font-bold py-2 px-10 text-sm transition-all rounded-[2px] shadow-sm hover:bg-gray-200"
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
