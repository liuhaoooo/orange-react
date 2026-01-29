
import React, { useState } from 'react';
import { Settings, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from '../utils/GlobalStateContext';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { resetStatistics, fetchStatusInfo } from '../utils/api';
import clientAreaSvg from '../assets/client-area.svg';

interface UsagePageProps {
  onOpenSettings: () => void;
}

const UsageDonut = ({ label, value, unit, total, color }: { label: string, value: number, unit: string, total: number, color: string }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="flex flex-col items-center">
      <div className="text-black font-bold mb-4">{label}</div>
      <div className="relative w-56 h-56 rounded-full flex items-center justify-center bg-gray-100"
           style={{
             background: `conic-gradient(${color} ${percentage}%, #f3f4f6 ${percentage}% 100%)`
           }}
      >
        <div className="absolute w-44 h-44 bg-white rounded-full flex flex-col items-center justify-center">
             <span className="text-3xl font-bold text-black">{value.toFixed(2)}</span>
             <span className="text-xl font-bold text-gray-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

// Helper: Auto-convert MB string to { val, unit }
const formatTraffic = (mbStr: string | undefined) => {
    const mb = parseFloat(mbStr || '0');
    if (isNaN(mb)) return { val: 0, unit: 'MB' };

    if (mb >= 1024) {
        return { val: mb / 1024, unit: 'GB' };
    } else if (mb < 1 && mb > 0) {
        return { val: mb * 1024, unit: 'KB' };
    }
    return { val: mb, unit: 'MB' };
};

const getLimitInMb = (limit: string | undefined, unit: string | undefined) => {
    if (!limit) return 0;
    const val = parseFloat(limit);
    if (isNaN(val)) return 0;
    
    if (unit === '1') {
      return val * 1000;
    } else if (unit === '2') {
      return val * 1000000;
    }
    return val;
  };

export const UsagePage: React.FC<UsagePageProps> = ({ onOpenSettings }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isLoggedIn, globalData, updateGlobalData } = useGlobalState();
  const info = globalData.statusInfo;
  const flowLimitUnit = info?.flow_limit_unit;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleAuthAction = (action: () => void) => {
    if (isLoggedIn) {
        action();
    } else {
        onOpenSettings();
    }
  };

  const handleSettingsClick = () => {
    if (!isLoggedIn) {
        onOpenSettings();
        return;
    }
    // Navigate to Settings -> Usage -> National
    navigate('/settings', { 
        state: { sectionId: 'usage', subTabId: 'national' } 
    });
  };

  const handleResetClick = () => {
      handleAuthAction(() => setIsConfirmOpen(true));
  };

  const handleConfirmReset = async () => {
      setIsResetting(true);
      try {
          const res = await resetStatistics();
          if (res && res.success) {
              // Refresh status info to reflect zeroed counters
              const statusData = await fetchStatusInfo();
              if (statusData && statusData.success) {
                  updateGlobalData('statusInfo', statusData);
              }
          }
      } catch (e) {
          console.error("Failed to reset statistics", e);
      } finally {
          setIsResetting(false);
          setIsConfirmOpen(false);
      }
  };

  // --- Calculations for Ring Charts ---
  
  // National: dl_mon_flow + ul_mon_flow
  const natUsedMb = (parseFloat(info?.dl_mon_flow || '0') + parseFloat(info?.ul_mon_flow || '0'));
  const natTotalMb = getLimitInMb(info?.nation_limit_size, flowLimitUnit);
  const natFormatted = formatTraffic(natUsedMb.toString());
  
  let natTotalConverted = natTotalMb;
  if (natFormatted.unit === 'GB') natTotalConverted = natTotalMb / 1024;
  else if (natFormatted.unit === 'KB') natTotalConverted = natTotalMb * 1024;


  // International: roam_dl_mon_flow + roam_ul_mon_flow
  const intUsedMb = (parseFloat(info?.roam_dl_mon_flow || '0') + parseFloat(info?.roam_ul_mon_flow || '0'));
  const intTotalMb = getLimitInMb(info?.internation_limit_size, flowLimitUnit);
  const intFormatted = formatTraffic(intUsedMb.toString());
  
  let intTotalConverted = intTotalMb;
  if (intFormatted.unit === 'GB') intTotalConverted = intTotalMb / 1024;
  else if (intFormatted.unit === 'KB') intTotalConverted = intTotalMb * 1024;

  // --- Calculations for Session Details ---

  // National Session
  const natUpload = formatTraffic(info?.ul_mon_flow);
  const natDownload = formatTraffic(info?.dl_mon_flow);

  // International Session
  const intUpload = formatTraffic(info?.roam_ul_mon_flow);
  const intDownload = formatTraffic(info?.roam_dl_mon_flow);


  return (
    <>
    <div className="w-full">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-bold text-black mb-1">{t('usage')}</h1>
            <p className="text-gray-400 text-sm">Info coming from Airbox2</p>
        </div>
        <div className="flex space-x-3">
             <button 
                onClick={handleSettingsClick}
                className="bg-white border border-black px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-gray-50 transition-colors"
             >
                <Settings size={16} className="me-2" />
                {t('settings')}
             </button>
             <button 
                onClick={handleResetClick}
                className="bg-orange border border-orange px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-orange-dark transition-colors"
             >
                <RotateCcw size={16} className="me-2 transform -scale-x-100" />
                {t('reset')}
             </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col space-y-8">
            
            {/* My Usage Section */}
            <div className="border border-gray-200 bg-white shadow-sm">
                <div className="bg-black text-white px-4 py-3 font-bold text-sm">
                    {t('myUsage')}
                </div>
                <div className="p-10 flex flex-col md:flex-row justify-around items-center gap-10">
                    <UsageDonut 
                        label={t('national')} 
                        value={natFormatted.val} 
                        unit={natFormatted.unit} 
                        total={natTotalConverted} 
                        color="#ff7900" 
                    />
                    <UsageDonut 
                        label={t('international')} 
                        value={intFormatted.val} 
                        unit={intFormatted.unit} 
                        total={intTotalConverted} 
                        color="#ff7900" 
                    />
                </div>
            </div>

            {/* Current Session Section */}
            <div className="border border-gray-200 bg-white shadow-sm">
                <div className="bg-black text-white px-4 py-3 font-bold text-sm">
                    {t('currentSession')}
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-black mb-4">{t('national')}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="w-24">{t('uploads')}</span>
                            <ArrowUp size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">{natUpload.val.toFixed(2)} {natUpload.unit}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="w-24">{t('downloads')}</span>
                            <ArrowDown size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">{natDownload.val.toFixed(2)} {natDownload.unit}</span>
                        </div>
                    </div>
                    
                    <div className="md:border-s md:border-gray-200 md:ps-8">
                        <h3 className="font-bold text-black mb-4">{t('international')}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="w-24">{t('uploads')}</span>
                            <ArrowUp size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">{intUpload.val.toFixed(2)} {intUpload.unit}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="w-24">{t('downloads')}</span>
                            <ArrowDown size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">{intDownload.val.toFixed(2)} {intDownload.unit}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:w-[320px] shrink-0">
            <div className="bg-[#f2f2f2] border border-gray-200 p-6 flex flex-col items-center text-center h-full min-h-[450px]">
                
                <div className="w-full max-w-[200px] mb-8 mt-12 relative">
                     <img 
                        src={clientAreaSvg} 
                        alt="Client Area" 
                        className="w-full h-auto"
                     />
                     <div className="absolute -top-4 -right-4 bg-orange text-white p-2 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                     </div>
                </div>

                <div className="mt-auto w-full">
                    <h3 className="font-bold text-black text-lg mb-2 text-start">{t('clientArea')}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-snug text-start">
                        {t('clientAreaDesc')}
                    </p>

                    <button className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-8 text-sm transition-colors w-full rounded-none">
                        {t('connect')}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>

    <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        isLoading={isResetting}
        title={t('reset')}
        message={t('resetCountersConfirm')}
    />
    </>
  );
};
