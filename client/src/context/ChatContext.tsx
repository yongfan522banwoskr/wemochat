import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { Message, ChatConversation, User, FriendRequest } from '../types';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { useAuth } from './AuthContext';

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  friends: User[];
  pendingRequests: FriendRequest[];
  onlineUsers: Set<string>;
}

interface ChatContextType extends ChatState {
  setActiveConversation: (friendId: string | null) => void;
  loadMessages: (friendId: string) => Promise<void>;
  sendMessage: (friendId: string, content: string) => void;
  searchUsers: (query: string) => Promise<User[]>;
  addFriend: (userId: string) => Promise<string>;
  respondToRequest: (requestId: string, action: 'accept' | 'reject') => Promise<void>;
  refreshFriends: () => Promise<void>;
  refreshRequests: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [state, setState] = useState<ChatState>({
    conversations: [],
    activeConversation: null,
    messages: {},
    friends: [],
    pendingRequests: [],
    onlineUsers: new Set(),
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (!token) return;

    wsClient.connect(token);

    const unsub = wsClient.onMessage((event) => {
      switch (event.type) {
        case 'message.new': {
          const msg = event.payload.message;
          setState(prev => {
            const friendId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
            const prevMsgs = prev.messages[friendId] || [];
            // Dedup
            if (prevMsgs.find(m => m.id === msg.id)) return prev;
            const newMsgs = { ...prev.messages, [friendId]: [...prevMsgs, msg] };
            const convs = prev.conversations.map(c =>
              c.friendId === friendId
                ? { ...c, lastMessage: msg.content, lastMessageTime: msg.timestamp, unreadCount: friendId !== prev.activeConversation ? c.unreadCount + 1 : 0 }
                : c
            );
            return { ...prev, messages: newMsgs, conversations: convs };
          });
          break;
        }
        case 'friend.request': {
          const req = event.payload.request;
          setState(prev => {
            if (prev.pendingRequests.find(r => r.id === req.id)) return prev;
            return { ...prev, pendingRequests: [...prev.pendingRequests, req] };
          });
          break;
        }
        case 'friend.accepted': {
          refreshFriends();
          break;
        }
        case 'user.online': {
          const { userId, online } = event.payload;
          setState(prev => {
            const newSet = new Set(prev.onlineUsers);
            if (online) newSet.add(userId); else newSet.delete(userId);
            return { ...prev, onlineUsers: newSet };
          });
          break;
        }
      }
    });

    return () => {
      unsub();
      wsClient.disconnect();
    };
  }, [token, user?.id]);

  const refreshFriends = useCallback(async () => {
    if (!token) return;
    const res = await api.getFriendsList(token);
    if (res.code === 0 && res.data) {
      const friends = res.data.friends;
      setState(prev => {
        const convs = friends.map(f => {
          const existing = prev.conversations.find(c => c.friendId === f.id);
          return existing || {
            friendId: f.id,
            friendName: f.displayName,
            lastMessage: '',
            lastMessageTime: '',
            unreadCount: 0,
            isOnline: f.online,
          };
        });
        return { ...prev, friends, conversations: convs };
      });
    }
  }, [token]);

  const refreshRequests = useCallback(async () => {
    if (!token) return;
    const res = await api.getPendingRequests(token);
    if (res.code === 0 && res.data) {
      setState(prev => ({ ...prev, pendingRequests: res.data!.requests }));
    }
  }, [token]);

  // Load initial data when authenticated
  useEffect(() => {
    if (token) {
      refreshFriends();
      refreshRequests();
    }
  }, [token, refreshFriends, refreshRequests]);

  const loadMessages = useCallback(async (friendId: string) => {
    if (!token) return;
    const res = await api.getMessages(token, friendId);
    if (res.code === 0 && res.data) {
      setState(prev => ({
        ...prev,
        messages: { ...prev.messages, [friendId]: res.data!.messages },
        conversations: prev.conversations.map(c =>
          c.friendId === friendId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    }
  }, [token]);

  const sendMessage = useCallback((friendId: string, content: string) => {
    wsClient.send('message.send', { to: friendId, content });
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!token) return [];
    const res = await api.searchUsers(token, query);
    return res.code === 0 && res.data ? res.data.users : [];
  }, [token]);

  const addFriend = useCallback(async (userId: string) => {
    if (!token) return '请先登录';
    const res = await api.sendFriendRequest(token, userId);
    return res.message;
  }, [token]);

  const respondToRequest = useCallback(async (requestId: string, action: 'accept' | 'reject') => {
    if (!token) return;
    await api.respondToRequest(token, requestId, action);
    await refreshRequests();
    await refreshFriends();
  }, [token, refreshRequests, refreshFriends]);

  return (
    <ChatContext.Provider value={{
      ...state,
      loadMessages,
      sendMessage,
      searchUsers,
      addFriend,
      respondToRequest,
      refreshFriends,
      refreshRequests,
      setActiveConversation: (friendId) => setState(prev => ({ ...prev, activeConversation: friendId })),
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
