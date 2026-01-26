
import React, { useState } from 'react';
import { SquareSwitch } from '../../components/UIComponents';

export const SimFunctionPage: React.FC = () => {
  const [pinVerification, setPinVerification] = useState(false);

  return (
    <div className="w-full animate-fade-in py-2">
      {/* PIN Verification Row */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <label className="font-bold text-sm text-black">PIN Verification</label>
          <SquareSwitch isOn={pinVerification} onChange={() => setPinVerification(!pinVerification)} />
      </div>

      {/* Modify PIN Button */}
      <div className="flex justify-end pt-8">
          <button className="bg-[#cccccc] text-black font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm hover:bg-[#b3b3b3]">
              Modify PIN
          </button>
      </div>
    </div>
  );
};
