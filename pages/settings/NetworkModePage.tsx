
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const NetworkModePage: React.FC = () => {
  const [mode, setMode] = useState('Auto');

  return (
    <div className="w-full animate-fade-in">
      {/* Form Section */}
      <div className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
             <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">Network Mode</label>
             </div>
             <div className="w-full sm:w-2/3">
                 <div className="relative w-full">
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="w-full border border-black px-3 py-2.5 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
                    >
                        <option value="Auto">Auto</option>
                        <option value="5G">5G Only</option>
                        <option value="4G">4G Only</option>
                        <option value="3G">3G Only</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={16} />
                    </div>
                 </div>
             </div>
          </div>
       </div>

       {/* Footer Actions */}
       <div className="flex justify-end pt-12">
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2 px-12 text-sm transition-all rounded-[2px] shadow-sm">
                Save
            </button>
       </div>
    </div>
  );
};
