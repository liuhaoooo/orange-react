
import React, { useState } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReservationRule {
  id: string;
  ip: string;
  mac: string;
}

export const IpAddressReservationPage: React.FC = () => {
  // Static Reservation State
  const [reservations, setReservations] = useState<ReservationRule[]>([
    { id: '1', ip: '1.1.1.1', mac: 'AA:AA:AA:AA:AA:AA' }
  ]);

  return (
    <div className="w-full animate-fade-in py-6">
      <div className="text-center mb-6">
          <h3 className="font-bold text-base text-gray-700">IP Address Reservation</h3>
      </div>
      
      <div className="border-t border-gray-200">
          {/* Header */}
          <div className="grid grid-cols-12 py-4 border-b border-gray-100">
              <div className="col-span-5 ps-4 font-bold text-sm text-black">IP</div>
              <div className="col-span-5 font-bold text-sm text-black">MAC</div>
              <div className="col-span-2"></div>
          </div>

          {/* Rows */}
          {reservations.map((item) => (
              <div key={item.id} className="grid grid-cols-12 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                  <div className="col-span-5 ps-4 text-sm text-black font-medium">{item.ip}</div>
                  <div className="col-span-5 text-sm text-black font-medium uppercase">{item.mac}</div>
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
          {reservations.length === 0 && (
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
      <div className="flex justify-end mt-12 space-x-4">
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Add Rule
            </button>
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Clear All
            </button>
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-8 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Save
            </button>
      </div>
    </div>
  );
};
