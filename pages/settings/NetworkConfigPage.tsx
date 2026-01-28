
import React, { useState, useEffect } from 'react';
import { SquareSwitch } from '../../components/UIComponents';
import { fetchNetworkConfigInfo, setFlightMode, searchNetwork } from '../../utils/api';
import { useAlert } from '../../utils/AlertContext';
import { Loader2 } from 'lucide-react';

export const NetworkConfigPage: React.FC = () => {
  const [flightMode, setFlightModeState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    const init = async () => {
        try {
            // Fetch initial state using CMD 218
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
      <div className="space-y-0.5">
        {/* Flight Mode Row */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
           <label className="font-bold text-sm text-black">Flight Mode</label>
           <div className="flex justify-end">
             <SquareSwitch 
                isOn={flightMode} 
                onChange={toggleFlightMode} 
                isLoading={switching}
             />
           </div>
        </div>

        {/* Re-search Network Row */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
           <label className="font-bold text-sm text-black">Re-search Network</label>
           <div className="flex justify-end">
             <button 
                onClick={handleSearch}
                disabled={flightMode || searchLoading}
                className={`border-2 font-bold py-2 px-10 text-sm transition-all rounded-[2px] shadow-sm min-w-[120px] flex items-center justify-center
                    ${(flightMode || searchLoading) 
                        ? 'bg-[#f5f5f5] border-gray-300 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#eeeeee] border-black text-black hover:bg-black hover:text-white'
                    }
                `}
             >
                {searchLoading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Search'}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
