
import React, { useState } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';

interface ReservationRule {
  id: string;
  ip: string;
  mac: string;
}

export const DhcpSettingsPage: React.FC = () => {
  const [lanIp, setLanIp] = useState('192.168.0.1');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [dhcpServer, setDhcpServer] = useState(true);
  const [primaryDns, setPrimaryDns] = useState('192.168.0.1');
  const [secondaryDns, setSecondaryDns] = useState('');
  const [ipPoolStart, setIpPoolStart] = useState('192.168.0.100');
  const [ipPoolEnd, setIpPoolEnd] = useState('192.168.0.200');
  const [leaseTime, setLeaseTime] = useState('10');

  const [reservations, setReservations] = useState<ReservationRule[]>([
    { id: '1', ip: '1.1.1.1', mac: 'AA:AA:AA:AA:AA:AA' }
  ]);

  return (
    <div className="w-full animate-fade-in py-6">
      
      {/* Form Section */}
      <div className="max-w-4xl space-y-6">
        
        {/* LAN IP */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">
                    <span className="text-red-500 me-1">*</span>LAN IP
                </label>
            </div>
            <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={lanIp}
                    onChange={(e) => setLanIp(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-400"
                />
            </div>
        </div>

        {/* Subnet Mask */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">
                    <span className="text-red-500 me-1">*</span>Subnet Mask
                </label>
            </div>
            <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={subnetMask}
                    onChange={(e) => setSubnetMask(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-400"
                />
            </div>
        </div>

        {/* DHCP Server */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">DHCP Server</label>
            </div>
            <div className="w-full sm:w-2/3 flex justify-end">
                <SquareSwitch isOn={dhcpServer} onChange={() => setDhcpServer(!dhcpServer)} />
            </div>
        </div>

        {/* Primary DNS */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">Primary DNS</label>
            </div>
            <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={primaryDns}
                    onChange={(e) => setPrimaryDns(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-400"
                />
            </div>
        </div>

        {/* Secondary DNS */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">Secondary DNS</label>
            </div>
            <div className="w-full sm:w-2/3">
                <input 
                    type="text" 
                    value={secondaryDns}
                    onChange={(e) => setSecondaryDns(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-400"
                />
            </div>
        </div>

        {/* IP Address Pool */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">
                    <span className="text-red-500 me-1">*</span>IP Address Pool
                </label>
            </div>
            <div className="w-full sm:w-2/3 flex items-center gap-2">
                <input 
                    type="text" 
                    value={ipPoolStart}
                    onChange={(e) => setIpPoolStart(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-400"
                />
                <span className="text-black">-</span>
                <input 
                    type="text" 
                    value={ipPoolEnd}
                    onChange={(e) => setIpPoolEnd(e.target.value)}
                    className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white hover:border-gray-400"
                />
            </div>
        </div>

        {/* Lease Time */}
        <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">
                    <span className="text-red-500 me-1">*</span>Lease Time
                </label>
            </div>
            <div className="w-full sm:w-2/3">
                <div className="relative w-full">
                    <input 
                        type="text" 
                        value={leaseTime}
                        onChange={(e) => setLeaseTime(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 text-sm text-black outline-none focus:border-orange transition-all rounded-[2px] bg-white pr-16 hover:border-gray-400"
                    />
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-4 bg-[#f3f4f6] border-l border-gray-300 text-gray-500 text-sm rounded-r-[2px]">
                        Hour
                    </div>
                </div>
            </div>
        </div>

        {/* Form Save Button */}
        <div className="flex justify-end pt-4 pb-2">
            <button className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-10 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px]">
                Save
            </button>
        </div>

      </div>

      {/* IP Address Reservation Section */}
      <div className="mt-8">
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
    </div>
  );
};
