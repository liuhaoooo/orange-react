
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { SquareSwitch, FormRow, StyledInput, PrimaryButton } from '../../components/UIComponents';
import { fetchDhcpSettings, saveDhcpSettings, fetchIpReservation } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';

const ipToLong = (ip: string) => {
    const octets = ip.split('.');
    if (octets.length !== 4) return 0;
    return octets.reduce((acc, octet) => {
        return ((acc << 8) + parseInt(octet, 10)) >>> 0;
    }, 0);
};

const longToIp = (num: number): string => {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff
  ].join('.');
};

const getUsableIpRangeNumeric = (ip: string, netmask: string) => {
  const ipNum = ipToLong(ip);
  const maskNum = ipToLong(netmask);

  const networkAddr = (ipNum & maskNum) >>> 0;
  const wildcard = (~maskNum) >>> 0; 
  const broadcastAddr = (networkAddr | wildcard) >>> 0;

  if (wildcard === 0) {
    return { min: networkAddr, max: networkAddr };
  } else if (wildcard === 1) {
    return { min: networkAddr, max: broadcastAddr };
  } else {
    return { min: networkAddr + 1, max: broadcastAddr - 1 };
  }
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

      // Check Host IP Availability
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
          if (!ipPoolStart || !ipPoolEnd) {
              newErrors.ipPool = 'IP Address Pool range cannot be empty';
              hasError = true;
          } else if (!isValidIp(ipPoolStart) || !isValidIp(ipPoolEnd)) {
              newErrors.ipPool = 'Invalid IP Address in Pool';
              hasError = true;
          } else if (!newErrors.lanIp && isMaskValid) {
               const range = getUsableIpRangeNumeric(lanIp, subnetMask);
               const startNum = ipToLong(ipPoolStart);
               const endNum = ipToLong(ipPoolEnd);
               
               if (startNum < range.min || startNum > range.max || endNum < range.min || endNum > range.max) {
                   const minIpStr = longToIp(range.min);
                   const maxIpStr = longToIp(range.max);
                   newErrors.ipPool = `IP Pool must be within ${minIpStr} ~ ${maxIpStr}`;
                   hasError = true;
               } else if (startNum > endNum) {
                   newErrors.ipPool = 'Start IP cannot be greater than End IP';
                   hasError = true;
               }
          }

          if (!leaseTime) {
              newErrors.leaseTime = 'Lease Time cannot be empty';
              hasError = true;
          } else {
              const val = parseInt(leaseTime, 10);
              if (isNaN(val) || val < 1 || val > 168) {
                  newErrors.leaseTime = 'Lease Time must be between 1 and 168';
                  hasError = true;
              }
          }

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
              expireTime: `${leaseTime}h` 
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
      <div className="max-w-4xl">
        <FormRow label="LAN IP" required error={errors.lanIp}>
            <StyledInput 
                value={lanIp}
                onChange={(e) => {
                    setLanIp(e.target.value);
                    if(errors.lanIp) setErrors(prev => ({...prev, lanIp: ''}));
                }}
                hasError={!!errors.lanIp}
            />
        </FormRow>

        <FormRow label="Subnet Mask" required error={errors.subnetMask}>
            <StyledInput 
                value={subnetMask}
                onChange={(e) => {
                    setSubnetMask(e.target.value);
                    if(errors.subnetMask) setErrors(prev => ({...prev, subnetMask: ''}));
                }}
                hasError={!!errors.subnetMask}
            />
        </FormRow>

        <FormRow label="DHCP Server">
             <SquareSwitch isOn={dhcpServer} onChange={() => setDhcpServer(!dhcpServer)} />
        </FormRow>

        {dhcpServer && (
            <div className="animate-fade-in">
                <FormRow label="Primary DNS" error={errors.primaryDns}>
                    <StyledInput 
                        value={primaryDns}
                        onChange={(e) => setPrimaryDns(e.target.value)}
                        hasError={!!errors.primaryDns}
                    />
                </FormRow>

                <FormRow label="Secondary DNS" error={errors.secondaryDns}>
                    <StyledInput 
                        value={secondaryDns}
                        onChange={(e) => setSecondaryDns(e.target.value)}
                        hasError={!!errors.secondaryDns}
                    />
                </FormRow>

                <FormRow label="IP Address Pool" required error={errors.ipPool}>
                    <div className="flex items-center gap-2">
                        <StyledInput 
                            value={ipPoolStart}
                            onChange={(e) => {
                                setIpPoolStart(e.target.value);
                                if(errors.ipPool) setErrors(prev => ({...prev, ipPool: ''}));
                            }}
                            hasError={!!errors.ipPool}
                        />
                        <span className="text-black">-</span>
                        <StyledInput 
                            value={ipPoolEnd}
                            onChange={(e) => {
                                setIpPoolEnd(e.target.value);
                                if(errors.ipPool) setErrors(prev => ({...prev, ipPool: ''}));
                            }}
                            hasError={!!errors.ipPool}
                        />
                    </div>
                </FormRow>

                <FormRow label="Lease Time" required error={errors.leaseTime}>
                    <StyledInput 
                        value={leaseTime}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setLeaseTime(val);
                            if(errors.leaseTime) setErrors(prev => ({...prev, leaseTime: ''}));
                        }}
                        hasError={!!errors.leaseTime}
                        suffix="Hour"
                    />
                </FormRow>
            </div>
        )}

        <div className="flex justify-end pt-8 pb-2">
            <PrimaryButton 
                onClick={handleSave}
                loading={saving}
                icon={<Save size={18} />}
            >
                Save
            </PrimaryButton>
        </div>

      </div>
    </div>
  );
};
