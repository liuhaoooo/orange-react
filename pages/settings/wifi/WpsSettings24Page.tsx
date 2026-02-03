
import React, { useState } from 'react';
import { SquareSwitch } from '../../../components/UIComponents';

export const WpsSettings24Page: React.FC = () => {
  const [wpsEnabled, setWpsEnabled] = useState(true);
  const [pin, setPin] = useState('');

  return (
    <div className="w-full animate-fade-in py-6">
      
      {/* WPS Switch Section */}
      <div className="flex items-center justify-between mb-6">
         <label className="font-bold text-sm text-black">WPS function switch</label>
         <div className="flex justify-end w-full sm:w-auto">
            <SquareSwitch isOn={wpsEnabled} onChange={() => setWpsEnabled(!wpsEnabled)} />
         </div>
      </div>
      
      {/* Save Button for Switch */}
      <div className="flex justify-end mb-12">
          <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
              Save
          </button>
      </div>

      {/* PIN Section */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-6">
         <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
            <label className="font-bold text-sm text-black">
                <span className="text-red-500 me-1">*</span>WPSPIN
            </label>
         </div>
         <div className="w-full sm:w-2/3">
            <input 
                type="text" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white"
            />
         </div>
      </div>

      {/* Application Button for PIN */}
      <div className="flex justify-end mb-12">
          <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
              Application
          </button>
      </div>

      {/* PBC Section */}
      <div className="flex items-center justify-between mt-4">
         <label className="font-bold text-sm text-black">Start PBC</label>
         <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
            Start PBC
         </button>
      </div>

    </div>
  );
};
