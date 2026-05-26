import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (id: string, mnemonicWords: string[]) => Promise<{ code: number; message: string }>;
  register: (id: string) => Promise<{ code: number; message: string; mnemonicWords?: string[] }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: localStorage.getItem('token'),
    user: null,
    loading: true,
  });

  // Auto-restore session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe(token).then(res => {
        if (res.code === 0 && res.data) {
          setState({ token, user: res.data.user, loading: false });
        } else {
          localStorage.removeItem('token');
          setState({ token: null, user: null, loading: false });
        }
      });
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const login = useCallback(async (id: string, mnemonicWords: string[]) => {
    const res = await api.login(id, mnemonicWords);
    if (res.code === 0 && res.data) {
      localStorage.setItem('token', res.data.token);
      setState({ token: res.data.token, user: res.data.user, loading: false });
    }
    return { code: res.code, message: res.message };
  }, []);

  const register = useCallback(async (id: string) => {
    const res = await api.register(id);
    return {
      code: res.code,
      message: res.message,
      mnemonicWords: res.data?.mnemonicWords,
    };
  }, []);

  const logout = useCallback(() => {
    const token = state.token;
    if (token) api.logout(token);
    wsClient.disconnect();
    localStorage.removeItem('token');
    setState({ token: null, user: null, loading: false });
  }, [state.token]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
