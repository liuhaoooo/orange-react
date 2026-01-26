
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { ApnSettingsPage } from './settings/ApnSettingsPage';
import { MultipleApnPage } from './settings/MultipleApnPage';
import { NetworkModePage } from './settings/NetworkModePage';
import { NetworkConfigPage } from './settings/NetworkConfigPage';
import { PlmnScanPage } from './settings/PlmnScanPage';
import { LockBandPage } from './settings/LockBandPage';
import { CellLockingPage } from './settings/CellLockingPage';
import { LinkDetectionPage } from './settings/LinkDetectionPage';
import { VlanPage } from './settings/VlanPage';
import { DeviceInfoPage } from './settings/DeviceInfoPage';
import { NetworkInfoPage } from './settings/NetworkInfoPage';
import { SimFunctionPage } from './settings/SimFunctionPage';
import { SimSwitchingPage } from './settings/SimSwitchingPage';
import { DisplaySolutionPage } from './settings/DisplaySolutionPage';
import { UsageSettingsPage } from './settings/UsageSettingsPage';

interface SettingsPageProps {
  onOpenLogin: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenLogin }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useGlobalState();
  
  // Menu Configuration
  const menuItems = [
    { 
      id: 'network', 
      label: t('network'),
      subTabs: [
          { id: 'apn_settings', label: t('apnSettings') },
          { id: 'multiple_apn', label: t('multipleApn') },
          { id: 'network_mode', label: t('networkMode') },
          { id: 'network_config', label: t('networkConfig') },
          { id: 'plmn_scan', label: t('plmnScan') },
          { id: 'lock_band', label: t('lockBand') },
          { id: 'cell_locking', label: t('cellLocking') },
          { id: 'link_detection', label: t('linkDetection') },
          { id: 'vlan', label: t('vlan') },
      ]
    },
    { id: 'device_info', label: t('deviceInfo') },
    { id: 'network_info', label: t('networkInfo') },
    { 
      id: 'sim', 
      label: t('simFunction'),
      subTabs: [
          { id: 'sim_function', label: t('simFunction') },
          { id: 'sim_switching', label: t('simCardSwitching') }
      ]
    },
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
    { 
      id: 'wifi', 
      label: t('wifi'),
      subTabs: [
          { id: 'mac_filtering_24', label: t('macFiltering24') },
          { id: 'wps_settings_24', label: t('wpsSettings24') },
          { id: 'adv_settings_24', label: t('advSettings24') },
          { id: 'mac_filtering_5', label: t('macFiltering5') },
          { id: 'wps_settings_5', label: t('wpsSettings5') },
          { id: 'adv_settings_5', label: t('advSettings5') }
      ]
    },
    { 
      id: 'dhcp', 
      label: t('dhcp'),
      subTabs: [
          { id: 'dhcp_settings', label: t('dhcp') },
          { id: 'multiple_dhcp', label: t('multipleDhcp') }
      ]
    },
    { id: 'routing', label: t('routingConfiguration') },
    { 
      id: 'mesh', 
      label: t('meshNetworking'),
      subTabs: [
          { id: 'basic_config', label: t('basicConfig') },
          { id: 'topology_diagram', label: t('topologyDiagram') }
      ]
    },
    { 
      id: 'vpn', 
      label: t('vpnSettings'),
      subTabs: [
          { id: 'vpn_main', label: t('vpn') },
          { id: 'gre_settings', label: t('greSettings') },
          { id: 'ipsec_vpn', label: t('ipsecVpn') },
          { id: 'ipsec_status', label: t('ipsecStatus') }
      ]
    },
    { id: 'sipalg', label: t('sipAlg') },
    { id: 'voice', label: t('voice') },
    { 
      id: 'ip_passthrough', 
      label: t('ipPassthrough'),
      subTabs: [
          { id: 'ip_passthrough_main', label: t('ipPassthrough') },
          { id: 'multiple_ip_passthrough', label: t('multipleIpPassthrough') }
      ]
    },
    { id: 'tr069', label: t('tr069') },
    { 
      id: 'parental', 
      label: t('parentalControl'),
      subTabs: [
          { id: 'parental_mode', label: t('parentalMode') },
          { id: 'url_limit', label: t('urlLimit') },
          { id: 'time_limit', label: t('timeLimit') }
      ]
    },
    { 
      id: 'firewall', 
      label: t('firewall'),
      subTabs: [
          { id: 'url_filter', label: t('urlFilter') },
          { id: 'dmz', label: t('dmz') },
          { id: 'port_forwarding', label: t('portForwarding') },
          { id: 'upnp', label: t('upnp') },
          { id: 'mac_filtering', label: t('macFiltering') },
          { id: 'port_filtering', label: t('portFiltering') },
          { id: 'ddos_protection', label: t('ddosProtection') }
      ]
    },
    { id: 'access_control', label: t('accessControl') },
    { 
      id: 'diagnosis', 
      label: t('diagnosis'),
      subTabs: [
          { id: 'ping', label: t('ping') },
          { id: 'trace', label: t('trace') }
      ]
    },
    { 
      id: 'system', 
      label: t('systemSettings'),
      subTabs: [
          { id: 'system_settings_main', label: t('systemSettings') },
          { id: 'change_password', label: t('changePassword') },
          { id: 'change_username', label: t('changeUsername') },
          { id: 'time_settings', label: t('timeSettings') },
          { id: 'system_upgrade', label: t('systemUpgrade') },
          { id: 'system_auto_upgrade', label: t('systemAutoUpgrade') },
          { id: 'fota_upgrade', label: t('fotaUpgrade') },
          { id: 'log_settings', label: t('logSettings') },
          { id: 'web_setting', label: t('webSetting') }
      ]
    },
    { id: 'clat', label: t('clat') },
  ];

  // State for Navigation - Default to 'network' as it is the first item
  const [activeSectionId, setActiveSectionId] = useState('network'); 
  const [activeSubTabId, setActiveSubTabId] = useState(''); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll Logic State
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const activeSection = menuItems.find(item => item.id === activeSectionId) || menuItems[0];
  
  // Initialize navigation state from location.state or default
  useEffect(() => {
    const state = location.state as { sectionId?: string; subTabId?: string } | null;
    
    if (state?.sectionId) {
        setActiveSectionId(state.sectionId);
        
        if (state.subTabId) {
            setActiveSubTabId(state.subTabId);
        } else {
             // If no specific subtab requested, default to the first one of the section
             const item = menuItems.find(i => i.id === state.sectionId);
             if (item?.subTabs?.length) {
                 setActiveSubTabId(item.subTabs[0].id);
             } else {
                 setActiveSubTabId('');
             }
        }
    } else {
        // Default initialization if no state provided
        if (activeSectionId === 'network' && !activeSubTabId) {
            setActiveSubTabId('apn_settings');
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]); 

  // Check scroll possibilities
  const checkScrollButtons = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setHasOverflow(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 0);
      // Use a small tolerance of 1px for floating point issues
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  // Re-check scroll state when tabs change
  useEffect(() => {
    // Small timeout to allow DOM to update
    const timer = setTimeout(() => {
        checkScrollButtons();
    }, 0);
    window.addEventListener('resize', checkScrollButtons);
    return () => {
        window.removeEventListener('resize', checkScrollButtons);
        clearTimeout(timer);
    };
  }, [activeSectionId, activeSection.subTabs]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
    // Close mobile menu
    setIsMobileMenuOpen(false);

    // Reset scroll position of the tabs
    if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollTo({ left: 0 });
    }
    // Scroll page to top
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
      // Dispatch based on active tab ID or section ID
      const targetId = activeSubTabId || activeSectionId;

      switch (targetId) {
          case 'apn_settings':
              return <ApnSettingsPage />;
          case 'multiple_apn':
              return <MultipleApnPage />;
          case 'network_mode':
              return <NetworkModePage />;
          case 'network_config':
              return <NetworkConfigPage />;
          case 'plmn_scan':
              return <PlmnScanPage />;
          case 'lock_band':
              return <LockBandPage />;
          case 'cell_locking':
              return <CellLockingPage />;
          case 'link_detection':
              return <LinkDetectionPage />;
          case 'vlan':
              return <VlanPage />;
          case 'device_info':
              return <DeviceInfoPage />;
          case 'network_info':
              return <NetworkInfoPage />;
          case 'sim_function':
              return <SimFunctionPage />;
          case 'sim_switching':
              return <SimSwitchingPage />;
          case 'display_solution':
              return <DisplaySolutionPage />;
          case 'national':
              return <UsageSettingsPage type="national" />;
          case 'international':
              return <UsageSettingsPage type="international" />;
          
          // Future cases can be added here, importing separate components for each page.
          // case 'wifi': return <WifiSettingsPage />;
          
          default:
              // Default Placeholder Layout
              return (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 border-2 border-dashed border-gray-100 rounded-[6px] bg-gray-50/50">
                    <p className="italic mb-3">Configuration panel for:</p>
                    <p className="font-bold text-black text-xl bg-white px-6 py-2 rounded-[6px] shadow-sm">
                        {activeSection.label}
                        {activeSubTabId && activeSection.subTabs ? ` > ${activeSection.subTabs.find(t => t.id === activeSubTabId)?.label}` : ''}
                    </p>
                </div>
              );
      }
  };

  if (!isLoggedIn) {
     return (
          <div className="w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-[6px]">
             <div className="text-center p-8">
                 <p className="mb-4 font-bold text-lg">{t('loginAsAdminMsg')}</p>
                 <button 
                    onClick={onOpenLogin}
                    className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 transition-colors rounded-[6px]"
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
      <div className="bg-white px-4 md:px-6 py-2 mb-4 shadow-sm border border-gray-200 flex items-center rounded-[6px] transition-all hover:shadow-md">
         <button onClick={() => navigate(-1)} className="me-4 text-gray-400 hover:text-orange transition-colors">
            <ChevronLeft size={28} strokeWidth={2.5} />
         </button>
         <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t('settings')}</span>
            <span className="font-bold text-black text-lg md:text-xl flex items-center flex-wrap">
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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-72 shrink-0 z-20">
             
             {/* Mobile Menu Toggle */}
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-full bg-white border border-gray-200 p-3 flex items-center justify-between rounded-[6px] shadow-sm font-bold text-black mb-2 hover:border-orange transition-colors"
             >
                <div className="flex items-center">
                    <Menu size={20} className="me-3 text-orange" />
                    <span className="uppercase text-sm tracking-wide">Menu</span>
                </div>
                <div className="flex items-center text-gray-500 font-normal">
                    <span className="me-2 text-xs truncate max-w-[150px]">{activeSection.label}</span>
                    {isMobileMenuOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
             </button>

             {/* Menu List - Hidden on mobile unless open */}
             <div className={`
                flex-col gap-2 
                ${isMobileMenuOpen ? 'flex' : 'hidden'} 
                lg:flex lg:gap-3
             `}>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleSectionClick(item.id)}
                        className={`
                            group flex items-center justify-between px-5 py-4 font-bold text-sm border-2 transition-all duration-200 rounded-[6px]
                            ${activeSectionId === item.id 
                                ? 'bg-black text-white border-black shadow-lg scale-[1.02] z-10' 
                                : 'bg-white text-gray-600 border-transparent hover:border-orange hover:text-orange hover:shadow-md hover:bg-orange/5'
                            }
                        `}
                    >
                        <span>{item.label}</span>
                        {/* Desktop Arrow */}
                        {activeSectionId === item.id && <ChevronRight size={18} className="animate-fade-in hidden lg:block" />}
                        {/* Mobile Active Indicator */}
                        {activeSectionId === item.id && <ChevronDown size={18} className="animate-fade-in lg:hidden" />}
                    </button>
                ))}
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0 w-full">
             {/* Sub Tabs (if any) */}
             {activeSection.subTabs && (
                 <div className="flex items-start mb-2 gap-2 group/tabs">
                     {/* Left Arrow */}
                     {hasOverflow && (
                         <button 
                            onClick={() => scrollTabs('left')}
                            disabled={!canScrollLeft}
                            className={`px-3 py-2.5 rounded-[6px] border-2 transition-all shrink-0 flex items-center justify-center
                                ${!canScrollLeft 
                                    ? 'bg-gray-50 text-gray-200 border-transparent cursor-not-allowed' 
                                    : 'bg-white text-gray-500 border-transparent hover:border-gray-300 hover:text-black cursor-pointer'
                                }
                            `}
                         >
                             <ChevronLeft size={20} strokeWidth={2.5} />
                         </button>
                     )}

                     {/* Scroll Container */}
                     <div 
                        ref={tabsContainerRef}
                        onScroll={checkScrollButtons}
                        className="flex-1 flex gap-2 overflow-x-auto pb-2 px-1 thin-scrollbar scroll-smooth"
                     >
                         {activeSection.subTabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveSubTabId(tab.id)}
                                className={`px-6 py-2.5 font-bold text-sm rounded-[6px] border-2 transition-all whitespace-nowrap shrink-0 ${
                                    activeSubTabId === tab.id
                                    ? 'bg-black text-white border-black shadow-md'
                                    : 'bg-white text-gray-500 border-transparent hover:border-gray-300 hover:text-black hover:bg-white'
                                }`}
                             >
                                {tab.label}
                             </button>
                         ))}
                     </div>

                     {/* Right Arrow */}
                     {hasOverflow && (
                         <button 
                            onClick={() => scrollTabs('right')}
                            disabled={!canScrollRight}
                            className={`px-3 py-2.5 rounded-[6px] border-2 transition-all shrink-0 flex items-center justify-center
                                ${!canScrollRight 
                                    ? 'bg-gray-50 text-gray-200 border-transparent cursor-not-allowed' 
                                    : 'bg-white text-gray-500 border-transparent hover:border-gray-300 hover:text-black cursor-pointer'
                                }
                            `}
                         >
                             <ChevronRight size={20} strokeWidth={2.5} />
                         </button>
                     )}
                 </div>
             )}

             {/* Main Content Box */}
             <div className="bg-white border border-gray-200 p-4 md:p-8 min-h-[500px] md:min-h-[600px] shadow-sm rounded-[6px] relative overflow-hidden transition-all hover:shadow-md">
                 {/* Decorative background element */}
                 <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-60 pointer-events-none"></div>
                 
                 <div className="relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-black pb-4 border-b border-gray-100">
                        {activeSection.label}
                        {activeSubTabId && activeSection.subTabs && (
                            <span className="text-gray-400 font-normal ms-2 text-base md:text-lg block md:inline mt-1 md:mt-0">
                                - {activeSection.subTabs.find(t => t.id === activeSubTabId)?.label}
                            </span>
                        )}
                    </h2>

                    {renderContent()}
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};
