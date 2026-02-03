
import { apiRequest, b64DecodeUtf8, b64EncodeUtf8 } from './core';
import { SmsListResponse, SmsMessage } from './types';

export const parseSmsList = (rawList: string): SmsMessage[] => {
    if (!rawList) return [];
    const items = rawList.split(',');
    return items.map(b64 => {
        if (!b64.trim()) return null;
        const decoded = b64DecodeUtf8(b64);
        const parts = decoded.split(' ');
        if (parts.length < 5) return null;
        
        const id = parts[0];
        const status = parts[1];
        const sender = parts[2];
        const date = parts[3];
        const time = parts[4];
        
        let content = "";
        let spaceCount = 0;
        let fifthSpaceIndex = -1;
        for (let i = 0; i < decoded.length; i++) {
            if (decoded[i] === ' ') {
                spaceCount++;
                if (spaceCount === 5) {
                    fifthSpaceIndex = i;
                    break;
                }
            }
        }
        if (fifthSpaceIndex !== -1) {
            content = decoded.substring(fifthSpaceIndex + 1);
        } else if (parts.length > 5) {
            content = parts.slice(5).join(' ');
        }
        
        return { id, status, sender, date: `${date} ${time}`, content };
    }).filter((msg): msg is SmsMessage => msg !== null);
};

export const fetchSmsList = async (pageNum: number = 1, subcmd: number = 0) => apiRequest<SmsListResponse>(12, 'GET', { page_num: pageNum, subcmd });
export const markSmsAsRead = async (indexes: string[]) => apiRequest(12, 'POST', { index: indexes.join(',') });
export const deleteSms = async (indexes: string[], subcmd: number = 0) => apiRequest(14, 'POST', { index: indexes.join(','), subcmd });
export const sendSms = async (phoneNo: string, content: string) => apiRequest(13, 'POST', { phoneNo, content: b64EncodeUtf8(content) });
export const saveSmsDraft = async (phoneNo: string, content: string) => apiRequest(13, 'POST', { type: 'save', phoneNo, content: b64EncodeUtf8(content) });
export const redirectSms = async (enabled: boolean, phone: string) => apiRequest(16, 'POST', { redirect_sw: enabled ? '1' : '0', redirect_phone: phone });
export const saveMessageSettings = async (smsSw: string, dmCsca: string, maxSize: string) => apiRequest(16, 'POST', { smsSw, dmCsca, maxSize });
