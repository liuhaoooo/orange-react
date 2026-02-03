
import React, { useState } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface DhcpRule {
  id: string;
  bridge: string;
  lanIp: string;
  subnetMask: string;
  dhcpServer: string;
}

export const MultipleDhcpPage: React.FC = () => {
  const [rules, setRules] = useState<DhcpRule[]>([
    { id: '1', bridge: 'Bridge1', lanIp: '192.168.1.1', subnetMask: '255.255.0.0', dhcpServer: 'enable' }
  ]);

  return (
    <div className="w-full animate-fade-in py-6">
      
      {/* Table Section */}
      <div className="w-full border-t border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-3 ps-4 font-bold text-sm text-black">Bridge</div>
              <div className="col-span-3 font-bold text-sm text-black">LAN IP</div>
              <div className="col-span-3 font-bold text-sm text-black">Subnet Mask</div>
              <div className="col-span-3 font-bold text-sm text-black">DHCP Server</div>
          </div>

          {/* Rows */}
          {rules.map((rule) => (
              <div key={rule.id} className="grid grid-cols-12 py-6 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-3 ps-4 text-sm text-black font-medium">{rule.bridge}</div>
                  <div className="col-span-3 text-sm text-black font-medium">{rule.lanIp}</div>
                  <div className="col-span-3 text-sm text-black font-medium">{rule.subnetMask}</div>
                  <div className="col-span-3 flex justify-between items-center pe-4">
                      <span className="text-sm text-black font-medium">{rule.dhcpServer}</span>
                      <div className="flex space-x-4">
                            <button className="text-gray-500 hover:text-black transition-colors">
                                <Pencil size={16} />
                            </button>
                            <button className="text-gray-500 hover:text-black transition-colors">
                                <Trash2 size={16} />
                            </button>
                      </div>
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

      {/* Bottom Buttons */}
      <div className="flex justify-end mt-8 space-x-4">
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Add Rule
            </button>
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Save
            </button>
      </div>
    </div>
  );
};
