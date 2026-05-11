import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { Search, MessageSquare, Loader2, Send, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';

export default function UserMessages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const currentUser = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  }, []);

  // Fetch Conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket Connection for Conversations list updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('chat_unread', ({ bookingId }) => {
      setConversations(prev => prev.map(c => 
        c.id === bookingId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
      ));
    });

    socket.on('chat_read', ({ bookingId }) => {
      setConversations(prev => prev.map(c => 
        c.id === bookingId ? { ...c, unreadCount: 0 } : c
      ));
    });

    return () => socket.disconnect();
  }, []);

  // Active Chat Logic
  useEffect(() => {
    if (!activeConversation) return;

    const token = localStorage.getItem('token');
    let active = true;

    const loadChat = async () => {
      setChatLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/bookings/${activeConversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (active && data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setChatLoading(false);
      }
    };

    loadChat();

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_booking_chat', { bookingId: activeConversation.id }, (res) => {
        if (res?.success) {
          socket.emit('mark_booking_read', { bookingId: activeConversation.id });
          setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c));
        }
      });
    });

    socket.on('booking_message', (msg) => {
      if (msg.bookingId !== activeConversation.id) return;
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (String(msg.senderId) !== String(currentUser.id)) {
        socket.emit('mark_booking_read', { bookingId: activeConversation.id });
      }
    });

    socket.on('booking_messages_read', ({ bookingId, readerId, readAt }) => {
      if (bookingId !== activeConversation.id || String(readerId) === String(currentUser.id)) return;
      setMessages(prev => prev.map(m => m.senderId === currentUser.id && !m.readAt ? { ...m, readAt } : m));
    });

    return () => {
      active = false;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeConversation?.id, currentUser.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!draft.trim() || sending || !activeConversation) return;

    setSending(true);
    socketRef.current?.emit('send_booking_message', {
      bookingId: activeConversation.id,
      message: draft.trim()
    }, (res) => {
      setSending(false);
      if (res?.success) {
        setDraft('');
        fetchConversations(); // Update latest message snippet
      } else {
        toast.error(res?.message || 'Failed to send message');
      }
    });
  };

  const checkIsExpired = (dateStr, slotStr) => {
    if (!dateStr || !slotStr) return false;
    try {
      const bDate = new Date(dateStr);
      const timeParts = String(slotStr).split('-');
      if (timeParts.length < 2) {
         bDate.setHours(23, 59, 59, 999);
         return bDate < new Date();
      }
      const endTimeStr = timeParts[1].trim();
      const timeMatch = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!timeMatch) {
         bDate.setHours(23, 59, 59, 999);
         return bDate < new Date();
      }
      let [_, hours, minutes, ampm] = timeMatch;
      hours = parseInt(hours, 10);
      minutes = parseInt(minutes, 10);
      if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      bDate.setHours(hours, minutes, 0, 0);
      return bDate < new Date();
    } catch {
      return false;
    }
  };

  const filteredConversations = conversations.filter(c => {
    const providerName = c.provider?.user?.name || c.provider?.User?.name || '';
    const category = c.serviceCategory || '';
    const query = searchQuery.toLowerCase();
    return providerName.toLowerCase().includes(query) || category.toLowerCase().includes(query);
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-[2rem] border border-white/5 bg-[#0f172a]/60 backdrop-blur-xl overflow-hidden shadow-2xl relative">
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT SIDEBAR: CONVERSATIONS */}
        <div className={`w-full lg:w-[350px] flex flex-col border-r border-white/5 transition-transform duration-300 ${mobileView === 'chat' ? '-translate-x-full lg:translate-x-0 absolute lg:relative z-10 bg-[#0f172a]' : 'translate-x-0 bg-transparent'} h-full`}>
          <div className="p-5 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white tracking-tight mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#12142a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Loading...</span>
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="divide-y divide-white/5">
                {filteredConversations.map(conv => {
                  const isActive = activeConversation?.id === conv.id;
                  const providerName = conv.provider?.user?.name || conv.provider?.User?.name || 'Provider';
                  const isExpired = checkIsExpired(conv.bookingDate, conv.bookingSlot);
                  const isCompleted = ['completed', 'rejected', 'cancelled'].includes(conv.status);
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversation(conv);
                        setMobileView('chat');
                      }}
                      className={`w-full flex items-start gap-3 p-4 text-left transition-all ${isActive ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}
                    >
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-inner relative">
                        {providerName.charAt(0)}
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-[#0f172a]">
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4 className="text-sm font-bold text-slate-200 truncate pr-2">{providerName}</h4>
                          <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">
                            {conv.latestMessage ? new Date(conv.latestMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : new Date(conv.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-indigo-400 truncate mb-1">{conv.serviceCategory}</p>
                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-white font-semibold' : 'text-slate-500'}`}>
                          {conv.latestMessage ? conv.latestMessage.message : 'Start conversation...'}
                        </p>
                        
                        {(isExpired || isCompleted) && (
                          <span className="inline-block mt-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-rose-500/10 text-rose-400 border-rose-500/20">
                            {isCompleted ? conv.status : 'Expired'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <MessageSquare className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm font-bold text-slate-300 mb-1">No conversations</p>
                <p className="text-xs text-slate-500">Book a service to start chatting with experts.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN WINDOW: CHAT */}
        <div className={`flex-1 flex flex-col bg-[#020617]/50 relative transition-transform duration-300 ${mobileView === 'list' ? 'translate-x-full lg:translate-x-0 absolute lg:relative z-20 w-full' : 'translate-x-0 w-full'} h-full`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-20 border-b border-white/5 bg-[#0f172a]/90 backdrop-blur-md px-6 flex items-center gap-4 shrink-0">
                <button 
                  onClick={() => setMobileView('list')}
                  className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  <AlertCircle className="h-5 w-5 rotate-90" /> {/* Back button hack */}
                </button>
                <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-inner">
                  {(activeConversation.provider?.user?.name || activeConversation.provider?.User?.name || 'P').charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeConversation.provider?.user?.name || activeConversation.provider?.User?.name}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-indigo-400">{activeConversation.serviceCategory}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(activeConversation.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    <div className="text-center pb-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-white/10">
                        Chat Started
                      </span>
                    </div>
                    {messages.map(msg => {
                      const isMine = String(msg.senderId) === String(currentUser.id);
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-[#1e293b] text-slate-200 rounded-bl-sm border border-white/5'}`}>
                            <p className="text-sm whitespace-pre-wrap break-words font-medium">{msg.message}</p>
                            <p className={`text-[9px] font-bold mt-1.5 text-right ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isMine && <span className="ml-1 tracking-tighter">{msg.readAt ? '✓✓' : '✓'}</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <MessageSquare className="h-10 w-10 text-slate-400 mb-3" />
                    <p className="text-sm font-bold text-white">Start the conversation</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Send a message to discuss service details.</p>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-[#0f172a]/90 backdrop-blur-md border-t border-white/5">
                {(() => {
                  const expired = checkIsExpired(activeConversation.bookingDate, activeConversation.bookingSlot);
                  const completed = ['completed', 'rejected', 'cancelled'].includes(activeConversation.status);
                  if (expired || completed) {
                    return (
                      <div className="w-full py-3 text-center rounded-xl bg-slate-500/5 border border-slate-500/20 text-xs font-bold text-slate-500 uppercase tracking-widest cursor-not-allowed">
                        {completed ? `Booking ${activeConversation.status}` : 'Service Window Ended'}
                      </div>
                    );
                  }
                  return (
                    <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-[#12142a] border border-white/10 rounded-2xl p-2 focus-within:border-indigo-500/50 transition-all shadow-inner">
                      <textarea
                        rows={1}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 text-sm text-white placeholder:text-slate-500 px-3 py-2 font-medium custom-scrollbar"
                      />
                      <button 
                        type="submit"
                        disabled={!draft.trim() || sending}
                        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </form>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 hidden lg:flex">
              <div className="h-20 w-20 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Your Messages</h3>
              <p className="text-slate-500 text-sm max-w-sm">Select a conversation from the sidebar to view your chat history and continue the discussion.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
