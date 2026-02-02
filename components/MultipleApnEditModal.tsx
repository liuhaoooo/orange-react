import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

interface MultipleApnEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}

const BlackSquareSwitch = ({ isOn, onChange }: { isOn: boolean; onChange: () => void }) => (
  <div 
    className="flex border border-black w-14 h-8 cursor-pointer select-none"
    onClick={onChange}
  >
    <div className={`flex-1 flex items-center justify-center transition-colors ${isOn ? 'bg-black text-white' : 'bg-white'}`}>
      {isOn && <Check size={18} strokeWidth={3} />}
    </div>
    <div className={`flex-1 flex items-center justify-center transition-colors bg-white`}>
      {/* Right side is empty/white based on design in prompt image */}
    </div>
  </div>
);

export const MultipleApnEditModal: React.FC<MultipleApnEditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const { t } = useLanguage();
  
  const [configName, setConfigName] = useState('');
  const [nat, setNat] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [mtu, setMtu] = useState('');
  const [pdpType, setPdpType] = useState('IP');
  const [authType, setAuthType] = useState('0');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{ configName?: boolean; mtu?: boolean }>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setConfigName(initialData.apnProfileName || '');
      setNat(initialData.apnNat === '1');
      setProfileName(initialData.apnName || '');
      setMtu(initialData.apnMTU || '1500');
      setPdpType(initialData.pppType || 'IP');
      setAuthType(initialData.authType || '0');
      setUsername(initialData.pppUsername || '');
      setPassword(initialData.pppPasswd || '');
      
      setShowPassword(false);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const PDP_OPTIONS = [
    { value: 'IP', name: 'IPV4' },
    { value: 'IPV6', name: 'IPV6' },
    { value: 'IPV4V6', name: 'IPV4&V6' },
  ];

  const AUTH_OPTIONS = [
    { value: '0', name: 'NONE' },
    { value: '1', name: 'PAP' },
    { value: '2', name: 'CHAP' },
    { value: '3', name: 'PAP&CHAP' },
  ];

  const handleSave = () => {
    const newErrors: { configName?: boolean; mtu?: boolean } = {};
    let isValid = true;

    if (!configName.trim()) {
      newErrors.configName = true;
      isValid = false;
    }
    if (!mtu.trim()) {
      newErrors.mtu = true;
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      onSave({
        apnProfileName: configName,
        apnNat: nat ? '1' : '0',
        apnName: profileName,
        apnMTU: mtu,
        pppType: pdpType,
        authType: authType,
        pppUsername: username,
        pppPasswd: password
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-4">
          <h2 className="text-xl font-bold text-black">Edit Rule</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-2">
          
          {/* Configuration Name */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">
                <span className="text-red-500 me-1">*</span>Configuration name
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.configName ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
             </div>
          </div>

          {/* NAT */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">NAT</label>
             <div className="w-full sm:w-2/3">
                <BlackSquareSwitch isOn={nat} onChange={() => setNat(!nat)} />
             </div>
          </div>

          {/* Profile Name */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">Profile Name</label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white"
                />
             </div>
          </div>

          {/* MTU */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">
                <span className="text-red-500 me-1">*</span>MTU
             </label>
             <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={mtu}
                    onChange={(e) => setMtu(e.target.value)}
                    className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white ${errors.mtu ? 'border-red-500' : 'border-gray-300 focus:border-orange'}`}
                />
             </div>
          </div>

          {/* PDP Type */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center">
             <label className="font-bold text-sm text-black w-1/3 mb-2 sm:mb-0">PDP Type</label>
             <div className="w-full sm:w-2/3 relative">
                <select 
                    value={pdpType}
                    onChange={(e) => setPdpType(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                >
                    {PDP_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.name}</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
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
                    {AUTH_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.name}</option>
                    ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
             </div>
          </div>

          {/* Username & Password */}
          {authType !== '0' && (
            <>
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
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
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
