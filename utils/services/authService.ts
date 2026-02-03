
import { API_BASE_URL, getSessionId, setSessionId, clearSessionId, sha256, b64EncodeUtf8, apiRequest } from './core';

export const login = async (username: string, password: string): Promise<any> => {
  try {
    const tokenRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 232, method: 'GET', sessionId: '' })
    });
    
    let tokenData: any;
    try { tokenData = await tokenRes.json(); } catch(e) { tokenData = null; }

    if (!tokenData || !tokenData.success || !tokenData.token) {
      return { success: false, message: 'System initialization failed.' };
    }

    const loginToken = tokenData.token;
    const hashedPassword = await sha256(loginToken + password);
    const currentSessionId = getSessionId(); 

    const loginPayload = {
      cmd: 100,
      method: 'POST',
      username: username,
      passwd: hashedPassword,
      token: loginToken,
      isAutoUpgrade: '0',
      sessionId: currentSessionId,
      isSingleLogin: '1'
    };

    const loginRes = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload)
    });

    let loginData: any;
    try { loginData = await loginRes.json(); } catch(e) { loginData = null; }

    if (!loginData) throw new Error('Invalid login response');

    if (loginData.success !== true && loginData.message === 'alreadyLogin') {
      return { success: false, message: 'The account has been logged in on other terminal. Please try again later.' };
    }

    if (loginData.success && loginData.sessionId) {
      setSessionId(loginData.sessionId);
      return { success: true };
    } 

    return { 
        success: false, 
        message: loginData.message || 'Login failed.',
        login_fail: loginData.login_fail,
        login_fail2: loginData.login_fail2,
        login_times: loginData.login_times,
        login_time: loginData.login_time
    };

  } catch (error) {
    console.error('Login Exception:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

export const logout = async () => {
  try {
    const sessionId = getSessionId();
    await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: 101, method: 'POST', sessionId, token: '' })
    });
    clearSessionId();
    return true; 
  } catch (error) {
    clearSessionId();
    return true; 
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await apiRequest(104, 'GET');
    return response.message !== 'NO_AUTH';
  } catch (error) { return true; }
};

export const fetchAccountLevel = async () => apiRequest<{ account_level: string }>(588, 'GET');

export const modifyPassword = async (username: string, newPass: string) => {
    const encodedPass = b64EncodeUtf8(newPass);
    return apiRequest(102, 'POST', {
        first_login_flag: '1', first_login: '0', setPasswd: encodedPass,
        subcmd: 1, tz_account: 'Mw==', reset_status: '1'
    });
};
