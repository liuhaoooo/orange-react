
import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertTriangle, Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import { fetchApnSettings, fetchApnList, ApnProfile, saveApnConfig, saveApnList, ApnConfigResponse } from '../../utils/api';
import { ApnAddModal } from '../../components/ApnAddModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';

// Reusable Form Components
const SectionRow = ({ label, children, required = false }: { label: string; children?: React.ReactNode; required?: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-orange me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
    </div>
  </div>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    {...props}
    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] bg-white placeholder-gray-400"
  />
);

const StyledSelect = ({ value, onChange, options }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {label: string, value: string}[] }) => (
  <div className="relative w-full">
    <select 
      value={value} 
      onChange={onChange}
      className="w-full border border-black px-3 py-2 text-sm text-black outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer font-medium"
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-black">
        <ChevronDown size={16} strokeWidth={3} />
    </div>
  </div>
);

const RadioGroup = ({ options, value, onChange }: { options: { label: string; value: any }[], value: any, onChange: (val: any) => void }) => (
  <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
    {options.map((opt) => (
      <label key={opt.label} className="flex items-center cursor-pointer select-none group">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center me-2 transition-colors shrink-0 ${value === opt.value ? 'border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
        </div>
        <span className={`text-sm font-bold ${value === opt.value ? 'text-black' : 'text-gray-500 group-hover:text-gray-700'}`}>{opt.label}</span>
        <input 
            type="radio" 
            className="hidden" 
            checked={value === opt.value} 
            onChange={() => onChange(opt.value)} 
        />
      </label>
    ))}
  </div>
);

export const ApnSettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [apnList, setApnList] = useState<ApnProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ApnProfile | null>(null);
  const [initialConfig, setInitialConfig] = useState<ApnConfigResponse | null>(null);

  // Form State
  const [natEnabled, setNatEnabled] = useState(false);
  const [mtu, setMtu] = useState('1500');
  const [apnMode, setApnMode] = useState<'auto' | 'manual'>('auto');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ApnProfile | null>(null);
  
  // Delete Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const initData = async () => {
        try {
            // Fetch Config (CMD 213)
            const configRes = await fetchApnSettings();
            if (configRes && configRes.success) {
                setNatEnabled(configRes.apnNatName === '1');
                setMtu(configRes.apnMTU || '1500');
                setInitialConfig(configRes);
            }

            // Fetch List (CMD 248)
            const listRes = await fetchApnList();
            if (listRes && listRes.success && listRes.apn_list) {
                setApnList(listRes.apn_list);
                
                // Find default selected profile (default_flag === '1')
                const def = listRes.apn_list.find(p => p.default_flag === '1');
                if (def) {
                    setSelectedProfile(def);
                    // Set mode based on profile type
                    // edit_flag: '0' -> Auto, '1' -> Manual
                    setApnMode(def.edit_flag === '0' ? 'auto' : 'manual');
                } else if (listRes.apn_list.length > 0) {
                    // Fallback if no default, pick first
                    setSelectedProfile(listRes.apn_list[0]);
                    setApnMode(listRes.apn_list[0].edit_flag === '0' ? 'auto' : 'manual');
                }
            }
        } catch (e) {
            console.error("Failed to fetch APN data", e);
        } finally {
            setLoading(false);
        }
    };

    initData();
  }, []);

  const handleModeChange = (mode: 'auto' | 'manual') => {
      setApnMode(mode);
      // Logic: Filter available profiles by mode
      const targetFlag = mode === 'auto' ? '0' : '1';
      const available = apnList.filter(p => p.edit_flag === targetFlag);
      
      // Try to find default profile for this mode (default_flag === '1')
      const def = available.find(p => p.default_flag === '1');
      
      if (def) {
          setSelectedProfile(def);
      } else if (available.length > 0) {
          setSelectedProfile(available[0]);
      } else {
          // No profile available for this mode
          setSelectedProfile(null); 
      }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const name = e.target.value;
      const profile = apnList.find(p => p.name === name);
      if (profile) {
          setSelectedProfile(profile);
      }
  };

  const handleAddApnClick = () => {
      setEditingProfile(null);
      setIsModalOpen(true);
  };

  const handleEditApnClick = () => {
      if (selectedProfile) {
          setEditingProfile(selectedProfile);
          setIsModalOpen(true);
      }
  };

  const handleDeleteApnClick = () => {
      if (selectedProfile) {
          setIsDeleteConfirmOpen(true);
      }
  };

  const handleConfirmDelete = () => {
      if (!selectedProfile) return;

      // Filter out the deleted profile
      const updatedList = apnList.filter(p => p !== selectedProfile);
      setApnList(updatedList);
      setIsDeleteConfirmOpen(false);

      // Determine next selection based on default_flag or availability
      const targetFlag = apnMode === 'auto' ? '0' : '1';
      const available = updatedList.filter(p => p.edit_flag === targetFlag);
      
      const def = available.find(p => p.default_flag === '1');
      
      if (def) {
          setSelectedProfile(def);
      } else if (available.length > 0) {
          setSelectedProfile(available[0]);
      } else {
          setSelectedProfile(null);
      }
  };

  const handleSaveModal = (newApn: ApnProfile) => {
      if (editingProfile) {
          // Edit Mode: Update existing entry in list
          const updatedList = apnList.map(p => p === editingProfile ? newApn : p);
          setApnList(updatedList);
          setSelectedProfile(newApn);
      } else {
          // Add Mode
          // Check if we already have manual profiles
          const existingManual = apnList.filter(p => p.edit_flag === '1');
          const isFirstManual = existingManual.length === 0;
          
          // If it's the first manual APN, it must be the default (default_flag: "1")
          const profileToAdd: ApnProfile = {
              ...newApn,
              default_flag: isFirstManual ? '1' : '0'
          };

          const updatedList = [...apnList, profileToAdd];
          setApnList(updatedList);
          
          // Ensure we are in manual mode to see the new APN
          if (apnMode !== 'manual') {
              setApnMode('manual');
          }

          // Select the new profile (especially if it's the first one, satisfying the default_flag='1' rule)
          setSelectedProfile(profileToAdd);
      }
  };

  const handleSave = async () => {
      if (!selectedProfile) {
          showAlert(t('emptyError') + ' (Profile Name)', 'warning');
          return;
      }

      setSaving(true);

      // 1. Prepare APN List payload (CMD 248)
      // Set default_flag to "1" for the selected APN, "0" for others
      const listPayload = apnList.map(p => ({
          ...p,
          default_flag: p.name === selectedProfile.name ? '1' : '0'
      }));

      // 2. Prepare APN Config payload (CMD 213)
      // selectType is current active APN ipVersion or fallback to previous
      const selectType = selectedProfile.ipVersion || initialConfig?.selectType || 'IPV4';
      
      const configPayload = {
          apnNatName: natEnabled ? '1' : '0',
          apnMTU: mtu,
          selectType: selectType
      };

      try {
          const [configRes, listRes] = await Promise.all([
              saveApnConfig(configPayload),
              saveApnList(listPayload)
          ]);

          if ((configRes.success || configRes.success === undefined) && (listRes.success || listRes.success === undefined)) {
              showAlert('Settings saved successfully.', 'success');
          } else {
              showAlert('Failed to save some settings.', 'error');
          }
      } catch (e) {
          console.error(e);
          showAlert('An error occurred while saving settings.', 'error');
      } finally {
          setSaving(false);
      }
  };

  const getFilteredProfiles = () => {
      const targetFlag = apnMode === 'auto' ? '0' : '1';
      return apnList.filter(p => p.edit_flag === targetFlag);
  };

  const mapAuthType = (val: string) => {
      if (val === '0') return 'NONE';
      if (val === '1') return 'PAP';
      if (val === '2') return 'CHAP';
      return val || 'NONE';
  };

  const isManualMode = apnMode === 'manual';
  
  // Disable Delete if not in manual mode OR if no profile is selected
  const isDeleteDisabled = !isManualMode || !selectedProfile;
  
  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  return (
    <>
    <div className="w-full max-w-4xl animate-fade-in">
      {/* Warning Banner */}
      <div className="bg-orange/10 border-l-4 border-orange p-3 mb-6 flex items-start">
         <AlertTriangle className="text-orange w-5 h-5 me-3 shrink-0 mt-0.5" />
         <span className="font-bold text-sm text-black">The NAT switch is only effective for IPv4 networks.</span>
      </div>

      {/* Settings Form */}
      <div className="space-y-0.5">
        
        {/* NAT */}
        <SectionRow label="NAT">
            <div className="flex justify-end">
                <RadioGroup 
                    value={natEnabled} 
                    onChange={setNatEnabled}
                    options={[
                        { label: 'Enabled', value: true },
                        { label: 'Disabled', value: false }
                    ]}
                />
            </div>
        </SectionRow>

        {/* APN Mode */}
        <SectionRow label="APN Mode">
            <div className="flex justify-end">
                <RadioGroup 
                    value={apnMode} 
                    onChange={handleModeChange}
                    options={[
                        { label: 'Auto', value: 'auto' },
                        { label: 'Manual', value: 'manual' }
                    ]}
                />
            </div>
        </SectionRow>

        {/* MTU */}
        <SectionRow label="MTU" required>
            <StyledInput 
                value={mtu} 
                onChange={(e) => setMtu(e.target.value)} 
            />
        </SectionRow>

        {/* Profile Name */}
        <SectionRow label="Profile Name">
            <StyledSelect 
                value={selectedProfile?.name || ''} 
                onChange={handleProfileChange} 
                options={getFilteredProfiles().map(p => ({ label: p.name, value: p.name }))}
            />
        </SectionRow>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 pb-6 border-b border-gray-200">
            <button 
                onClick={handleAddApnClick}
                disabled={!isManualMode}
                className={`flex items-center justify-center font-bold text-sm py-2 px-6 rounded-[2px] shadow-sm border border-transparent transition-colors ${!isManualMode ? 'bg-[#f2f2f2] text-gray-400 cursor-not-allowed' : 'bg-[#f2f2f2] text-black hover:bg-gray-200'}`}
            >
                <Plus size={16} className="me-2" />
                Add APN
            </button>
            <button 
                onClick={handleEditApnClick}
                disabled={!isManualMode || !selectedProfile}
                className={`flex items-center justify-center font-bold text-sm py-2 px-6 rounded-[2px] shadow-sm border border-transparent transition-colors ${(!isManualMode || !selectedProfile) ? 'bg-[#f2f2f2] text-gray-400 cursor-not-allowed' : 'bg-[#f2f2f2] text-black hover:bg-gray-200'}`}
            >
                <Edit2 size={16} className="me-2" />
                Edit APN
            </button>
            <button 
                onClick={handleDeleteApnClick}
                disabled={isDeleteDisabled}
                className={`flex items-center justify-center font-bold text-sm py-2 px-6 rounded-[2px] shadow-sm border border-transparent transition-colors ${isDeleteDisabled ? 'bg-[#f2f2f2] text-gray-400 cursor-not-allowed' : 'bg-[#f2f2f2] text-black hover:bg-gray-200'}`}
            >
                <Trash2 size={16} className="me-2" />
                Delete APN
            </button>
        </div>

        {/* Read-only Info Display */}
        <div className="pt-6 space-y-0">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                <span className="font-bold text-gray-600 text-sm">PDP Type</span>
                <span className="text-black text-sm font-bold">{selectedProfile?.ipVersion || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                <span className="font-bold text-gray-600 text-sm">APN</span>
                <span className="text-black text-sm font-bold">{selectedProfile?.apnName || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 border-dashed">
                <span className="font-bold text-gray-600 text-sm">Authentication</span>
                <span className="text-black text-sm uppercase font-bold">{mapAuthType(selectedProfile?.selectAuthtication || '0')}</span>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-8">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm uppercase tracking-wide flex items-center"
            >
                {saving ? <Loader2 className="animate-spin w-4 h-4 me-2" /> : <Save size={18} className="me-2" />}
                Save
            </button>
        </div>

      </div>
    </div>

    <ApnAddModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingProfile}
        existingApns={apnList}
    />

    <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete APN"
        message="Are you sure you want to delete this APN profile?"
    />
    </>
  );
};
