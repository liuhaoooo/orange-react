
import React, { useState } from 'react';
import { SquareSwitch } from '../../components/UIComponents';

export const NetworkConfigPage: React.FC = () => {
  const [flightMode, setFlightMode] = useState(false);

  return (
    <div className="w-full animate-fade-in py-6">
      
      {/* Flight Mode Row */}
      <div className="flex items-center justify-between mb-12">
         <label className="font-bold text-sm text-black">Flight Mode</label>
         <SquareSwitch isOn={flightMode} onChange={() => setFlightMode(!flightMode)} />
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
