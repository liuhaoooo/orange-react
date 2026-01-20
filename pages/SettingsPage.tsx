
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';

interface SettingsPageProps {
  onOpenLogin: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenLogin }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isLoggedIn } = useGlobalState();
  
  // Menu Configuration
  const menuItems = [
    { id: 'network', label: t('network') },
    { id: 'device_info', label: t('deviceInfo') },
    { id: 'network_info', label: t('networkInfo') },
    { id: 'sim', label: t('simFunction') },
    { id: 'display_solution', label: t('displaySolution') },
    { 
      id: 'usage', 
      label: t('usage'), 
      subTabs: [
        { id: 'national', label: t('national') },
        { id: 'international', label: t('international') }
      ] 
    },
    { id: 'messages', label: t('messages') },
    { id: 'ims', label: t('imsSetting') },
    { id: 'wifi', label: t('wifi') },
    { id: 'guest_wifi', label: t('guestWifi') },
    { id: 'dhcp', label: t('dhcp') }
  ];

  // State for Navigation
  const [activeSectionId, setActiveSectionId] = useState('usage'); // Default to Usage as in screenshot
  const [activeSubTabId, setActiveSubTabId] = useState('national'); // Default to National

  const activeSection = menuItems.find(item => item.id === activeSectionId) || menuItems[0];
  
  // Handle Section Click
  const handleSectionClick = (id: string) => {
    setActiveSectionId(id);
    // Reset subtab to first one if available
    const item = menuItems.find(i => i.id === id);
    if (item && item.subTabs && item.subTabs.length > 0) {
      setActiveSubTabId(item.subTabs[0].id);
    } else {
      setActiveSubTabId('');
    }
  };

  if (!isLoggedIn) {
     return (
          <div className="w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-xl">
             <div className="text-center p-8">
                 <p className="mb-4 font-bold text-lg">{t('loginAsAdminMsg')}</p>
                 <button 
                    onClick={onOpenLogin}
                    className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 transition-colors rounded-lg"
                 >
                    {t('loginAsAdminBtn')}
                 </button>
             </div>
          </div>
     );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Header */}
      <div className="bg-white px-6 py-4 mb-8 shadow-sm border border-gray-200 flex items-center rounded-xl transition-all hover:shadow-md">
         <button onClick={() => navigate(-1)} className="me-4 text-gray-400 hover:text-orange transition-colors">
            <ChevronLeft size={28} strokeWidth={2.5} />
         </button>
         <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t('settings')}</span>
            <span className="font-bold text-black text-xl flex items-center">
                {activeSection.label} 
                {activeSubTabId && activeSection.subTabs && (
                    <>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-orange">{activeSection.subTabs.find(t => t.id === activeSubTabId)?.label}</span>
                    </>
                )}
            </span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-3">
             {menuItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`
                        group flex items-center justify-between px-5 py-4 font-bold text-sm border-2 transition-all duration-200 rounded-xl
                        ${activeSectionId === item.id 
                            ? 'bg-black text-white border-black shadow-lg scale-[1.02] z-10' 
                            : 'bg-white text-gray-600 border-transparent hover:border-orange hover:text-orange hover:shadow-md hover:bg-orange/5'
                        }
                    `}
                 >
                    <span>{item.label}</span>
                    {activeSectionId === item.id && <ChevronRight size={18} className="animate-fade-in" />}
                 </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
             {/* Sub Tabs (if any) */}
             {activeSection.subTabs && (
                 <div className="flex mb-5 gap-2 overflow-x-auto pb-1 px-1">
                     {activeSection.subTabs.map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveSubTabId(tab.id)}
                            className={`px-6 py-2.5 font-bold text-sm rounded-full border-2 transition-all whitespace-nowrap ${
                                activeSubTabId === tab.id
                                ? 'bg-black text-white border-black shadow-md'
                                : 'bg-white text-gray-500 border-transparent hover:border-gray-300 hover:text-black hover:bg-white'
                            }`}
                         >
                            {tab.label}
                         </button>
                     ))}
                 </div>
             )}

             {/* Main Content Box */}
             <div className="bg-white border border-gray-200 p-8 min-h-[600px] shadow-sm rounded-2xl relative overflow-hidden transition-all hover:shadow-md">
                 {/* Decorative background element */}
                 <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>
                 
                 <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-8 text-black pb-4 border-b border-gray-100">
                        {activeSection.label}
                        {activeSubTabId && activeSection.subTabs && (
                            <span className="text-gray-400 font-normal ms-2 text-lg">
                                - {activeSection.subTabs.find(t => t.id === activeSubTabId)?.label}
                            </span>
                        )}
                    </h2>

                    {/* Placeholder Content Area */}
                    <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        <p className="italic mb-3">Configuration panel for:</p>
                        <p className="font-bold text-black text-xl bg-white px-6 py-2 rounded-lg shadow-sm">{activeSection.label}</p>
                    </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};
