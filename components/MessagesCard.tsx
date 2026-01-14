
import React from 'react';
import { Card, CardHeader } from './UIComponents';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../utils/i18nContext';
import { useGlobalState } from '../utils/GlobalStateContext';
import { Link } from 'react-router-dom';

interface MessagesCardProps {
  onOpenLogin: () => void;
}

export const MessagesCard: React.FC<MessagesCardProps> = ({ onOpenLogin }) => {
  const { t } = useLanguage();
  const { isLoggedIn } = useGlobalState();

  const messages = [
    { id: 1, sender: '0624681012', date: '2025/07/31 17:37:12', content: 'content test...', isNew: true, hasAlert: false },
    { id: 2, sender: '06987654321', date: '2025/07/31 10:00:11', content: 'content test2', isNew: false, hasAlert: true },
    { id: 3, sender: '06987654200', date: '2025/07/30 22:19:00', content: 'Suspicious link detected in message body...', isNew: true, hasAlert: true },
  ];

  // State: Not Logged In
  if (!isLoggedIn) {
    return (
      <Card className="h-full">
        <CardHeader title={t('messages')} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
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
             <p className="text-black mb-6 text-sm sm:text-base leading-tight">
               {t('loginAsAdminMsg')}
             </p>
             <button
               onClick={onOpenLogin}
               className="border border-black px-6 py-2 font-bold text-sm text-black hover:bg-gray-100 transition-colors"
             >
               {t('loginAsAdminBtn')}
             </button>
           </div>
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
          <span className="font-bold text-lg text-black me-2">{t('inbox')}</span>
          <span className="bg-[#4169e1] text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">2</span>
      </div>

      {/* List - Added overflow-y-auto to enable scrolling */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-white">
          {messages.map((msg) => (
              <div key={msg.id} className="p-4 px-6 border-b border-gray-200 flex justify-between items-center shrink-0">
                  <div className="flex-1 min-w-0 pe-4">
                      <div className="font-bold text-black text-sm">{msg.sender}</div>
                      <div className="text-gray-500 text-xs mt-1">{msg.date}</div>
                      <div className="text-gray-500 text-sm mt-1 truncate font-normal">{msg.content}</div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
                      {msg.hasAlert && <AlertTriangle size={18} className="text-yellow-400 fill-yellow-400" />}
                      {msg.isNew && <div className="w-3 h-3 bg-[#4169e1] rounded-full"></div>}
                  </div>
              </div>
          ))}
          {/* Add some extra items to demonstrate scrolling if needed, or rely on small height */}
      </div>

      {/* Footer - Added shrink-0 */}
      <div className="p-6 pt-4 bg-white mt-auto shrink-0">
        <Link 
            to="/messages"
            className="inline-block bg-orange hover:bg-orange-dark text-black font-bold py-2 px-6 text-sm transition-colors rounded-none"
        >
          {t('viewMessages')}
        </Link>
      </div>
    </Card>
  );
};
