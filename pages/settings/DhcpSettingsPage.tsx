
import React, { useState, useEffect } from 'react';
import { ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchDhcpSettings, saveDhcpSettings } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

interface ReservationRule {
  id: string;
  ip: string;
  mac: string;
}

const isValidIp = (ip: string) => {
    if (!ip) return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255;
    });
};

const FormRow = ({ label, children, required = false, error }: { label: string; children?: React.ReactNode; required?: boolean; error?: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0">
    <div className="w-full sm:w-1/3 mb-2 sm:mb-0 self-start sm:self-center">
      <label className="font-bold text-sm text-black">
        {required && <span className="text-red-500 me-1">*</span>}
        {label}
      </label>
    </div>
    <div className="w-full sm:w-2/3">
      {children}
      {error && <div className="text-red-500 text-xs mt-1 font-bold">{error}</div>}
    </div>
  </div>
);

export const DhcpSettingsPage: React.FC = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [lanIp, setLanIp] = useState('');
  const [subnetMask, setSubnetMask] = useState('');
  const [dhcpServer, setDhcpServer] = useState(false);
  const [primaryDns, setPrimaryDns] = useState('');
  const [secondaryDns, setSecondaryDns] = useState('');
  const [ipPoolStart, setIpPoolStart] = useState('');
  const [ipPoolEnd, setIpPoolEnd] = useState('');
  const [leaseTime, setLeaseTime] = useState('');

  // Static Reservation State (Not part of API request per instructions)
  const [reservations, setReservations] = useState<ReservationRule[]>([
    { id: '1', ip: '1.1.1.1', mac: 'AA:AA:AA:AA:AA:AA' }
  ]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
      const load = async () => {
          try {
              const res = await fetchDhcpSettings();
              if (res && (res.success || res.cmd === 3)) {
                  setLanIp(res.lanIp || '');
                  setSubnetMask(res.netMask || '');
                  setDhcpServer(res.dhcpServer === '1');
                  setPrimaryDns(res.main_dns || '');
                  setSecondaryDns(res.vice_dns || '');
                  setIpPoolStart(res.ipBegin || '');
                  setIpPoolEnd(res.ipEnd || '');
                  // Parse expireTime (e.g. "12h" -> "12")
                  const timeStr = res.expireTime || '';
                  setLeaseTime(timeStr.replace(/[^0-9]/g, ''));
              }
          } catch (e) {
              console.error("Failed to load DHCP settings", e);
              showAlert('Failed to load settings', 'error');
          } finally {
              setLoading(false);
          }
      };
      load();
  }, [showAlert]);

  const handleSave = async () => {
      setErrors({});
      const newErrors: Record<string, string> = {};
      let hasError = false;

      // Validate LAN IP
      if (!lanIp) {
          newErrors.lanIp = 'LAN IP cannot be empty';
          hasError = true;
      } else if (!isValidIp(lanIp)) {
          newErrors.lanIp = 'Invalid LAN IP address';
          hasError = true;
      }

      // Validate Subnet Mask
      if (!subnetMask) {
          newErrors.subnetMask = 'Subnet Mask cannot be empty';
          hasError = true;
      } else if (!isValidIp(subnetMask)) {
          newErrors.subnetMask = 'Invalid Subnet Mask';
          hasError = true;
      }

      if (dhcpServer) {
          // Validate IP Pool
          if (!ipPoolStart || !ipPoolEnd) {
              newErrors.ipPool = 'IP Address Pool range cannot be empty';
              hasError = true;
          } else if (!isValidIp(ipPoolStart) || !isValidIp(ipPoolEnd)) {
              newErrors.ipPool = 'Invalid IP Address in Pool';
              hasError = true;
          }

          // Validate Lease Time
          if (!leaseTime) {
              newErrors.leaseTime = 'Lease Time cannot be empty';
              hasError = true;
          } else if (isNaN(parseInt(leaseTime, 10))) {
              newErrors.leaseTime = 'Lease Time must be a number';
              hasError = true;
          }

          // Optional DNS Validation
          if (primaryDns && !isValidIp(primaryDns)) {
              newErrors.primaryDns = 'Invalid Primary DNS';
              hasError = true;
          }
          if (secondaryDns && !isValidIp(secondaryDns)) {
              newErrors.secondaryDns = 'Invalid Secondary DNS';
              hasError = true;
          }
      }

      if (hasError) {
          setErrors(newErrors);
          return;
      }

      setSaving(true);
      try {
          const payload = {
              lanIp,
              netMask: subnetMask,
              dhcpServer: dhcpServer ? '1' : '0',
              main_dns: primaryDns,
              vice_dns: secondaryDns,
              ipBegin: ipPoolStart,
              ipEnd: ipPoolEnd,
              expireTime: `${leaseTime}h` // Append 'h' as per requirement
          };

          const res = await saveDhcpSettings(payload);
          if (res && (res.success || res.result === 'success')) {
              showAlert('Settings saved successfully', 'success');
          } else {
              showAlert('Failed to save settings', 'error');
          }
      } catch (e) {
          console.error("Failed to save DHCP settings", e);
          showAlert('An error occurred', 'error');
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="w-full h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-orange" size={40} />
          </div>
      );
  }

  return (
    <div className="w-full animate-fade-in py-6">
      
      {/* Form Section */}
      <div className="max-w-4xl">
        
        {/* LAN IP */}
        <FormRow label="LAN IP" required error={errors.lanIp}>
            <input 
                type="text" 
                value={lanIp}
                onChange={(e) => {
                    setLanIp(e.target.value);
                    if(errors.lanIp) setErrors(prev => ({...prev, lanIp: ''}));
                }}
                className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white hover:border-gray-400 ${errors.lanIp ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
            />
        </FormRow>

        {/* Subnet Mask */}
        <FormRow label="Subnet Mask" required error={errors.subnetMask}>
            <input 
                type="text" 
                value={subnetMask}
                onChange={(e) => {
                    setSubnetMask(e.target.value);
                    if(errors.subnetMask) setErrors(prev => ({...prev, subnetMask: ''}));
                }}
                className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white hover:border-gray-400 ${errors.subnetMask ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
            />
        </FormRow>

        {/* DHCP Server Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100">
            <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
                <label className="font-bold text-sm text-black">DHCP Server</label>
            </div>
            <div className="w-full sm:w-2/3 flex justify-end">
                <SquareSwitch isOn={dhcpServer} onChange={() => setDhcpServer(!dhcpServer)} />
            </div>
        </div>

        {/* DHCP Dependent Fields */}
        {dhcpServer && (
            <div className="animate-fade-in">
                {/* Primary DNS */}
                <FormRow label="Primary DNS" error={errors.primaryDns}>
                    <input 
                        type="text" 
                        value={primaryDns}
                        onChange={(e) => setPrimaryDns(e.target.value)}
                        className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white hover:border-gray-400 ${errors.primaryDns ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                    />
                </FormRow>

                {/* Secondary DNS */}
                <FormRow label="Secondary DNS" error={errors.secondaryDns}>
                    <input 
                        type="text" 
                        value={secondaryDns}
                        onChange={(e) => setSecondaryDns(e.target.value)}
                        className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white hover:border-gray-400 ${errors.secondaryDns ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                    />
                </FormRow>

                {/* IP Address Pool */}
                <FormRow label="IP Address Pool" required error={errors.ipPool}>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={ipPoolStart}
                            onChange={(e) => {
                                setIpPoolStart(e.target.value);
                                if(errors.ipPool) setErrors(prev => ({...prev, ipPool: ''}));
                            }}
                            className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white hover:border-gray-400 ${errors.ipPool ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                        />
                        <span className="text-black">-</span>
                        <input 
                            type="text" 
                            value={ipPoolEnd}
                            onChange={(e) => {
                                setIpPoolEnd(e.target.value);
                                if(errors.ipPool) setErrors(prev => ({...prev, ipPool: ''}));
                            }}
                            className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white hover:border-gray-400 ${errors.ipPool ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                        />
                    </div>
                </FormRow>

                {/* Lease Time */}
                <FormRow label="Lease Time" required error={errors.leaseTime}>
                    <div className="relative w-full">
                        <input 
                            type="text" 
                            value={leaseTime}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) setLeaseTime(val);
                                if(errors.leaseTime) setErrors(prev => ({...prev, leaseTime: ''}));
                            }}
                            className={`w-full border px-3 py-2 text-sm text-black outline-none transition-all rounded-[2px] bg-white pr-16 hover:border-gray-400 ${errors.leaseTime ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange'}`}
                        />
                        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center px-4 bg-[#f3f4f6] border-l border-gray-300 text-gray-500 text-sm rounded-r-[2px]">
                            Hour
                        </div>
                    </div>
                </FormRow>
            </div>
        )}

        {/* Form Save Button */}
        <div className="flex justify-end pt-8 pb-2">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-[#eeeeee] border-2 border-black text-black hover:bg-white font-bold py-1.5 px-10 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center"
            >
                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save'}
            </button>
        </div>

      </div>

      {/* IP Address Reservation Section (Static as per prompt instruction focus) */}
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
