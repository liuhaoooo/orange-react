
import React, { useState, useEffect } from 'react';
import { SquareSwitch, FormRow, PrimaryButton } from '../../components/UIComponents';
import { fetchNetworkConfigInfo, setFlightMode, searchNetwork } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { Loader2, Search } from 'lucide-react';

export const NetworkConfigPage: React.FC = () => {
  const [flightMode, setFlightModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const init = async () => {
        try {
            const res = await fetchNetworkConfigInfo();
            if (res && res.success) {
                setFlightModeState(res.flightMode === '1');
            }
        } catch (e) {
            console.error("Failed to fetch network config info", e);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  const toggleFlightMode = async () => {
      setSwitching(true);
      const newValue = !flightMode;
      const apiValue = newValue ? '1' : '0';
      
      try {
          const res = await setFlightMode(apiValue);
          if (res && res.success) {
              setFlightModeState(newValue);
              showAlert(newValue ? 'Flight mode enabled' : 'Flight mode disabled', 'success');
          } else {
              showAlert('Operation failed', 'error');
          }
      } catch (e) {
          console.error(e);
          showAlert('Error occurred', 'error');
      } finally {
          setSwitching(false);
      }
  };

  const handleSearch = async () => {
      setSearchLoading(true);
      try {
          const res = await searchNetwork();
          if (res && res.success) {
              showAlert('Network search started...', 'success');
          } else {
              showAlert('Failed to start search', 'error');
          }
      } catch (e) {
          console.error(e);
          showAlert('Error occurred', 'error');
      } finally {
          setSearchLoading(false);
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
    <div className="w-full animate-fade-in py-2">
      <div className="max-w-4xl">
        <FormRow label="Flight Mode">
             <SquareSwitch 
                isOn={flightMode} 
                onChange={toggleFlightMode} 
                isLoading={switching}
             />
        </FormRow>

        <FormRow label="Re-search Network">
             <PrimaryButton 
                onClick={handleSearch}
                disabled={flightMode || searchLoading}
                loading={searchLoading}
                className="bg-[#f2f2f2] border-black text-black hover:bg-black hover:text-white"
                icon={<Search size={16} />}
             >
                Search
             </PrimaryButton>
        </FormRow>
      </div>
    </div>
  );
};
