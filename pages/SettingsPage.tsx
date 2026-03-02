
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from '../utils/GlobalStateContext';
import { ChevronLeft, ChevronRight, Menu, ChevronUp, ChevronDown, Search, X } from 'lucide-react';
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
import { ImsSettingsPage } from './settings/ImsSettingsPage';
import { MacFiltering24Page } from './settings/MacFiltering24Page';
import { WpsSettings24Page } from './settings/WpsSettings24Page';
import { AdvSettings24Page } from './settings/AdvSettings24Page';
import { DhcpSettingsPage } from './settings/DhcpSettingsPage';
import { IpAddressReservationPage } from './settings/IpAddressReservationPage';
import { MultipleDhcpPage } from './settings/MultipleDhcpPage';
import { SystemUpgradePage } from './settings/SystemUpgradePage';
import { RoutingPage } from './settings/RoutingPage';
import { VpnPage } from './settings/VpnPage';
import { GreSettingsPage } from './settings/GreSettingsPage';
import { IpsecVpnPage } from './settings/IpsecVpnPage';
import { IpsecStatusPage } from './settings/IpsecStatusPage';
import { IpPassthroughPage } from './settings/IpPassthroughPage';
import { MeshBasicConfigPage } from './settings/MeshBasicConfigPage';
import { TopologyDiagramPage } from './settings/TopologyDiagramPage';
import { UrlFilterPage } from './settings/UrlFilterPage';
import { GlobalMacFilteringPage } from './settings/GlobalMacFilteringPage';
import { PortFilteringPage } from './settings/PortFilteringPage';
import { DmzPage } from './settings/DmzPage';
import { UpnpPage } from './settings/UpnpPage';
import { DdosProtectionPage } from './settings/DdosProtectionPage';
import { PortForwardingPage } from './settings/PortForwardingPage';
import { ParentalModePage } from './settings/ParentalModePage';
import { UrlLimitPage } from './settings/UrlLimitPage';
import { TimeLimitPage } from './settings/TimeLimitPage';

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
      id: 'info', 
      label: t('info') || 'Info',
      subTabs: [
          { id: 'device_info', label: t('deviceInfo') },
          { id: 'network_info', label: t('networkInfo') }
      ]
    },
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
          { id: 'link_detection', label: t('linkDetection') }
      ]
    },
    { 
      id: 'wifi', 
      label: t('WLAN') || 'WLAN',
      subTabs: [
          { id: 'wifi_mac_filter', label: t('macFiltering') },
          { id: 'wifi_wps', label: t('wpsSettings') },
          { id: 'wifi_advanced', label: t('wifiAdvancedSettings') },
          { id: 'basic_config', label: t('basicConfig') },
          { id: 'topology_diagram', label: t('topologyDiagram') }
      ]
    },
    { 
      id: 'usage', 
      label: t('usage'), 
      subTabs: [
        { id: 'national', label: t('national') },
        { id: 'international', label: t('international') }
      ] 
    },
    { 
      id: 'sim', 
      label: t('simFunction') || 'SIM',
      subTabs: [
          { id: 'sim_function', label: t('simFunction') },
          { id: 'sim_switching', label: t('simCardSwitching') }
      ]
    },
    { 
      id: 'device', 
      label: t('device') || 'Device',
      subTabs: [
          { id: 'dhcp_settings', label: t('dhcp') },
          { id: 'ip_reservation', label: t('ipAddressReservation') },
          { id: 'multiple_dhcp', label: t('multipleDhcp') },
          { id: 'vlan', label: t('vlan') }
      ]
    },
    { 
      id: 'security', 
      label: t('security') || 'Security',
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
    { 
      id: 'parental_control', 
      label: t('parentalControl') || 'Parental Control',
      subTabs: [
          { id: 'parental_mode', label: t('parentalMode') },
          { id: 'url_limit', label: t('urlLimit') },
          { id: 'time_limit', label: t('timeLimit') }
      ]
    },
    { 
      id: 'advanced_applications', 
      label: t('advancedApplications') || 'Advanced Applications',
      subTabs: [
          { id: 'vpn_main', label: t('vpn') },
          { id: 'gre_settings', label: t('greSettings') },
          { id: 'ipsec_vpn', label: t('ipsecVpn') },
          { id: 'ipsec_status', label: t('ipsecStatus') },
          { id: 'ip_passthrough_main', label: t('ipPassthrough') },
          { id: 'multiple_ip_passthrough', label: t('multipleIpPassthrough') }
      ]
    },
    { 
      id: 'upgrade', 
      label: t('upgrade') || 'Upgrade',
      subTabs: [
          { id: 'system_upgrade', label: t('systemUpgrade') },
          { id: 'system_auto_upgrade', label: t('systemAutoUpgrade') },
          { id: 'fota_upgrade', label: t('fotaUpgrade') }
      ]
    },
    { 
      id: 'system', 
      label: t('systemManagement') || 'System Management',
      subTabs: [
          { id: 'system_settings_main', label: t('systemSettings') },
          { id: 'change_password', label: t('changePassword') },
          { id: 'change_username', label: t('changeUsername') },
          { id: 'time_settings', label: t('timeSettings') },
          { id: 'log_settings', label: t('logSettings') },
          { id: 'web_setting', label: t('webSetting') },
          { id: 'ping', label: t('ping') },
          { id: 'trace', label: t('trace') }
      ]
    }
  ];

  // State for Navigation - Default to 'info' as it is the first item
  const [activeSectionId, setActiveSectionId] = useState('info'); 
  const [activeSubTabId, setActiveSubTabId] = useState(''); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Scroll Logic State
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null); // Ref for the entire search component

  const activeSection = menuItems.find(item => item.id === activeSectionId) || menuItems[0];
  
  // URL Persistence Logic
  // 1. On Mount/URL Change: Parse Query Params and update state
  useEffect(() => {
    // Check URL params first
    const params = new URLSearchParams(location.search);
    const sectionParam = params.get('section');
    const subParam = params.get('sub');

    // Check location state (from direct navigation within app)
    const state = location.state as { sectionId?: string; subTabId?: string } | null;

    if (sectionParam) {
        // Priority 1: URL Query Params (supports refresh)
        setActiveSectionId(sectionParam);
        
        // Ensure subTab matches the section
        const sectionItem = menuItems.find(i => i.id === sectionParam);
        if (subParam) {
            setActiveSubTabId(subParam);
        } else if (sectionItem?.subTabs?.length) {
            // Default to first subtab if section has tabs but none specified
            setActiveSubTabId(sectionItem.subTabs[0].id);
        } else {
            setActiveSubTabId('');
        }
    } else if (state?.sectionId) {
        // Priority 2: Navigation State (legacy/internal links)
        // We should probably sync this to URL immediately
        setActiveSectionId(state.sectionId);
        
        if (state.subTabId) {
            setActiveSubTabId(state.subTabId);
            // Update URL to match
            navigate(`/settings?section=${state.sectionId}&sub=${state.subTabId}`, { replace: true });
        } else {
             const item = menuItems.find(i => i.id === state.sectionId);
             if (item?.subTabs?.length) {
                 const defSub = item.subTabs[0].id;
                 setActiveSubTabId(defSub);
                 navigate(`/settings?section=${state.sectionId}&sub=${defSub}`, { replace: true });
             } else {
                 setActiveSubTabId('');
                 navigate(`/settings?section=${state.sectionId}`, { replace: true });
             }
        }
    } else {
        // Priority 3: Default (Info -> Device Info)
        if (activeSectionId === 'info' && !activeSubTabId) {
            setActiveSubTabId('device_info');
            // Sync URL
            navigate(`/settings?section=info&sub=device_info`, { replace: true });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.state]); 

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

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Check if the click is outside the entire search container
        if (isSearchOpen && 
            searchContainerRef.current && 
            !searchContainerRef.current.contains(event.target as Node)
        ) {
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle Section Click - Updates URL, which triggers Effect to update state
  const handleSectionClick = (id: string) => {
    // Reset subtab to first one if available
    const item = menuItems.find(i => i.id === id);
    let subId = '';
    if (item && item.subTabs && item.subTabs.length > 0) {
      subId = item.subTabs[0].id;
    } 
    
    // Navigate updates the URL, triggering the useEffect
    const url = subId ? `/settings?section=${id}&sub=${subId}` : `/settings?section=${id}`;
    navigate(url);

    // Close mobile menu
    setIsMobileMenuOpen(false);

    // Reset scroll position of the tabs
    if (tabsContainerRef.current) {
        tabsContainerRef.current.scrollTo({ left: 0 });
    }
    // Scroll page to top
    window.scrollTo(0, 0);
  };

  const handleSubTabClick = (subId: string) => {
      navigate(`/settings?section=${activeSectionId}&sub=${subId}`);
  };

  const handleSearchResultClick = (sectionId: string, subTabId?: string) => {
      // Close search interface
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
      
      // Perform Navigation
      if (subTabId) {
          navigate(`/settings?section=${sectionId}&sub=${subTabId}`);
      } else {
          // If no specific sub-tab is in the result (only section matched), 
          // let handleSectionClick determine the default sub-tab
          handleSectionClick(sectionId);
      }
  };

  // Filter menu items for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: { sectionId: string; subTabId?: string; label: string; path: string }[] = [];

    menuItems.forEach(section => {
        // Check main section matches
        if (section.label.toLowerCase().includes(query)) {
            results.push({
                sectionId: section.id,
                subTabId: section.subTabs?.[0]?.id,
                label: section.label,
                path: section.label
            });
        }
        
        // Check sub-tabs
        if (section.subTabs) {
            section.subTabs.forEach(sub => {
                if (sub.label.toLowerCase().includes(query)) {
                    // Avoid duplicate if both section and subtab match? 
                    // Usually useful to show specific subtab match even if section matched.
                    results.push({
                        sectionId: section.id,
                        subTabId: sub.id,
                        label: sub.label,
                        path: `${section.label} > ${sub.label}`
                    });
                }
            });
        }
    });
    
    return results;
  }, [searchQuery, menuItems]);


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
          case 'ims':
              return <ImsSettingsPage />;
          // Updated cases for unified Wi-Fi pages
          case 'wifi_advanced':
              return <AdvSettings24Page />; // This now exports WifiAdvancedSettingsPage
          case 'wifi_wps':
              return <WpsSettings24Page />; // This now exports WpsSettingsPage
          case 'wifi_mac_filter':
              return <MacFiltering24Page />; // This now exports MacFilteringPage
          case 'dhcp_settings':
              return <DhcpSettingsPage />;
          case 'ip_reservation':
              return <IpAddressReservationPage />;
          case 'multiple_dhcp':
              return <MultipleDhcpPage />;
          case 'routing':
              return <RoutingPage />;
          case 'system_upgrade':
              return <SystemUpgradePage />;
          case 'basic_config':
              return <MeshBasicConfigPage />;
          case 'topology_diagram':
              return <TopologyDiagramPage />;
          case 'vpn_main':
              return <VpnPage />;
          case 'gre_settings':
              return <GreSettingsPage />;
          case 'ipsec_vpn':
              return <IpsecVpnPage />;
          case 'ipsec_status':
              return <IpsecStatusPage />;
          case 'ip_passthrough_main':
              return <IpPassthroughPage />;
          case 'url_filter':
              return <UrlFilterPage />;
          case 'mac_filtering':
              return <GlobalMacFilteringPage />;
          case 'port_filtering':
              return <PortFilteringPage />;
          case 'dmz':
              return <DmzPage />;
          case 'upnp':
              return <UpnpPage />;
          case 'ddos_protection':
              return <DdosProtectionPage />;
          case 'port_forwarding':
              return <PortForwardingPage />;
          case 'parental_mode':
              return <ParentalModePage />;
          case 'url_limit':
              return <UrlLimitPage />;
          case 'time_limit':
              return <TimeLimitPage />;
          
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
      <div className="bg-white px-4 md:px-6 py-2 mb-4 shadow-sm border border-gray-200 flex items-center rounded-[6px] transition-all hover:shadow-md relative">
         <button onClick={() => navigate(-1)} className="me-4 text-gray-400 hover:text-orange transition-colors shrink-0">
            <ChevronLeft size={28} strokeWidth={2.5} />
         </button>
         <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{t('settings')}</span>
            <span className="font-bold text-black text-lg md:text-xl flex items-center flex-wrap truncate">
                {activeSection.label} 
                {activeSubTabId && activeSection.subTabs && (
                    <>
                        <span className="mx-2 text-gray-300">/</span>
                        <span className="text-orange whitespace-nowrap">{activeSection.subTabs.find(t => t.id === activeSubTabId)?.label}</span>
                    </>
                )}
            </span>
         </div>
         
         {/* Search Box */}
         <div className="ms-auto relative" ref={searchContainerRef}>
             <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64' : 'w-10'}`}>
                {isSearchOpen ? (
                    <div className="relative w-full">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search')}
                            className="w-full border border-gray-300 rounded-full py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:border-orange bg-gray-50 text-black"
                            autoFocus
                        />
                        <button 
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black search-toggle-btn"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={() => setIsSearchOpen(true)}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-orange transition-colors search-toggle-btn"
                        title={t('search')}
                    >
                        <Search size={20} />
                    </button>
                )}
             </div>

             {/* Search Dropdown */}
             {isSearchOpen && searchQuery && (
                 <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-md overflow-hidden z-50 max-h-60 overflow-y-auto animate-fade-in">
                     {searchResults.length > 0 ? (
                         searchResults.map((res, idx) => (
                             <button
                                 key={idx}
                                 onClick={() => handleSearchResultClick(res.sectionId, res.subTabId)}
                                 className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange/5 hover:text-orange border-b border-gray-50 last:border-0 transition-colors"
                             >
                                 <div className="font-bold text-black">{res.label}</div>
                                 <div className="text-xs text-gray-400 mt-0.5">{res.path}</div>
                             </button>
                         ))
                     ) : (
                         <div className="px-4 py-3 text-sm text-gray-500 text-center italic">{t('noData')}</div>
                     )}
                 </div>
             )}
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
                        className="flex-1 flex gap-2 overflow-x-auto pb-2 pr-1 thin-scrollbar scroll-smooth"
                     >
                         {activeSection.subTabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => handleSubTabClick(tab.id)}
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
