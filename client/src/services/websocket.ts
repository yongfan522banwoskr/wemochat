import type { WsServerEvent } from '../types';

const WS_BASE = import.meta.env.VITE_WS_URL ||
  (window.location.protocol === 'https:' ? `wss://${window.location.hostname}` : `ws://${window.location.hostname}:3001`);

type MessageHandler = (event: WsServerEvent) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler[] = [];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private token: string = '';
  private _isConnected: boolean = false;

  get isConnected() { return this._isConnected; }

  connect(token: string) {
    this.token = token;
    if (this.ws) this.ws.close();
    
    const url = `${WS_BASE}/ws`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this._isConnected = true;
      // Authenticate
      this.ws!.send(JSON.stringify({ type: 'auth', payload: { token } }));
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WsServerEvent = JSON.parse(event.data);
        if (data.type === 'pong') return;
        this.handlers.forEach(h => h(data));
      } catch { /* ignore parse errors */ }
    };

    this.ws.onclose = () => {
      this._isConnected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose will fire after this
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.token) this.connect(this.token);
    }, 3000);
  }

  disconnect() {
    this.token = '';
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
  }

  send(type: string, payload?: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  onMessage(handler: MessageHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }
}

export const wsClient = new WebSocketClient();
