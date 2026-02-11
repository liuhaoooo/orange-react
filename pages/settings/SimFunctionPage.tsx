
import React, { useState, useEffect, useCallback } from 'react';
import { SquareSwitch, PrimaryButton } from '../../components/UIComponents';
import { SimPinConfigModal } from '../../components/SimPinConfigModal';
import { SimPinModifyModal } from '../../components/SimPinModifyModal';
import { PukRequiredModal } from '../../components/PukRequiredModal';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { setSimLockSwitch, fetchSimLockStatus, modifySimPin } from '../../utils/services/simService';
import { fetchConnectionSettings } from '../../utils/api';
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

  const loadSimStatus = useCallback(async () => {
      try {
          const res = await fetchSimLockStatus();
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

  const isEnabled = simStatus?.lock_pin_switch === '1' || (!simStatus && globalData.connectionSettings?.lock_pin_flag === '1');
  const remainingAttempts = simStatus?.pin_left_times || globalData.connectionSettings?.pin_left_times || '3';
  const pukAttempts = simStatus?.puk_left_times || globalData.connectionSettings?.puk_left_times || '10';

  const handleSwitchClick = () => {
      if (simStatus?.sim_status === '0' || globalData.connectionSettings?.sim_status !== '1') {
          showAlert('SIM card is not ready.', 'error');
          return;
      }
      setIsPinModalOpen(true);
  };

  const handlePinConfirm = async (pin: string) => {
      setIsSubmitting(true);
      const targetState = isEnabled ? '0' : '1';

      try {
          const res = await setSimLockSwitch(targetState, pin);

          if (res && res.success && res.message === '0') {
              showAlert('Setting saved successfully.', 'success');
              setIsPinModalOpen(false);
              await loadSimStatus();
              fetchConnectionSettings().then(data => {
                  if (data && data.success !== false) {
                      updateGlobalData('connectionSettings', data);
                  }
              });
          } 
          else {
              if (res.message === 'PUK_LOCKED' || (res.pin_left_times && parseInt(res.pin_left_times) === 0)) {
                  setIsPinModalOpen(false);
                  setIsPukModalOpen(true);
                  setSimStatus((prev: any) => ({ ...prev, pin_left_times: '0' }));
              } else {
                  showAlert('Incorrect PIN code.', 'error');
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
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <label className="font-bold text-sm text-black">PIN Verification</label>
          <SquareSwitch isOn={isEnabled} onChange={handleSwitchClick} />
      </div>

      <div className="flex justify-end pt-8">
          <PrimaryButton 
            onClick={handleModifyClick}
            disabled={!isEnabled}
            className={isEnabled ? "bg-[#eeeeee] border-transparent hover:border-gray-400 text-black" : "bg-[#f5f5f5] text-gray-400 cursor-not-allowed border-transparent"}
          >
              Modify PIN
          </PrimaryButton>
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
