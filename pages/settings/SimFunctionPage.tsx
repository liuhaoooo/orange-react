
import React, { useState, useEffect } from 'react';
import { SquareSwitch } from '../../components/UIComponents';
import { SimPinConfigModal } from '../../components/SimPinConfigModal';
import { PukRequiredModal } from '../../components/PukRequiredModal';
import { useGlobalState } from '../../utils/GlobalStateContext';
import { setSimLockSwitch, fetchConnectionSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

export const SimFunctionPage: React.FC = () => {
  const { globalData, updateGlobalData } = useGlobalState();
  const { showAlert } = useAlert();
  
  // lock_pin_flag: '1' = Enabled (Locked), '0' = Disabled (Unlocked)
  const isEnabled = globalData.connectionSettings?.lock_pin_flag === '1';
  const remainingAttempts = globalData.connectionSettings?.pin_left_times || '3';

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPukModalOpen, setIsPukModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // When user clicks switch, we don't toggle state immediately. 
  // We determine the target state and open the PIN modal.
  const handleSwitchClick = () => {
      // Check if SIM is ready first
      if (globalData.connectionSettings?.sim_status !== '1') {
          showAlert('SIM card is not ready.', 'error');
          return;
      }
      setIsPinModalOpen(true);
  };

  const handlePinConfirm = async (pin: string) => {
      setIsLoading(true);
      // If currently enabled, we want to disable ('0'). If disabled, we want to enable ('1').
      const targetState = isEnabled ? '0' : '1';

      try {
          const res = await setSimLockSwitch(targetState, pin);

          // Success Logic
          if (res && res.success && res.message === '0') {
              showAlert('Setting saved successfully.', 'success');
              setIsPinModalOpen(false);
              
              // Optimistic update
              if (globalData.connectionSettings) {
                  updateGlobalData('connectionSettings', { 
                      ...globalData.connectionSettings, 
                      lock_pin_flag: targetState 
                  });
              }
              // Refresh to be sure
              refreshSettings();
          } 
          // PUK Locked Logic (Usually message is specific or we check attempts)
          else if (res.message === 'PUK_LOCKED' || res.message?.includes('PUK') || (res.pin_left_times && parseInt(res.pin_left_times) === 0)) {
              setIsPinModalOpen(false);
              setIsPukModalOpen(true);
          }
          // General Failure (Wrong PIN)
          else {
              showAlert('Incorrect PIN code.', 'error');
              // Update remaining attempts if returned
              if (res.pin_left_times) {
                  updateGlobalData('connectionSettings', { 
                      ...globalData.connectionSettings, 
                      pin_left_times: res.pin_left_times 
                  });
              } else {
                  refreshSettings();
              }
          }
      } catch (e) {
          console.error(e);
          showAlert('An error occurred.', 'error');
      } finally {
          setIsLoading(false);
      }
  };

  const refreshSettings = async () => {
      try {
          const data = await fetchConnectionSettings();
          if (data && data.success !== false) {
              updateGlobalData('connectionSettings', data);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const handlePukSuccess = () => {
      setIsPukModalOpen(false);
      refreshSettings();
      showAlert('PUK unlocked successfully.', 'success');
  };

  return (
    <div className="w-full animate-fade-in py-2">
      {/* PIN Verification Row */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <label className="font-bold text-sm text-black">PIN Verification</label>
          <SquareSwitch isOn={isEnabled} onChange={handleSwitchClick} />
      </div>

      {/* Modify PIN Button */}
      <div className="flex justify-end pt-8">
          <button className="bg-[#cccccc] text-black font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm hover:bg-[#b3b3b3]">
              Modify PIN
          </button>
      </div>

      <SimPinConfigModal 
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onConfirm={handlePinConfirm}
        remainingAttempts={remainingAttempts}
        isLoading={isLoading}
      />

      <PukRequiredModal 
        isOpen={isPukModalOpen}
        onClose={() => setIsPukModalOpen(false)}
        onSuccess={handlePukSuccess}
        remainingAttempts={globalData.connectionSettings?.puk_left_times}
      />
    </div>
  );
};
