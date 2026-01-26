
import React, { useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface VlanItem {
    id: string;
    vlanName: string;
    vlanId: string;
    ip: string;
    mask: string;
    dhcp: string;
}

export const VlanPage: React.FC = () => {
  const [data, setData] = useState<VlanItem[]>([
      { id: '1', vlanName: 'VLAN0', vlanId: '111', ip: '192.168.1.1', mask: '255.255.255.0', dhcp: 'Disabled' },
      { id: '2', vlanName: 'VLAN1', vlanId: '33', ip: '192.168.2.1', mask: '255.255.0.0', dhcp: 'Disabled' },
  ]);

  return (
    <div className="w-full animate-fade-in py-2">
      
      {/* Table */}
      <div className="w-full border-t border-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-2 font-bold text-sm text-black uppercase ps-4">VLAN</div>
              <div className="col-span-2 font-bold text-sm text-black uppercase">VLAN ID</div>
              <div className="col-span-3 font-bold text-sm text-black uppercase">VLAN IP</div>
              <div className="col-span-3 font-bold text-sm text-black uppercase">Subnet Mask</div>
              <div className="col-span-2 font-bold text-sm text-black uppercase">DHCP Server</div>
          </div>

          {/* Rows */}
          {data.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-2 text-sm text-black font-medium ps-4">{item.vlanName}</div>
                  <div className="col-span-2 text-sm text-black font-medium">{item.vlanId}</div>
                  <div className="col-span-3 text-sm text-black font-medium">{item.ip}</div>
                  <div className="col-span-3 text-sm text-black font-medium">{item.mask}</div>
                  <div className="col-span-2 flex justify-between items-center pe-4">
                      <span className="text-sm text-black font-medium">{item.dhcp}</span>
                      <div className="flex space-x-3">
                          <button className="text-blue-600 hover:text-blue-800 transition-colors">
                              <Pencil size={16} />
                          </button>
                          <button className="text-black hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Pagination & Controls */}
      <div className="flex justify-end items-center mt-8 space-x-4">
          
          {/* Page Size Select */}
          <div className="relative">
              <select className="border border-gray-200 py-1.5 ps-3 pe-8 text-sm text-gray-600 rounded-[2px] appearance-none bg-white outline-none cursor-pointer hover:border-gray-300">
                  <option>10/page</option>
                  <option>20/page</option>
                  <option>50/page</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Pagination Buttons */}
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
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-2.5 px-8 text-sm transition-all rounded-[2px] shadow-sm">
                Add Rule
            </button>
            <button className="bg-white border-2 border-black text-black hover:bg-black hover:text-white font-bold py-2.5 px-10 text-sm transition-all rounded-[2px] shadow-sm">
                Save
            </button>
      </div>

    </div>
  );
};
