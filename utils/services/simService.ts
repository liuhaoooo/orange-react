
import { apiRequest, b64EncodeUtf8 } from './core';

export const unlockSimPin = async (pin: string) => apiRequest(7, 'POST', { type: '1', pin: b64EncodeUtf8(pin) });
export const verifySimPin = async (pin: string, dontPrompt: boolean) => apiRequest(51, 'POST', { pin, subcmd: '2', dont_prompt: dontPrompt ? '1' : '0' });
export const unlockSimPuk = async (puk: string, newPin: string) => apiRequest(51, 'POST', { puk, pin: newPin, subcmd: '3', dont_prompt: '0' });
export const disablePinLock = async (pin: string) => apiRequest(7, 'POST', { type: '3', pin: b64EncodeUtf8(pin) });
// cmd 51, subcmd 1 for toggling PIN lock switch
export const setSimLockSwitch = async (enable: '0' | '1', pin: string) => apiRequest(51, 'POST', { enable, pin, subcmd: '1' });
// cmd 51, subcmd 4 for modifying PIN
export const modifySimPin = async (currentPin: string, newPin: string) => apiRequest(51, 'POST', { enable: '2', pin: currentPin, pinPasswordChange: newPin, subcmd: '4' });
// cmd 134 for getting PIN lock status
export const fetchSimLockStatus = async () => apiRequest(134, 'GET');
