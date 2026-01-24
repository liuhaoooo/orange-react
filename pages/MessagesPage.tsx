
import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Plus, CornerUpRight, Search, AlertTriangle, MessageSquare, User, Trash2, Reply } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { fetchSmsList, parseSmsList, SmsMessage, markSmsAsRead, deleteSms } from '../utils/api';
import { ConfirmModal } from '../components/ConfirmModal';
import { NewMessageModal } from '../components/NewMessageModal';
import { RedirectWarningModal, RedirectConfigModal } from '../components/RedirectMessagesModals';
import { useAlert } from '../utils/AlertContext';

interface MessagesPageProps {
  onOpenSettings: () => void;
}

type TabType = 'inbox' | 'sent' | 'draft';

export const MessagesPage: React.FC<MessagesPageProps> = ({ onOpenSettings }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isLoggedIn, globalData } = useGlobalState();
  const { showAlert } = useAlert();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [stats, setStats] = useState({
      total: 0,
      unread: 0,
      receiveFull: false,
      sendFull: false,
      draftFull: false
  });
  const [loading, setLoading] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Selection State
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  
  // Checkbox State for Bulk Actions (Stores Senders)
  const [checkedThreadSenders, setCheckedThreadSenders] = useState<string[]>([]);

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
      isOpen: boolean;
      ids: string[];
      sendersToUncheck?: string[]; 
      type: 'bulk' | 'thread' | 'single';
  }>({ isOpen: false, ids: [], type: 'single' });
  const [isDeleting, setIsDeleting] = useState(false);

  // New Message Modal State
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const [newMessageReceiver, setNewMessageReceiver] = useState('');
  
  // Redirect Messages Modal State
  const [isRedirectWarningOpen, setIsRedirectWarningOpen] = useState(false);
  const [isRedirectConfigOpen, setIsRedirectConfigOpen] = useState(false);

  const checkSmsReady = (): { ready: boolean; reason?: string } => {
      const s = globalData.connectionSettings;
      // If data isn't loaded yet, we can't be sure, but usually it is loaded by now if logged in
      if (!s) return { ready: false, reason: t('loginUnexpected') };

      if (s.sim_status !== '1') return { ready: false, reason: t('noSimAvailable') };
      if (s.lock_puk_flag === '1') return { ready: false, reason: t('pukCodeRequired') };
      if (s.lock_pin_flag === '1') return { ready: false, reason: t('pinCodeRequired') };
      if (s.sms_sw !== '1') return { ready: false, reason: "SMS function is disabled." };

      return { ready: true };
  };

  const handleSmsAction = (action: () => void) => {
    if (isLoggedIn) {
        const check = checkSmsReady();
        if (!check.ready) {
            showAlert(check.reason || '', 'warning', 'Warning');
            return;
        }
        action();
    } else {
        onOpenSettings();
    }
  };
  
  const openRedirectFlow = () => {
    setIsRedirectWarningOpen(true);
  };

  const handleWarningConfirm = () => {
    setIsRedirectWarningOpen(false);
    setIsRedirectConfigOpen(true);
  };

  const handleSettingsClick = () => {
    if (!isLoggedIn) {
        onOpenSettings();
        return;
    }
    // Navigate to Settings -> Messages
    navigate('/settings', { 
        state: { sectionId: 'messages' } 
    });
  };

  const getSubCmd = (tab: TabType) => {
    switch(tab) {
        case 'inbox': return 0;
        case 'sent': return 1;
        case 'draft': return 2;
        default: return 0;
    }
  };

  // Poll for messages
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    const loadMessages = async () => {
        try {
            const subcmd = getSubCmd(activeTab);
            const res = await fetchSmsList(1, subcmd);
            if (res && res.success) {
                const parsed = parseSmsList(res.sms_list);
                setMessages(parsed);
                setStats({
                    total: parseInt(res.sms_total || "0"),
                    unread: parseInt(res.sms_unread || "0"),
                    receiveFull: res.receive_full === '1',
                    sendFull: res.send_full === '1',
                    draftFull: res.draft_full === '1'
                });
            }
        } catch (error) {
            console.error("Failed to load messages page", error);
        }
    };

    if (isLoggedIn) {
        setLoading(true);
        loadMessages().finally(() => setLoading(false));
        intervalId = setInterval(loadMessages, 10000);
    } else {
        setMessages([]);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn, activeTab]);

  const isCurrentBoxFull = useMemo(() => {
    if (activeTab === 'inbox') return stats.receiveFull;
    if (activeTab === 'sent') return stats.sendFull;
    if (activeTab === 'draft') return stats.draftFull;
    return false;
  }, [activeTab, stats]);

  // Group Messages by Sender & Filter by Search
  const threads = useMemo(() => {
    const groups: Record<string, SmsMessage[]> = {};
    messages.forEach(msg => {
        const key = msg.sender || t('unknown');
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
    });

    let threadList = Object.entries(groups).map(([sender, msgs]) => {
        // Sort DESC for preview (newest first)
        const sortedDesc = [...msgs].sort((a, b) => a.date > b.date ? -1 : 1);
        return {
            sender,
            count: msgs.length,
            messages: sortedDesc,
            latest: sortedDesc[0],
            hasUnread: msgs.some(m => m.status === '0')
        };
    });

    // Apply Search Filter (only if query exists)
    if (searchQuery.trim()) {
        const lowerQ = searchQuery.toLowerCase();
        threadList = threadList.filter(t => t.sender.toLowerCase().includes(lowerQ));
    }

    return threadList.sort((a, b) => a.latest.date > b.latest.date ? -1 : 1); // Sort threads by latest message
  }, [messages, t, searchQuery]);

  // Selected Thread Data
  const activeThread = useMemo(() => {
      if (!selectedSender) return null;
      return threads.find(t => t.sender === selectedSender);
  }, [selectedSender, threads]);

  // Messages for the chat view (Sorted Ascending)
  const chatMessages = useMemo(() => {
      if (!activeThread) return [];
      return [...activeThread.messages].sort((a, b) => a.date > b.date ? 1 : -1);
  }, [activeThread]);

  // --- Deletion Logic ---

  const handleDelete = async (idsToDelete: string[]) => {
      if (idsToDelete.length === 0) return;

      const subcmd = getSubCmd(activeTab);
      
      // 1. Optimistic Update
      setMessages(prev => prev.filter(msg => !idsToDelete.includes(msg.id)));
      
      // Update stats roughly
      setStats(prev => ({
          ...prev,
          total: Math.max(0, prev.total - idsToDelete.length)
      }));

      // Check if we deleted the currently selected thread's messages
      if (activeThread) {
          const remainingInThread = activeThread.messages.filter(m => !idsToDelete.includes(m.id));
          if (remainingInThread.length === 0) {
              setSelectedSender(null);
          }
      }

      // 2. API Call
      try {
          await deleteSms(idsToDelete, subcmd);
      } catch (e) {
          console.error("Failed to delete messages", e);
      }
  };

  const promptDeleteThread = (sender: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const threadToDelete = threads.find(t => t.sender === sender);
      if (threadToDelete) {
          const ids = threadToDelete.messages.map(m => m.id);
          setDeleteModalState({
              isOpen: true,
              ids,
              sendersToUncheck: [sender],
              type: 'thread'
          });
      }
  };

  const promptDeleteBulk = () => {
      const idsToDelete: string[] = [];
      checkedThreadSenders.forEach(sender => {
          const thread = threads.find(t => t.sender === sender);
          if (thread) {
              thread.messages.forEach(m => idsToDelete.push(m.id));
          }
      });
      
      if (idsToDelete.length > 0) {
          setDeleteModalState({
              isOpen: true,
              ids: idsToDelete,
              type: 'bulk'
          });
      }
  };

  const promptDeleteSingle = (id: string) => {
      setDeleteModalState({
          isOpen: true,
          ids: [id],
          type: 'single'
      });
  };

  const confirmDelete = async () => {
      setIsDeleting(true);
      
      await handleDelete(deleteModalState.ids);
      
      // Cleanup Selections
      if (deleteModalState.type === 'bulk') {
          setCheckedThreadSenders([]);
      } else if (deleteModalState.sendersToUncheck) {
          setCheckedThreadSenders(prev => prev.filter(s => !deleteModalState.sendersToUncheck?.includes(s)));
      }

      setIsDeleting(false);
      setDeleteModalState(prev => ({ ...prev, isOpen: false }));
  };

  // --- Checkbox Logic ---

  const toggleThreadCheck = (sender: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setCheckedThreadSenders(prev => {
          if (prev.includes(sender)) return prev.filter(s => s !== sender);
          return [...prev, sender];
      });
  };

  const toggleSelectAll = () => {
      if (checkedThreadSenders.length === threads.length && threads.length > 0) {
          setCheckedThreadSenders([]);
      } else {
          setCheckedThreadSenders(threads.map(t => t.sender));
      }
  };


  // --- Read Logic ---
  
  const markThreadAsRead = async (sender: string) => {
    if (activeTab !== 'inbox') return;

    const targetMessages = messages.filter(m => (m.sender === sender || (!m.sender && sender === t('unknown'))) && m.status === '0');
    const unreadIds = targetMessages.map(m => m.id);

    if (unreadIds.length > 0) {
        setMessages(prev => prev.map(msg => 
            unreadIds.includes(msg.id) ? { ...msg, status: '1' } : msg
        ));

        setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - unreadIds.length)
        }));

        try {
            await markSmsAsRead(unreadIds);
        } catch (e) {
            console.error("Failed to mark messages as read", e);
        }
    }
  };

  const handleThreadSelect = (sender: string) => {
      setSelectedSender(sender);
      markThreadAsRead(sender);
  };

  useEffect(() => {
      setSelectedSender(null);
      setCheckedThreadSenders([]);
      setSearchQuery(''); // Reset search on tab change
  }, [activeTab]);

  useEffect(() => {
      if (location.state && location.state.sender) {
          setSelectedSender(location.state.sender);
      }
  }, [location.state]);

  useEffect(() => {
      if (selectedSender && messages.length > 0 && activeTab === 'inbox') {
          const hasUnread = messages.some(m => m.sender === selectedSender && m.status === '0');
          if (hasUnread) {
              markThreadAsRead(selectedSender);
          }
      }
  }, [selectedSender, messages, activeTab]);

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
    <>
      <div className="w-full bg-white shadow-sm border border-gray-200 pb-4">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 pb-2">
          <h1 className="text-3xl font-bold text-black mb-4 md:mb-0">{t('messages')}</h1>
          
          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
              <button 
                  onClick={handleSettingsClick}
                  className="bg-white border border-black px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                  <Settings size={16} className="me-2" />
                  {t('settings')}
              </button>
              <button 
                  onClick={() => handleSmsAction(openRedirectFlow)}
                  className="bg-black border border-black px-4 py-2 font-bold text-sm text-white flex items-center hover:bg-gray-900 transition-colors whitespace-nowrap"
              >
                  <CornerUpRight size={16} className="me-2" />
                  {t('redirectMessages')}
              </button>
              <button 
                  onClick={() => handleSmsAction(() => {
                      setNewMessageReceiver('');
                      setIsNewMessageModalOpen(true);
                  })}
                  className="bg-orange border border-orange px-4 py-2 font-bold text-sm text-black flex items-center hover:bg-orange-dark transition-colors whitespace-nowrap"
              >
                  <Plus size={16} className="me-2" />
                  {t('newMessage')}
              </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex border-b border-gray-200">
          {renderTab('inbox', t('inbox'), activeTab === 'inbox' ? stats.unread : 0)}
          {renderTab('sent', t('sent'))}
          {renderTab('draft', t('draft'))}
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col lg:flex-row h-[600px]">
          
          {/* Left Column: List */}
          <div className="w-full lg:w-[420px] shrink-0 border-r border-gray-200 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                      <div className="font-bold text-sm">
                          {activeTab === 'inbox' 
                            ? t('msgStats', stats.total, stats.unread) 
                            : activeTab === 'sent' 
                              ? t('sentStats', stats.total)
                              : t('draftStats', stats.total)
                          }
                      </div>
                      {isCurrentBoxFull && (
                          <div className="flex items-center text-red-500 text-xs font-bold animate-pulse">
                              <AlertTriangle size={14} className="me-1" />
                              {t('storageFull')}
                          </div>
                      )}
                  </div>
                  
                  <div className="relative mb-4">
                      <input 
                          type="text" 
                          placeholder={t('search')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-orange text-black rounded-sm"
                      />
                      <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  
                  {/* Header Action Row: Select All + Delete */}
                  <div className="flex items-center justify-between h-6">
                      <div className="flex items-center">
                          <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange cursor-pointer" 
                              checked={threads.length > 0 && checkedThreadSenders.length === threads.length}
                              onChange={toggleSelectAll}
                          />
                          <span className="ms-2 text-sm font-bold text-black">{t('selectAll')}</span>
                      </div>
                      {checkedThreadSenders.length > 0 && (
                          <button 
                              onClick={promptDeleteBulk}
                              className="text-black hover:text-red-600 transition-colors"
                              title="Delete Selected"
                          >
                              <Trash2 size={18} />
                          </button>
                      )}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                  {threads.length > 0 ? (
                      threads.map((thread) => (
                          <div 
                              key={thread.sender} 
                              onClick={() => handleThreadSelect(thread.sender)}
                              className={`group/item p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex items-start ${selectedSender === thread.sender ? 'bg-orange/10 border-s-4 border-s-orange' : 'border-s-4 border-s-transparent'}`}
                          >
                              <div className="pt-1 pe-3" onClick={(e) => toggleThreadCheck(thread.sender, e)}>
                                  <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange cursor-pointer" 
                                      checked={checkedThreadSenders.includes(thread.sender)}
                                      onChange={(e) => { e.stopPropagation(); }}
                                  />
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                      <div className="font-bold text-black text-sm mb-1 truncate pe-2" title={thread.sender}>{thread.sender}</div>
                                      <div className="flex space-x-2 items-center shrink-0">
                                          {/* Delete Icon on Hover */}
                                          <button 
                                              onClick={(e) => promptDeleteThread(thread.sender, e)}
                                              className="invisible group-hover/item:visible text-gray-400 hover:text-red-600 transition-colors"
                                              title="Delete Thread"
                                          >
                                              <Trash2 size={14} />
                                          </button>

                                          {thread.count > 1 && (
                                              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded-full font-bold h-4 flex items-center">{thread.count}</span>
                                          )}
                                          {thread.hasUnread && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
                                      </div>
                                  </div>
                                  <div className="flex justify-between items-baseline">
                                      <div className="text-sm text-gray-600 truncate flex-1 pe-2">{thread.latest.content}</div>
                                      <div className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{thread.latest.date.split(' ')[0]}</div>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="p-8 text-center text-gray-400 italic">
                          {searchQuery ? t('noData') : t('noData')}
                      </div>
                  )}
              </div>
          </div>

          {/* Right Column: Chat View or Placeholder */}
          <div className="flex-1 flex flex-col h-full bg-[#f8f9fa]">
              {activeThread ? (
                  <>
                      {/* Chat Header */}
                      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm shrink-0">
                          <div className="flex items-center">
                              <div className="w-10 h-10 bg-orange/20 rounded-full flex items-center justify-center text-orange font-bold me-3">
                                  <User size={20} />
                              </div>
                              <div>
                                  <div className="font-bold text-black text-sm">{activeThread.sender}</div>
                                  <div className="text-xs text-gray-500">{activeThread.count} {t('messages')}</div>
                              </div>
                          </div>
                          
                          {/* Reply Button */}
                          <button 
                            onClick={() => handleSmsAction(() => {
                                setNewMessageReceiver(activeThread.sender);
                                setIsNewMessageModalOpen(true);
                            })}
                            className="p-2 text-gray-400 hover:text-orange hover:bg-orange/10 rounded-full transition-colors"
                            title={t('reply')}
                          >
                            <Reply size={20} />
                          </button>
                      </div>

                      {/* Messages List */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          {chatMessages.map((msg) => (
                              <div key={msg.id} className={`flex flex-col group/msg ${activeTab === 'sent' ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center max-w-[90%]">
                                      {/* Delete Button (Left side for Sent) */}
                                      {activeTab === 'sent' && (
                                          <button 
                                              onClick={() => promptDeleteSingle(msg.id)}
                                              className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-2 text-gray-300 hover:text-red-500"
                                              title="Delete Message"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      )}

                                      <div className={`p-3 rounded-lg shadow-sm text-sm break-words ${activeTab === 'sent' ? 'bg-[#ffedcc] text-black rounded-tr-none border border-orange/20' : 'bg-white text-black rounded-tl-none border border-gray-200'}`}>
                                          {msg.content}
                                      </div>

                                      {/* Delete Button (Right side for Inbox) */}
                                      {activeTab !== 'sent' && (
                                          <button 
                                              onClick={() => promptDeleteSingle(msg.id)}
                                              className="opacity-0 group-hover/msg:opacity-100 transition-opacity p-2 text-gray-300 hover:text-red-500"
                                              title="Delete Message"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                      )}
                                  </div>
                                  
                                  <div className="text-[10px] text-gray-400 mt-1 px-1">
                                      {msg.date}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 bg-white">
                      {/* Illustration */}
                      <div className="mb-6 relative w-64 h-48">
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
              )}
          </div>
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
      
      <NewMessageModal 
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        initialReceiver={newMessageReceiver}
        isSendFull={stats.sendFull}
        isDraftFull={stats.draftFull}
      />

      <RedirectWarningModal 
        isOpen={isRedirectWarningOpen} 
        onClose={() => setIsRedirectWarningOpen(false)} 
        onConfirm={handleWarningConfirm} 
      />

      <RedirectConfigModal 
        isOpen={isRedirectConfigOpen} 
        onClose={() => setIsRedirectConfigOpen(false)} 
      />
    </>
  );
};
