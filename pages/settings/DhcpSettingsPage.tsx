
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchDhcpSettings, saveDhcpSettings, fetchIpReservation } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const ipToLong = (ip: string) => {
    const octets = ip.split('.');
    if (octets.length !== 4) return 0;
    return octets.reduce((acc, octet) => {
        return ((acc << 8) + parseInt(octet, 10)) >>> 0;
    }, 0);
};

const isValidSubnetMask = (subnetMask: string) => {
    if (!subnetMask) return false;
    const octets = subnetMask.split('.');
    if (octets.length !== 4) return false;
    let binaryString = '';
    for (const octetStr of octets) {
        const num = parseInt(octetStr, 10);
        if (Number.isNaN(num) || num < 0 || num > 255) return false;
        binaryString += num.toString(2).padStart(8, '0');
    }
    return /^1+0*$/.test(binaryString);
};

const isValidIp = (ip: string) => {
    if (!ip) return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        if (!/^\d+$/.test(part)) return false;
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

  // Validation Data
  const [reservedIps, setReservedIps] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
      const load = async () => {
          try {
              const [dhcpRes, ipRes] = await Promise.all([
                  fetchDhcpSettings(),
                  fetchIpReservation()
              ]);

              if (dhcpRes && (dhcpRes.success || dhcpRes.cmd === 3)) {
                  setLanIp(dhcpRes.lanIp || '');
                  setSubnetMask(dhcpRes.netMask || '');
                  setDhcpServer(dhcpRes.dhcpServer === '1');
                  setPrimaryDns(dhcpRes.main_dns || '');
                  setSecondaryDns(dhcpRes.vice_dns || '');
                  setIpPoolStart(dhcpRes.ipBegin || '');
                  setIpPoolEnd(dhcpRes.ipEnd || '');
                  // Parse expireTime (e.g. "12h" -> "12")
                  const timeStr = dhcpRes.expireTime || '';
                  setLeaseTime(timeStr.replace(/[^0-9]/g, ''));
              }

              if (ipRes && (ipRes.success || ipRes.cmd === 115)) {
                  if (Array.isArray(ipRes.datas)) {
                      setReservedIps(ipRes.datas.map(item => item.ip));
                  }
              }

          } catch (e) {
              console.error("Failed to load settings", e);
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

      // Validate LAN IP Format
      if (!lanIp) {
          newErrors.lanIp = 'LAN IP cannot be empty';
          hasError = true;
      } else if (!isValidIp(lanIp)) {
          newErrors.lanIp = 'Invalid LAN IP address';
          hasError = true;
      } else if (reservedIps.includes(lanIp)) {
          // Check if IP is in reserved list
          newErrors.lanIp = 'IP address conflicts with IP Reservation list';
          hasError = true;
      }

      // Validate Subnet Mask
      let isMaskValid = false;
      if (!subnetMask) {
          newErrors.subnetMask = 'Subnet Mask cannot be empty';
          hasError = true;
      } else if (!isValidIp(subnetMask)) {
          newErrors.subnetMask = 'Invalid Subnet Mask format';
          hasError = true;
      } else if (!isValidSubnetMask(subnetMask)) {
          newErrors.subnetMask = 'Invalid Subnet Mask';
          hasError = true;
      } else {
          isMaskValid = true;
      }

      // Check Host IP Availability (Network/Broadcast address conflict)
      if (!newErrors.lanIp && isMaskValid) {
          const ipNum = ipToLong(lanIp);
          const maskNum = ipToLong(subnetMask);
          const networkAddress = (ipNum & maskNum) >>> 0;
          const broadcastAddress = (networkAddress | (~maskNum >>> 0)) >>> 0;

          if (ipNum === broadcastAddress) {
              newErrors.lanIp = 'Cannot use broadcast address';
              hasError = true;
          } else if (ipNum === networkAddress) {
              newErrors.lanIp = 'Cannot use network address';
              hasError = true;
          }
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
    </div>
  );
};
