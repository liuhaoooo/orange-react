import React, { useState } from 'react';
import { Card, CardHeader } from './UIComponents';
import { Inbox, ChevronLeft, ChevronRight, Send, FileText } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';

type TabType = 'inbox' | 'sent' | 'draft';

export const MessagesCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const { t } = useLanguage();

  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`flex-1 py-3 border-b-2 transition-colors ${
          isActive 
            ? 'text-orange border-orange' 
            : 'text-black border-transparent hover:bg-gray-50'
        }`}
      >
        {label}
      </button>
    );
  };

  const getIcon = () => {
    switch (activeTab) {
      case 'inbox': return <Inbox className="w-12 h-12 text-gray-300" />;
      case 'sent': return <Send className="w-12 h-12 text-gray-300" />;
      case 'draft': return <FileText className="w-12 h-12 text-gray-300" />;
    }
  };

  const getMessageText = () => {
    switch (activeTab) {
      case 'inbox': return t('msgStats', 0, 0);
      case 'sent': return t('sentStats', 0);
      case 'draft': return t('draftStats', 0);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader title={t('messages')} />
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 text-sm font-bold bg-white cursor-pointer">
        {renderTabButton('inbox', t('inbox'))}
        {renderTabButton('sent', t('sent'))}
        {renderTabButton('draft', t('draft'))}
      </div>

      <div className="p-3 border-b border-gray-200 text-sm font-bold text-black">
        {getMessageText()}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
         <div className="bg-gray-100 p-4 rounded-lg mb-2">
            {getIcon()}
         </div>
         <span className="text-black text-sm">{t('noData')}</span>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center py-2 bg-gray-50 border-t border-gray-200">
        <button className="p-1 text-gray-400 hover:text-black transform rtl:rotate-180"><ChevronLeft size={16} /></button>
        <span className="bg-black text-white text-xs px-2 py-0.5 mx-2">1</span>
        <button className="p-1 text-gray-400 hover:text-black transform rtl:rotate-180"><ChevronRight size={16} /></button>
      </div>

      <div className="p-4">
        <button className="w-full border border-black py-2 text-sm font-bold hover:bg-gray-100 transition-colors text-black">
          {t('redirectMessages')}
        </button>
      </div>
    </Card>
  );
};