
import React, { useState } from 'react';

// iOS-style rounded switch matching the screenshot
const RoundedSwitch = ({ isOn, onChange }: { isOn: boolean; onChange: () => void }) => (
  <div 
    className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isOn ? 'bg-orange' : 'bg-[#e2e2e5]'}`}
    onClick={onChange}
  >
    <div 
        className={`bg-white w-5 h-5 rounded-full shadow-sm transform duration-300 ease-in-out ${isOn ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </div>
);

export const NetworkConfigPage: React.FC = () => {
  const [flightMode, setFlightMode] = useState(false);

  return (
    <div className="w-full animate-fade-in py-6">
      
      {/* Flight Mode Row */}
      <div className="flex items-center justify-between mb-12">
         <label className="font-bold text-sm text-black">Flight Mode</label>
         <RoundedSwitch isOn={flightMode} onChange={() => setFlightMode(!flightMode)} />
      </div>

      {/* Re-search Network Row */}
      <div className="flex items-center justify-between">
         <label className="font-bold text-sm text-black">Re-search Network</label>
         <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2 px-10 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
            Search
         </button>
      </div>

    </div>
  );
};
