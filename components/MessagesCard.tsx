
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader } from './UIComponents';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSmsList, parseSmsList, SmsMessage } from '../utils/api';

interface MessagesCardProps {
  onOpenLogin: () => void;
}

export const MessagesCard: React.FC<MessagesCardProps> = ({ onOpenLogin }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [totalCount, setTotalCount] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const loadMessages = async () => {
        try {
            const res = await fetchSmsList(1, 0); // Fetch Inbox
            if (res && res.success) {
                const parsed = parseSmsList(res.sms_list);
                setMessages(parsed);
                // Updated to show total count instead of unread count
                setTotalCount(res.sms_total || "0");
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        }
    };

    if (isLoggedIn) {
        loadMessages(); // Initial load
        intervalId = setInterval(loadMessages, 10000); // Refresh every 10s
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  // Group Messages by Sender
  const threads = useMemo(() => {
    const groups: Record<string, SmsMessage[]> = {};
    messages.forEach(msg => {
        const key = msg.sender || t('unknown');
        if (!groups[key]) groups[key] = [];
        groups[key].push(msg);
    });

    return Object.entries(groups).map(([sender, msgs]) => {
        // Sort DESC for preview (newest first)
        const sortedDesc = [...msgs].sort((a, b) => a.date > b.date ? -1 : 1);
        return {
            sender,
            count: msgs.length,
            latest: sortedDesc[0],
            hasUnread: msgs.some(m => m.status === '0')
        };
    }).sort((a, b) => a.latest.date > b.latest.date ? -1 : 1); // Sort threads by latest message
  }, [messages, t]);


  // State: Not Logged In
  if (!isLoggedIn) {
    return (
      <Card className="h-full">
        <CardHeader title={t('messages')} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-10">
           {/* Graphics: Two Bubbles */}
           <div className="relative w-full h-32 flex justify-center items-center">
             {/* Black bubble on left */}
             <div className="absolute left-1/4 sm:left-1/3 top-0 transform translate-y-4">
               <MessageSquare 
                  className="w-24 h-24 text-black fill-black transform -scale-x-100" 
                  strokeWidth={1}
                />
                <div className="absolute top-[30%] left-[20%] w-[60%] h-[10%] bg-white/30 rounded-full"></div>
                <div className="absolute top-[55%] left-[20%] w-[40%] h-[10%] bg-white/30 rounded-full"></div>
             </div>
             
             {/* Orange bubble on right */}
             <div className="absolute right-1/4 sm:right-1/3 bottom-0 transform -translate-y-2">
                <MessageSquare 
                  className="w-24 h-24 text-orange fill-orange" 
                  strokeWidth={1}
                />
                <div className="absolute top-[30%] left-[20%] w-[60%] h-[10%] bg-white/30 rounded-full"></div>
                <div className="absolute top-[55%] left-[20%] w-[40%] h-[10%] bg-white/30 rounded-full"></div>
             </div>
           </div>

           <div className="text-center w-full px-4 mt-8">
             <p className="text-black mb-8 text-base leading-tight">
               {t('loginAsAdminMsg')}
             </p>
             <button
               onClick={onOpenLogin}
               className="border border-black px-8 py-2.5 font-bold text-base text-black hover:bg-gray-100 transition-colors"
             >
               {t('loginAsAdminBtn')}
             </button>
           </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 pt-5 bg-white mt-auto shrink-0">
            <Link 
                to="/messages"
                className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
            >
                {t('viewMessages')}
            </Link>
        </div>
      </Card>
    );
  }

  // State: Logged In
  return (
    <Card className="flex flex-col h-full">
      <CardHeader title={t('messages')} />
      
      {/* Sub Header: Inbox - Added shrink-0 to prevent compression */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-white shrink-0">
          <span className="font-bold text-xl text-black me-3">{t('inbox')}</span>
          <span className="bg-[#4169e1] text-white text-sm font-bold h-7 w-7 flex items-center justify-center rounded-full">
             {totalCount}
          </span>
      </div>

      {/* List - Added overflow-y-auto to enable scrolling */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-white">
          {threads.length > 0 ? (
              threads.map((thread) => (
                  <div 
                    key={thread.sender} 
                    className="p-5 px-6 border-b border-gray-200 flex justify-between items-start shrink-0 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate('/messages', { state: { sender: thread.sender } })}
                  >
                      <div className="flex-1 min-w-0 pe-4">
                          <div className="flex justify-between items-baseline mb-1">
                              <div className="font-bold text-black text-base truncate pe-2">{thread.sender}</div>
                              <div className="text-gray-400 text-xs shrink-0 whitespace-nowrap">{thread.latest.date.split(' ')[0]}</div>
                          </div>
                          <div className="text-gray-500 text-base mt-0 truncate font-normal">{thread.latest.content}</div>
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0 mt-1">
                          {thread.count > 1 && (
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded-full font-bold h-4 flex items-center justify-center">
                                  {thread.count}
                              </span>
                          )}
                          {thread.hasUnread && <div className="w-3.5 h-3.5 bg-[#4169e1] rounded-full"></div>}
                      </div>
                  </div>
              ))
          ) : (
              <div className="p-8 text-center text-gray-400 italic">
                  {t('noData')}
              </div>
          )}
      </div>

      {/* Footer - Added shrink-0 */}
      <div className="p-6 pt-5 bg-white mt-auto shrink-0">
        <Link 
            to="/messages"
            className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2.5 px-8 text-base transition-colors rounded-none"
        >
          {t('viewMessages')}
        </Link>
      </div>
    </Card>
  );
};
