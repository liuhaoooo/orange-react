
import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';

interface MacRule {
  id: string;
  mac: string;
  remark: string;
}

export const MacFiltering5Page: React.FC = () => {
  const [mode, setMode] = useState('Disabled');
  const [rules, setRules] = useState<MacRule[]>([
    { id: '1', mac: 'AA:BB:AA:BB:AA:BB', remark: 'hahaha' }
  ]);

  return (
    <div className="w-full animate-fade-in py-2">
      {/* Top Control */}
      <div className="flex justify-between items-center mb-6">
        <label className="font-bold text-sm text-black">Filtering Rules:</label>
        <div className="relative w-48">
            <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange transition-all rounded-[2px] appearance-none bg-white cursor-pointer"
            >
                <option value="Disabled">Disabled</option>
                <option value="Block">Block</option>
                <option value="Allow">Allow</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="w-full border-t border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-2 ps-4 font-bold text-sm text-black">Index</div>
              <div className="col-span-5 font-bold text-sm text-black">MAC Address</div>
              <div className="col-span-5 font-bold text-sm text-black">Remark</div>
          </div>

          {/* Rows */}
          {rules.map((rule, index) => (
              <div key={rule.id} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-2 ps-4 text-sm text-black font-medium">{index + 1}</div>
                  <div className="col-span-5 text-sm text-black font-medium uppercase">{rule.mac}</div>
                  <div className="col-span-3 text-sm text-black font-medium">{rule.remark}</div>
                  <div className="col-span-2 flex justify-end pe-4 space-x-3">
                        <button className="text-gray-500 hover:text-black transition-colors">
                            <Pencil size={16} />
                        </button>
                        <button className="text-gray-500 hover:text-black transition-colors">
                            <Trash2 size={16} />
                        </button>
                  </div>
              </div>
          ))}
          {rules.length === 0 && (
              <div className="py-8 text-center text-gray-400 italic">No rules defined</div>
          )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center mt-6 space-x-4">
          <div className="relative">
              <select className="border border-gray-200 py-1.5 ps-3 pe-8 text-sm text-gray-600 rounded-[2px] appearance-none bg-white outline-none cursor-pointer hover:border-gray-300">
                  <option>10/page</option>
                  <option>20/page</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex space-x-1">
              <button className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] text-gray-400 rounded-[2px] hover:bg-gray-200 transition-colors">
                  <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#333] text-white font-bold text-sm rounded-[2px]">
                  1
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-[#f5f5f5] text-gray-400 rounded-[2px] hover:bg-gray-200 transition-colors">
                  <ChevronRight size={16} />
              </button>
          </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end mt-12 space-x-4">
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Add Rule
            </button>
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Clear All
            </button>
            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-12 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Save
            </button>
      </div>
    </div>
  );
};
