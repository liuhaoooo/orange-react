
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { sendSms, saveSmsDraft } from '../utils/api';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReceiver?: string;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose, initialReceiver = '' }) => {
  const { t } = useLanguage();
  const [receiver, setReceiver] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [parts, setParts] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setReceiver(initialReceiver);
      setContent('');
      setParts(1);
      setIsSending(false);
      setIsSaving(false);
    }
  }, [isOpen, initialReceiver]);

  useEffect(() => {
    // Simple GSM 7-bit length calculation approximation
    // 160 chars per part standard
    const len = content.length;
    const p = len <= 160 ? 1 : Math.ceil(len / 153); // 153 is typically the limit for multipart segments due to headers
    setParts(p);
  }, [content]);

  const handleSend = async () => {
    if (!receiver || !content) return;
    setIsSending(true);
    try {
      const res = await sendSms(receiver, content);
      if (res && res.success) {
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content) return; // Can save draft without receiver usually, but content is needed
    setIsSaving(true);
    try {
      const res = await saveSmsDraft(receiver, content);
      if (res && res.success) {
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black">{t('newMessage')}</h2>
          <button 
            onClick={onClose} 
            className="text-black hover:text-gray-600 transition-colors"
            disabled={isSending || isSaving}
          >
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          
          {/* Receiver Input */}
          <div className="mb-6">
            <label className="block font-bold text-sm mb-2 text-black text-start">
              {t('receiver')}
            </label>
            <input 
              type="text" 
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              disabled={isSending || isSaving}
              className="w-full border-2 border-black p-2 text-sm outline-none focus:border-orange text-black font-medium h-10"
            />
          </div>

          {/* Message Input */}
          <div className="mb-8">
            <label className="block font-bold text-sm mb-2 text-black text-start">
              {t('messageLabel')} <span className="text-gray-500 font-normal ml-1">{content.length}({parts})</span>
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSending || isSaving}
              className="w-full border border-gray-400 p-2 text-sm outline-none focus:border-orange text-black resize-none h-40 align-top"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end items-center space-x-3 rtl:space-x-reverse">
            <button 
              onClick={onClose}
              disabled={isSending || isSaving}
              className="px-6 py-2 border-2 border-black bg-white text-black font-bold text-sm hover:bg-gray-50 transition-colors h-10 min-w-[100px]"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={handleSaveDraft}
              disabled={isSending || isSaving}
              className="px-6 py-2 bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors h-10 min-w-[120px] flex items-center justify-center"
            >
              {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : t('saveDraft')}
            </button>
            <button 
              onClick={handleSend}
              disabled={isSending || isSaving || !receiver || !content}
              className={`px-8 py-2 bg-orange text-black font-bold text-sm transition-colors h-10 min-w-[100px] flex items-center justify-center ${(!receiver || !content) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-dark'}`}
            >
              {isSending ? <Loader2 className="animate-spin w-4 h-4" /> : t('send')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
