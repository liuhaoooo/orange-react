
import React from 'react';
import { Settings, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';

interface UsagePageProps {
  onOpenSettings: () => void;
}

const UsageDonut = ({ label, value, unit, total, color }: { label: string, value: number, unit: string, total: number, color: string }) => {
  const percentage = (value / total) * 100;
  return (
    <div className="flex flex-col items-center">
      <div className="text-black font-bold mb-4">{label}</div>
      <div className="relative w-56 h-56 rounded-full flex items-center justify-center bg-gray-100"
           style={{
             background: `conic-gradient(${color} ${percentage}%, #f3f4f6 ${percentage}% 100%)`
           }}
      >
        <div className="absolute w-44 h-44 bg-white rounded-full flex flex-col items-center justify-center">
             <span className="text-3xl font-bold text-black">{value.toFixed(1)}</span>
             <span className="text-xl font-bold text-gray-500">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export const UsagePage: React.FC<UsagePageProps> = ({ onOpenSettings }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();

  const handleAuthAction = (action: () => void) => {
    if (isLoggedIn) {
        action();
    } else {
        onOpenSettings();
    }
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-bold text-black mb-1">{t('usage')}</h1>
            <p className="text-gray-400 text-sm">Info coming from Airbox2</p>
        </div>
        <div className="flex space-x-3">
             <button 
                onClick={onOpenSettings}
                className="bg-white border border-black px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-gray-50 transition-colors"
             >
                <Settings size={16} className="me-2" />
                {t('settings')}
             </button>
             <button 
                onClick={() => handleAuthAction(() => console.log('Reset'))}
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
                        value={465.7} 
                        unit="GB" 
                        total={1000} 
                        color="#ff7900" 
                    />
                    <UsageDonut 
                        label={t('international')} 
                        value={931.3} 
                        unit="GB" 
                        total={1000} 
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
                            <span className="font-bold text-black">44 KB</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="w-24">{t('downloads')}</span>
                            <ArrowDown size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">49 KB</span>
                        </div>
                    </div>
                    
                    <div className="md:border-s md:border-gray-200 md:ps-8">
                        <h3 className="font-bold text-black mb-4">{t('international')}</h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="w-24">{t('uploads')}</span>
                            <ArrowUp size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">1000 B</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="w-24">{t('downloads')}</span>
                            <ArrowDown size={16} className="me-2 text-black" />
                            <span className="font-bold text-black">10 KB</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Right Sidebar */}
        <div className="lg:w-[320px] shrink-0">
            <div className="bg-[#f2f2f2] border border-gray-200 p-6 flex flex-col items-center text-center h-full min-h-[450px]">
                
                <div className="w-full max-w-[200px] mb-8 mt-12 relative">
                     {/* Placeholder for the illustration - Using a generic tech/robot illustration */}
                     <img 
                        src="https://cdn-icons-png.flaticon.com/512/4233/4233839.png" 
                        alt="Client Area" 
                        className="w-full h-auto opacity-90 grayscale"
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
  );
};
