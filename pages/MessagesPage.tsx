
import React, { useState } from 'react';
import { Settings, Plus, CornerUpRight, Search, AlertTriangle, MessageSquare } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';

interface MessagesPageProps {
  onOpenSettings: () => void;
}

type TabType = 'inbox' | 'sent' | 'draft';

const mockMessages = [
  { id: 1, sender: '0624681012', date: '2025/07/31 17:37:12', content: 'content test...', isNew: true, hasAlert: false },
  { id: 2, sender: '06987654321', date: '2025/07/31 10:00:11', content: 'content test2', isNew: false, hasAlert: true },
  { id: 3, sender: '06987654200', date: '2025/07/30 22:19:00', content: '<img onerror=alert(3)/><p>...', isNew: true, hasAlert: true },
];

export const MessagesPage: React.FC<MessagesPageProps> = ({ onOpenSettings }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();
  const [activeTab, setActiveTab] = useState<TabType>('inbox');

  const handleAuthAction = (action: () => void) => {
    if (isLoggedIn) {
        action();
    } else {
        onOpenSettings();
    }
  };

  // Login Check
  if (!isLoggedIn) {
      return (
          <div className="w-full h-[500px] flex items-center justify-center bg-white border border-gray-200 shadow-sm">
             <div className="text-center p-8">
                 <p className="mb-4 font-bold text-lg">{t('loginAsAdminMsg')}</p>
                 <button 
                    onClick={onOpenSettings}
                    className="bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 transition-colors"
                 >
                    {t('loginAsAdminBtn')}
                 </button>
             </div>
          </div>
      )
  }

  const renderTab = (tab: TabType, label: string, count?: number) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`px-1 py-3 me-8 font-bold text-sm border-b-4 transition-colors relative flex items-center ${
          isActive 
            ? 'text-orange border-orange' 
            : 'text-black border-transparent hover:border-gray-200'
        }`}
      >
        {label}
        {count !== undefined && count > 0 && (
            <span className="bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center ms-2 leading-none">
                {count}
            </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full bg-white shadow-sm border border-gray-200 pb-4">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 pb-2">
        <h1 className="text-3xl font-bold text-black mb-4 md:mb-0">{t('messages')}</h1>
        
        <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
             <button 
                onClick={onOpenSettings}
                className="bg-white border border-black px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-gray-50 transition-colors whitespace-nowrap"
             >
                <Settings size={16} className="me-2" />
                {t('settings')}
             </button>
             <button 
                onClick={() => handleAuthAction(() => console.log('Redirect'))}
                className="bg-black border border-black px-4 py-2 font-bold text-sm text-white flex items-center hover:bg-gray-900 transition-colors whitespace-nowrap"
             >
                <CornerUpRight size={16} className="me-2" />
                {t('redirectMessages')}
             </button>
             <button 
                onClick={() => handleAuthAction(() => console.log('New'))}
                className="bg-orange border border-orange px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-orange-dark transition-colors whitespace-nowrap"
             >
                <Plus size={16} className="me-2" />
                {t('newMessage')}
             </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 flex border-b border-gray-200">
         {renderTab('inbox', t('inbox'), 2)}
         {renderTab('sent', t('sent'))}
         {renderTab('draft', t('draft'))}
      </div>

      {/* Main Content Split */}
      <div className="flex flex-col lg:flex-row h-[600px]">
         
         {/* Left Column: List */}
         <div className="w-full lg:w-[420px] shrink-0 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="font-bold text-sm mb-4">{t('msgStats', 3, 2)}</div>
                <div className="relative mb-4">
                    <input 
                        type="text" 
                        placeholder={t('search')}
                        className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-orange text-black rounded-sm"
                    />
                    <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <div className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange" />
                    <span className="ms-2 text-sm font-bold text-black">{t('selectAll')}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {mockMessages.map((msg) => (
                    <div key={msg.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex items-start">
                         <div className="pt-1 pe-3">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange" />
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start">
                                 <div className="font-bold text-black text-sm mb-1">{msg.sender}</div>
                                 <div className="flex space-x-1 items-center">
                                    {msg.hasAlert && <AlertTriangle size={14} className="text-yellow-500 fill-yellow-500" />}
                                    {msg.isNew && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                                 </div>
                             </div>
                             <div className="text-xs text-gray-400 mb-1">{msg.date}</div>
                             <div className="text-sm text-gray-600 truncate">{msg.content}</div>
                         </div>
                    </div>
                ))}
            </div>
         </div>

         {/* Right Column: Details/Placeholder */}
         <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
             {/* Illustration */}
             <div className="mb-6 relative w-64 h-48">
                {/* Generic placeholder illustration composed of CSS/SVG elements trying to mimic the style */}
                 <div className="flex justify-center items-end space-x-4 h-full">
                     <MessageSquare className="w-24 h-24 text-orange fill-orange opacity-90 transform -scale-x-100" />
                     <MessageSquare className="w-24 h-24 text-black fill-black opacity-90" />
                 </div>
                 {/* Decorative elements */}
                 <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-orange rotate-45"></div>
                 <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-black rounded-full"></div>
                 <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange rounded-full"></div>
             </div>
             
             <p className="text-black text-sm">{t('selectMsgToRead')}</p>
         </div>

      </div>
    </div>
  );
};
