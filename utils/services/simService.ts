
import { apiRequest, b64EncodeUtf8 } from './core';

export const unlockSimPin = async (pin: string) => apiRequest(7, 'POST', { type: '1', pin: b64EncodeUtf8(pin) });
export const verifySimPin = async (pin: string, dontPrompt: boolean) => apiRequest(51, 'POST', { pin, subcmd: '2', dont_prompt: dontPrompt ? '1' : '0' });
export const unlockSimPuk = async (puk: string, newPin: string) => apiRequest(51, 'POST', { puk, pin: newPin, subcmd: '3', dont_prompt: '0' });
export const disablePinLock = async (pin: string) => apiRequest(7, 'POST', { type: '3', pin: b64EncodeUtf8(pin) });
