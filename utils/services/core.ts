
// API Configuration
export const API_BASE_URL = '/cgi-bin/http.cgi'; 

// Session Management
export const setSessionId = (sid: string) => {
  if (sid) {
    sessionStorage.setItem('sessionId', sid);
    document.cookie = `sessionId=${sid}; path=/`;
  }
};

export const getSessionId = (): string => {
  return sessionStorage.getItem('sessionId') || '';
};

export const clearSessionId = () => {
  sessionStorage.removeItem('sessionId');
  document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const triggerAuthLogout = () => {
  clearSessionId();
  window.dispatchEvent(new Event('auth-logout'));
};

// Generic API Request
export const apiRequest = async <T = any>(cmd: number, method: 'GET' | 'POST', data: Record<string, any> = {}): Promise<T> => {
  const sessionId = getSessionId();
  if (sessionId && (!document.cookie || !document.cookie.includes(`sessionId=${sessionId}`))) {
     document.cookie = `sessionId=${sessionId}; path=/`;
  }

  const payload: Record<string, any> = { cmd, method, sessionId, ...data };
  if (method === 'POST') payload.token = '';

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let resData: any = null;
    try { resData = await response.json(); } catch (e) { resData = null; }

    if (resData && resData.message === 'NO_AUTH') {
        triggerAuthLogout();
        return resData;
    }

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return resData || {} as T;
  } catch (error) {
    console.error(`API Request Error (CMD: ${cmd}):`, error);
    throw error;
  }
};

// Encryption & Encoding helpers
export async function sha256(source: string) {
  if (window.crypto && window.crypto.subtle) {
    try {
      const sourceBytes = new TextEncoder().encode(source);
      const digest = await window.crypto.subtle.digest("SHA-256", sourceBytes);
      const resultBytes = [...new Uint8Array(digest)];
      return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
    } catch (e) {
      console.warn("Web Crypto API error, using fallback", e);
    }
  }

  function r(n: number, b: number) { return (n >>> b) | (n << (32 - b)); }
  const k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  
  const msg = new TextEncoder().encode(source);
  const len = msg.length;
  const paddingLen = ((len + 8) >> 6 << 6) + 64 - len;
  const padded = new Uint8Array(len + paddingLen);
  padded.set(msg);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, len * 8, false);
  const w = new Uint32Array(64);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const s0 = r(w[j - 15], 7) ^ r(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = r(w[j - 2], 17) ^ r(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let j = 0; j < 64; j++) {
      const S1 = r(e, 6) ^ r(e, 11) ^ r(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = r(a, 2) ^ r(a, 13) ^ r(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
}

export function b64DecodeUtf8(str: string): string {
    try {
        return decodeURIComponent(atob(str).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch (e) {
        console.error("Base64 Decode Error", e);
        return "";
    }
}

export function b64EncodeUtf8(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}
