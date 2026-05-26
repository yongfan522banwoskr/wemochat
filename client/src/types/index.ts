export interface User {
  id: string;
  displayName: string;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  fromUser?: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ChatConversation {
  friendId: string;
  friendName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data?: T;
  message: string;
}

// WebSocket event types
export type WsClientEvent =
  | { type: 'auth'; payload: { token: string } }
  | { type: 'message.send'; payload: { to: string; content: string } }
  | { type: 'typing'; payload: { to: string; isTyping: boolean } }
  | { type: 'ping' };

export type WsServerEvent =
  | { type: 'message.new'; payload: { message: Message } }
  | { type: 'friend.request'; payload: { request: FriendRequest } }
  | { type: 'friend.accepted'; payload: { friend: User } }
  | { type: 'user.online'; payload: { userId: string; online: boolean } }
  | { type: 'typing'; payload: { from: string; isTyping: boolean } }
  | { type: 'error'; payload: { code: number; message: string } }
  | { type: 'pong' };
