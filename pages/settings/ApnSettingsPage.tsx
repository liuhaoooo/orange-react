
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import { fetchApnSettings, fetchApnList, ApnProfile, saveApnConfig, saveApnList, ApnConfigResponse } from '../../utils/api';
import { ApnAddModal } from '../../components/ApnAddModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { FormRow, StyledInput, StyledSelect, RadioGroup, PrimaryButton } from '../../components/UIComponents';

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

  // Error State
  const [profileError, setProfileError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<ApnProfile | null>(null);
  
  // Delete Modal State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    const initData = async () => {
        try {
            const configRes = await fetchApnSettings();
            if (configRes && configRes.success) {
                setNatEnabled(configRes.apnNatName === '1');
                setMtu(configRes.apnMTU || '1500');
                setInitialConfig(configRes);
            }

            const listRes = await fetchApnList();
            if (listRes && listRes.success && listRes.apn_list) {
                setApnList(listRes.apn_list);
                
                const def = listRes.apn_list.find(p => p.default_flag === '1');
                if (def) {
                    setSelectedProfile(def);
                    setApnMode(def.edit_flag === '0' ? 'auto' : 'manual');
                } else if (listRes.apn_list.length > 0) {
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
      setProfileError('');
      const targetFlag = mode === 'auto' ? '0' : '1';
      const available = apnList.filter(p => p.edit_flag === targetFlag);
      
      const def = available.find(p => p.default_flag === '1');
      
      if (def) {
          setSelectedProfile(def);
      } else if (available.length > 0) {
          setSelectedProfile(available[0]);
      } else {
          setSelectedProfile(null); 
      }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const name = e.target.value;
      setProfileError('');
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

      const updatedList = apnList.filter(p => p !== selectedProfile);
      setApnList(updatedList);
      setIsDeleteConfirmOpen(false);

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
          const updatedList = apnList.map(p => p === editingProfile ? newApn : p);
          setApnList(updatedList);
          setSelectedProfile(newApn);
      } else {
          const existingManual = apnList.filter(p => p.edit_flag === '1');
          const isFirstManual = existingManual.length === 0;
          
          const profileToAdd: ApnProfile = {
              ...newApn,
              default_flag: isFirstManual ? '1' : '0'
          };

          const updatedList = [...apnList, profileToAdd];
          setApnList(updatedList);
          
          if (apnMode !== 'manual') {
              setApnMode('manual');
          }

          setSelectedProfile(profileToAdd);
      }
  };

  const handleSave = async () => {
      setProfileError('');
      if (!selectedProfile) {
          setProfileError(t('emptyError'));
          return;
      }

      setSaving(true);

      const listPayload = apnList.map(p => ({
          ...p,
          default_flag: p.name === selectedProfile.name ? '1' : '0'
      }));

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
    <div className="w-full max-w-4xl animate-fade-in py-2">
      <div className="bg-orange/10 border-l-4 border-orange p-3 mb-6 flex items-start">
         <AlertTriangle className="text-orange w-5 h-5 me-3 shrink-0 mt-0.5" />
         <span className="font-bold text-sm text-black">The NAT switch is only effective for IPv4 networks.</span>
      </div>

      <FormRow label="NAT">
        <RadioGroup 
            value={natEnabled} 
            onChange={setNatEnabled}
            options={[
                { label: 'Enabled', value: true },
                { label: 'Disabled', value: false }
            ]}
        />
      </FormRow>

      <FormRow label="APN Mode">
        <RadioGroup 
            value={apnMode} 
            onChange={handleModeChange}
            options={[
                { label: 'Auto', value: 'auto' },
                { label: 'Manual', value: 'manual' }
            ]}
        />
      </FormRow>

      <FormRow label="MTU" required>
        <StyledInput 
            value={mtu} 
            onChange={(e) => setMtu(e.target.value)} 
        />
      </FormRow>

      <FormRow label="Profile Name" error={profileError}>
        <StyledSelect 
            value={selectedProfile?.name || ''} 
            onChange={handleProfileChange} 
            options={getFilteredProfiles().map(p => ({ label: p.name, value: p.name }))}
            hasError={!!profileError}
        />
      </FormRow>

      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 pb-6 border-b border-gray-200">
        <PrimaryButton 
            onClick={handleAddApnClick}
            disabled={!isManualMode}
            className="bg-[#f2f2f2] border-transparent hover:bg-gray-200"
            icon={<Plus size={16} />}
        >
            Add APN
        </PrimaryButton>
        <PrimaryButton 
            onClick={handleEditApnClick}
            disabled={!isManualMode || !selectedProfile}
            className="bg-[#f2f2f2] border-transparent hover:bg-gray-200"
            icon={<Edit2 size={16} />}
        >
            Edit APN
        </PrimaryButton>
        <PrimaryButton 
            onClick={handleDeleteApnClick}
            disabled={isDeleteDisabled}
            className="bg-[#f2f2f2] border-transparent hover:bg-gray-200"
            icon={<Trash2 size={16} />}
        >
            Delete APN
        </PrimaryButton>
      </div>

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

      <div className="flex justify-end pt-8">
        <PrimaryButton 
            onClick={handleSave}
            loading={saving}
            icon={<Save size={18} />}
        >
            Save
        </PrimaryButton>
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
