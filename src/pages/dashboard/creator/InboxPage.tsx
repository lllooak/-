import React, { useEffect, useState, useRef } from 'react';
import { useCreatorStore } from '../../../stores/creatorStore';
import { Send, Search, Filter, Calendar, DollarSign, Video } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  read: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: 'message' | 'payment' | 'request' | 'system';
  entity_id?: string;
  entity_type?: string;
  read: boolean;
}

export function InboxPage() {
  const { initializeRealtime } = useCreatorStore();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'messages' | 'notifications'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chats, setChats] = useState<{[key: string]: Message[]}>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await Promise.all([
          fetchMessages(user.id),
          fetchNotifications(user.id)
        ]);
        initializeRealtime();
      }
      setLoading(false);
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat, chats]);

  const fetchMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(name, avatar_url),
          receiver:users(name, avatar_url)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        // Process messages and group by chat
        const processedMessages = data.map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          content: msg.content,
          created_at: msg.created_at,
          sender_name: msg.sender?.name || 'Unknown',
          sender_avatar: msg.sender?.avatar_url,
          read: msg.read || false
        }));
        
        setMessages(processedMessages);
        
        // Group messages by chat (other user's ID)
        const chatGroups: {[key: string]: Message[]} = {};
        processedMessages.forEach(msg => {
          const chatPartnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
          if (!chatGroups[chatPartnerId]) {
            chatGroups[chatPartnerId] = [];
          }
          chatGroups[chatPartnerId].push(msg);
        });
        
        setChats(chatGroups);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('שגיאה בטעינת הודעות');
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      // Use mock data instead of trying to fetch from the database
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Fallback to mock data
      const mockNotifications = generateMockNotifications();
      setNotifications(mockNotifications);
    }
  };

  const generateMockNotifications = (): Notification[] => {
    const now = new Date();
    return [
      {
        id: '1',
        title: 'בקשת וידאו חדשה',
        message: 'התקבלה בקשת וידאו חדשה מאת דני לוי',
        created_at: now.toISOString(),
        type: 'request',
        entity_id: '123',
        entity_type: 'request',
        read: false
      },
      {
        id: '2',
        title: 'תשלום התקבל',
        message: 'קיבלת תשלום בסך ₪120 עבור וידאו שהשלמת',
        created_at: new Date(now.getTime() - 86400000).toISOString(), // yesterday
        type: 'payment',
        entity_id: '456',
        entity_type: 'payment',
        read: false
      },
      {
        id: '3',
        title: 'עדכון מערכת',
        message: 'תכונות חדשות נוספו למערכת. לחץ כדי לקרוא עוד.',
        created_at: new Date(now.getTime() - 172800000).toISOString(), // 2 days ago
        type: 'system',
        read: true
      }
    ];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      const messageData = {
        sender_id: user.id,
        receiver_id: selectedChat,
        content: newMessage,
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        // Add sender info to the message
        const newMsg = {
          ...data[0],
          sender_name: user.user_metadata?.name || user.email,
          sender_avatar: user.user_metadata?.avatar_url
        };
        
        // Update messages state
        setMessages(prev => [...prev, newMsg]);
        
        // Update chats state
        setChats(prevChats => {
          const existingChat = prevChats[selectedChat] || [];
          return {
            ...prevChats,
            [selectedChat]: [...existingChat, newMsg]
          };
        });
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('שגיאה בשליחת ההודעה:', error);
      toast.error('שגיאה בשליחת ההודעה');
    }
  };

  const handleChatSelect = async (chatId: string, chatName: string) => {
    setSelectedChat(chatId);
    setSelectedChatName(chatName);
    
    // Mark messages from this sender as read
    if (user) {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', chatId)
          .eq('receiver_id', user.id)
          .eq('read', false);
          
        if (error) throw error;
        
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.sender_id === chatId && msg.receiver_id === user.id && !msg.read
              ? { ...msg, read: true }
              : msg
          )
        );
        
        // Update chats state
        setChats(prevChats => {
          const updatedChat = (prevChats[chatId] || []).map(msg => 
            msg.sender_id === chatId && msg.receiver_id === user.id && !msg.read
              ? { ...msg, read: true }
              : msg
          );
          
          return {
            ...prevChats,
            [chatId]: updatedChat
          };
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read in local state
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id
          ? { ...n, read: true }
          : n
      )
    );
    
    // Navigate based on notification type
    if (notification.type === 'request') {
      window.location.href = '/dashboard/creator/requests';
    } else if (notification.type === 'payment') {
      window.location.href = '/dashboard/creator/earnings';
    } else if (notification.type === 'message') {
      // If we have the sender ID, select that chat
      if (notification.entity_id) {
        handleChatSelect(notification.entity_id, 'משתמש');
      }
    }
  };

  const getFilteredItems = () => {
    if (filter === 'messages') {
      return Object.entries(chats)
        .filter(([_, messages]) => {
          const lastMessage = messages[messages.length - 1];
          return lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 lastMessage.sender_name?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    } else if (filter === 'notifications') {
      return notifications.filter(notification => 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      // All items - both chats and notifications
      const filteredChats = Object.entries(chats)
        .filter(([_, messages]) => {
          const lastMessage = messages[messages.length - 1];
          return lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 lastMessage.sender_name?.toLowerCase().includes(searchQuery.toLowerCase());
        });
        
      const filteredNotifications = notifications.filter(notification => 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return { chats: filteredChats, notifications: filteredNotifications };
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <div className="p-2 bg-green-100 rounded-full"><span className="text-green-600">💬</span></div>;
      case 'payment':
        return <div className="p-2 bg-blue-100 rounded-full"><DollarSign className="h-5 w-5 text-blue-600" /></div>;
      case 'request':
        return <div className="p-2 bg-purple-100 rounded-full"><Video className="h-5 w-5 text-purple-600" /></div>;
      default:
        return <div className="p-2 bg-gray-100 rounded-full"><span className="text-gray-600">📣</span></div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-1/3 border-l border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'all' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('messages')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'messages' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              הודעות
            </button>
            <button
              onClick={() => setFilter('notifications')}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === 'notifications' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              התראות
            </button>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש..."
              className="w-full pr-10 pl-4 py-2 border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {filter !== 'notifications' && (
            <>
              {filter === 'all' && notifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">התראות אחרונות</h3>
                </div>
              )}
              
              {(filter === 'all' ? filteredItems.notifications : []).slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {getNotificationIcon(notification.type)}
                    <div className="mr-3 flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-primary-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filter === 'all' && Object.keys(chats).length > 0 && (
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">שיחות</h3>
                </div>
              )}
            </>
          )}
          
          {filter !== 'messages' && filter === 'notifications' && (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start">
                  {getNotificationIcon(notification.type)}
                  <div className="mr-3 flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-primary-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {filter !== 'notifications' && (
            (filter === 'all' ? filteredItems.chats : filteredItems).map(([chatId, chatMessages]) => {
              const lastMessage = chatMessages[chatMessages.length - 1];
              const unreadCount = chatMessages.filter(
                msg => msg.sender_id === chatId && !msg.read
              ).length;
              
              // Determine chat partner name
              const isOutgoing = lastMessage.sender_id === user?.id;
              const chatPartnerName = isOutgoing 
                ? lastMessage.receiver_name || 'משתמש' 
                : lastMessage.sender_name || 'משתמש';
              
              return (
                <div
                  key={chatId}
                  onClick={() => handleChatSelect(chatId, chatPartnerName)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedChat === chatId ? 'bg-primary-50' : ''
                  } ${unreadCount > 0 ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center">
                    <img
                      src={lastMessage.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatPartnerName)}`}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="mr-4 flex-1">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{chatPartnerName}</p>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(lastMessage.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {filter === 'messages' && Object.keys(filteredItems).length === 0 && (
            <div className="p-4 text-center text-gray-500">
              אין הודעות
            </div>
          )}
          
          {filter === 'notifications' && notifications.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              אין התראות
            </div>
          )}
          
          {filter === 'all' && Object.keys(chats).length === 0 && notifications.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              אין הודעות או התראות
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChatName)}`}
                  alt=""
                  className="h-10 w-10 rounded-full"
                />
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-900">{selectedChatName}</p>
                  <p className="text-xs text-gray-500">פעיל כעת</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {chats[selectedChat]?.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="הקלד הודעה..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">בחר שיחה או התראה כדי להתחיל</p>
              <p className="text-gray-400 text-sm mt-2">כאן תוכל לנהל את ההודעות וההתראות שלך</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
