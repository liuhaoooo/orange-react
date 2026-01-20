
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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

  const getBreadcrumb = () => {
    let path = `${t('settings')} / ${activeSection.label}`;
    if (activeSection.subTabs && activeSubTabId) {
       const subTab = activeSection.subTabs.find(t => t.id === activeSubTabId);
       if (subTab) {
           path += ` / ${subTab.label}`;
       }
    }
    return path;
  };

  if (!isLoggedIn) {
     return (
          <div className="w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 shadow-sm">
             <div className="text-center p-8">
                 <p className="mb-4 font-bold text-lg">{t('loginAsAdminMsg')}</p>
                 <button 
                    onClick={onOpenLogin}
                    className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 transition-colors"
                 >
                    {t('loginAsAdminBtn')}
                 </button>
             </div>
          </div>
     );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb Header */}
      <div className="bg-white p-4 mb-6 shadow-sm border border-gray-200 flex items-center">
         <button onClick={() => navigate(-1)} className="me-4 text-gray-500 hover:text-black">
            <ChevronLeft size={24} />
         </button>
         <span className="font-bold text-gray-700 text-sm">
            {getBreadcrumb()}
         </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
             {menuItems.map(item => (
                 <button
                    key={item.id}
                    onClick={() => handleSectionClick(item.id)}
                    className={`text-start px-4 py-3 font-bold text-sm border transition-colors ${
                        activeSectionId === item.id 
                        ? 'bg-black text-white border-black shadow-md' 
                        : 'bg-[#e5e5e5] text-black border-black hover:bg-gray-200'
                    }`}
                 >
                    {item.label}
                 </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="flex-1">
             {/* Sub Tabs (if any) */}
             {activeSection.subTabs && (
                 <div className="flex mb-0">
                     {activeSection.subTabs.map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveSubTabId(tab.id)}
                            className={`px-6 py-3 font-bold text-sm border-t border-x transition-colors ${
                                activeSubTabId === tab.id
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-500 border-transparent hover:bg-gray-100'
                            }`}
                         >
                            {tab.label}
                         </button>
                     ))}
                 </div>
             )}

             {/* Main Content Box */}
             <div className={`bg-white border-t-4 border-black p-6 min-h-[500px] shadow-sm ${activeSection.subTabs ? '' : 'border-t-0'}`}>
                 {/* Placeholder Content */}
                 <div className="h-full flex items-center justify-center text-gray-400 italic">
                     Content for {activeSection.label} {activeSubTabId ? `- ${activeSection.subTabs?.find(t => t.id === activeSubTabId)?.label}` : ''} goes here.
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};
