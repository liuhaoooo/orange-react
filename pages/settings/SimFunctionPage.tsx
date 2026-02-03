
import React, { useState, useEffect, useCallback } from 'react';
import { SquareSwitch } from '../../components/UIComponents';
import { SimPinConfigModal } from '../../components/SimPinConfigModal';
import { SimPinModifyModal } from '../../components/SimPinModifyModal';
import { PukRequiredModal } from '../../components/PukRequiredModal';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { setSimLockSwitch, fetchSimLockStatus, modifySimPin } from '../../utils/services/simService';
import { fetchConnectionSettings } from '../../utils/api'; // Fallback refresh
import { useAlert } from '../../utils/AlertContext';
import { Loader2 } from 'lucide-react';

export const SimFunctionPage: React.FC = () => {
  const { globalData, updateGlobalData } = useGlobalState();
  const { showAlert } = useAlert();
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [simStatus, setSimStatus] = useState<any>(null);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isPukModalOpen, setIsPukModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch status via CMD 134
  const loadSimStatus = useCallback(async () => {
      try {
          const res = await fetchSimLockStatus();
          // Assuming successful response structure contains lock_pin_switch
          if (res && (res.success || res.success === undefined)) {
              setSimStatus(res);
          }
      } catch (e) {
          console.error("Failed to fetch SIM status", e);
      } finally {
          setIsLoadingData(false);
      }
  }, []);

  useEffect(() => {
      loadSimStatus();
  }, [loadSimStatus]);

  // Use data from CMD 134 if available, otherwise fallback to global connectionSettings (CMD 585)
  // lock_pin_switch: '1' = Enabled, '0' = Disabled
  const isEnabled = simStatus?.lock_pin_switch === '1' || (!simStatus && globalData.connectionSettings?.lock_pin_flag === '1');
  const remainingAttempts = simStatus?.pin_left_times || globalData.connectionSettings?.pin_left_times || '3';
  const pukAttempts = simStatus?.puk_left_times || globalData.connectionSettings?.puk_left_times || '10';

  const handleSwitchClick = () => {
      // Basic check if SIM is present (CMD 134 usually returns sim_status too)
      if (simStatus?.sim_status === '0' || globalData.connectionSettings?.sim_status !== '1') {
          showAlert('SIM card is not ready.', 'error');
          return;
      }
      setIsPinModalOpen(true);
  };

  const handlePinConfirm = async (pin: string) => {
      setIsSubmitting(true);
      // Determine target state: if currently enabled, we want to disable ('0'), else enable ('1')
      const targetState = isEnabled ? '0' : '1';

      try {
          const res = await setSimLockSwitch(targetState, pin);

          if (res && res.success && res.message === '0') {
              showAlert('Setting saved successfully.', 'success');
              setIsPinModalOpen(false);
              
              // Refresh status to update switch UI
              await loadSimStatus();
              
              // Also refresh global settings to keep top bar/other components in sync
              fetchConnectionSettings().then(data => {
                  if (data && data.success !== false) {
                      updateGlobalData('connectionSettings', data);
                  }
              });
          } 
          // Check for PUK locked scenarios or wrong PIN
          // Usually if PIN is wrong, message might not be '0'
          else {
              if (res.message === 'PUK_LOCKED' || (res.pin_left_times && parseInt(res.pin_left_times) === 0)) {
                  setIsPinModalOpen(false);
                  setIsPukModalOpen(true);
                  // Update attempts for PUK modal
                  setSimStatus((prev: any) => ({ ...prev, pin_left_times: '0' }));
              } else {
                  showAlert('Incorrect PIN code.', 'error');
                  // If server returns updated attempts, update local state immediately
                  if (res.pin_left_times) {
                      setSimStatus((prev: any) => ({ ...prev, pin_left_times: res.pin_left_times }));
                  } else {
                      // Otherwise refresh full status
                      loadSimStatus();
                  }
              }
          }
      } catch (e) {
          console.error(e);
          showAlert('An error occurred.', 'error');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleModifyClick = () => {
      if (!isEnabled) return;
      setIsModifyModalOpen(true);
  };

  const handleModifyConfirm = async (oldPin: string, newPin: string) => {
      setIsSubmitting(true);
      try {
          const res = await modifySimPin(oldPin, newPin);
          
          if (res && res.success && res.message === '0') {
              showAlert('PIN code modified successfully.', 'success');
              setIsModifyModalOpen(false);
              await loadSimStatus();
          } else {
              if (res.message === 'PUK_LOCKED' || (res.pin_left_times && parseInt(res.pin_left_times) === 0)) {
                  setIsModifyModalOpen(false);
                  setIsPukModalOpen(true);
                  setSimStatus((prev: any) => ({ ...prev, pin_left_times: '0' }));
              } else {
                  showAlert('Incorrect old PIN code.', 'error');
                  if (res.pin_left_times) {
                      setSimStatus((prev: any) => ({ ...prev, pin_left_times: res.pin_left_times }));
                  } else {
                      loadSimStatus();
                  }
              }
          }
      } catch (e) {
          console.error(e);
          showAlert('An error occurred.', 'error');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handlePukSuccess = () => {
      setIsPukModalOpen(false);
      loadSimStatus();
      showAlert('PUK unlocked successfully.', 'success');
  };

  if (isLoadingData) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  return (
    <div className="w-full animate-fade-in py-2">
      {/* PIN Verification Row */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <label className="font-bold text-sm text-black">PIN Verification</label>
          <SquareSwitch isOn={isEnabled} onChange={handleSwitchClick} />
      </div>

      {/* Modify PIN Button - Only enabled if PIN Verification is ON */}
      <div className="flex justify-end pt-8">
          <button 
            onClick={handleModifyClick}
            disabled={!isEnabled}
            className={`font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm 
                ${isEnabled 
                    ? 'bg-[#eeeeee] border-2 border-transparent hover:border-gray-400 text-black cursor-pointer' 
                    : 'bg-[#f5f5f5] text-gray-400 cursor-not-allowed border-2 border-transparent'
                }`}
          >
              Modify PIN
          </button>
      </div>

      <SimPinConfigModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handlePinConfirm}
        remainingAttempts={remainingAttempts}
        isLoading={isSubmitting}
      />

      <SimPinModifyModal 
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        onConfirm={handleModifyConfirm}
        remainingAttempts={remainingAttempts}
        isLoading={isSubmitting}
      />

      <PukRequiredModal 
        isOpen={isPukModalOpen}
        onClose={() => setIsPukModalOpen(false)}
        onSuccess={handlePukSuccess}
        remainingAttempts={pukAttempts}
      />
    </div>
  );
};
