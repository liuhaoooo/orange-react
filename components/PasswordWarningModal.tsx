
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PasswordWarningModalProps {
  isOpen: boolean;
  onClose: (doNotRemind: boolean) => void;
  onChangeNow: () => void;
}

export const PasswordWarningModal: React.FC<PasswordWarningModalProps> = ({ isOpen, onClose, onChangeNow }) => {
  const [doNotRemind, setDoNotRemind] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose(doNotRemind);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg shadow-2xl relative animate-fade-in text-black border border-gray-300">
        {/* Header */}
        <div className="flex justify-between items-center p-5 pb-4">
          <h2 className="text-xl font-bold text-black">Information</h2>
          <button onClick={handleClose} className="text-black hover:text-gray-600 transition-colors">
            <X size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-8">
          <p className="mb-6 text-sm text-black">
            Your chosen password is too weak. Please change it to improve your security.
          </p>
          
          <div className="flex items-center mb-8">
             <input 
                type="checkbox" 
                id="noRemind"
                className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange cursor-pointer"
                checked={doNotRemind}
                onChange={(e) => setDoNotRemind(e.target.checked)}
             />
             <label htmlFor="noRemind" className="ms-2 text-sm text-black cursor-pointer">Do not remind me.</label>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
             <button 
               onClick={onChangeNow}
               className="px-6 py-2 border-2 border-black bg-white text-black font-bold text-sm hover:bg-gray-50 transition-colors h-10 min-w-[120px]"
             >
               Change Now
             </button>
             <button 
               onClick={handleClose}
               className="px-6 py-2 bg-orange hover:bg-orange-dark text-black font-bold text-sm h-10 min-w-[100px] flex items-center justify-center transition-colors"
             >
               Later
             </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
