import type { ApiResponse, User, Message, FriendRequest } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

function headers(token?: string) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${url}`, options);
  return res.json();
}

export const api = {
  // Auth
  register(id: string) {
    return request<{ id: string; mnemonicWords: string[] }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: headers(),
    });
  },

  login(id: string, mnemonicWords: string[]) {
    return request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ id, mnemonicWords }),
      headers: headers(),
    });
  },

  logout(token: string) {
    return request('/api/auth/logout', {
      method: 'POST',
      headers: headers(token),
    });
  },

  getMe(token: string) {
    return request<{ user: User }>('/api/auth/me', {
      headers: headers(token),
    });
  },

  // Users
  searchUsers(token: string, query: string) {
    return request<{ users: User[] }>(`/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: headers(token),
    });
  },

  getUser(token: string, id: string) {
    return request<{ user: User }>(`/api/users/${id}`, {
      headers: headers(token),
    });
  },

  // Friends
  sendFriendRequest(token: string, toId: string) {
    return request<{ requestId: string }>('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ toId }),
      headers: headers(token),
    });
  },

  respondToRequest(token: string, requestId: string, action: 'accept' | 'reject') {
    return request('/api/friends/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
      headers: headers(token),
    });
  },

  getFriendsList(token: string) {
    return request<{ friends: User[] }>('/api/friends/list', {
      headers: headers(token),
    });
  },

  getPendingRequests(token: string) {
    return request<{ requests: FriendRequest[] }>('/api/friends/requests', {
      headers: headers(token),
    });
  },

  getMessages(token: string, friendId: string, limit = 50, before?: string) {
    let url = `/api/friends/${friendId}/messages?limit=${limit}`;
    if (before) url += `&before=${encodeURIComponent(before)}`;
    return request<{ messages: Message[] }>(url, {
      headers: headers(token),
    });
  },
};
