import { getAccessToken, refreshAccessToken, clearTokens } from "./token";
import { EventType, WsMessageHandler, WsEventHandler } from "./types";

class WsClient {
  private baseUrl: string;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<EventType, Set<WsMessageHandler<any>>> =
    new Map();
  private eventHandlers: {
    onOpen: Set<WsEventHandler>;
    onClose: Set<WsEventHandler>;
    onError: Set<(error: string) => void>;
  } = {
    onOpen: new Set(),
    onClose: new Set(),
    onError: new Set()
  };

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEXT_PUBLIC_WS_BASE_URL ?? "";
  }

  connect(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = getAccessToken();
        const url = new URL(this.baseUrl + path);

        if (token) {
          url.searchParams.set("token", token);
        }

        this.socket = new WebSocket(url.toString());

        const handleConnectionSuccess = () => {
          this.socket?.removeEventListener("open", handleConnectionSuccess);
          this.socket?.removeEventListener("error", handleConnectionFailure);

          this.setupEventListeners();
          this.eventHandlers.onOpen.forEach((handler) => handler());
          resolve();
        };

        const handleConnectionFailure = (event: Event) => {
          this.socket?.removeEventListener("open", handleConnectionSuccess);
          this.socket?.removeEventListener("error", handleConnectionFailure);

          const errorMsg = "Failed to connect to WebSocket";
          this.eventHandlers.onError.forEach((handler) => handler(errorMsg));
          reject(new Error(errorMsg));
        };

        this.socket.addEventListener("open", handleConnectionSuccess);
        this.socket.addEventListener("error", handleConnectionFailure);
      } catch (error) {
        reject(error);
      }
    });
  }

  on<T = any>(eventType: EventType, handler: WsMessageHandler<T>): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set());
    }

    this.messageHandlers.get(eventType)!.add(handler);

    return () => {
      const handlers = this.messageHandlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  onConnect(handler: WsEventHandler): () => void {
    this.eventHandlers.onOpen.add(handler);
    if (this.isConnected()) {
      try {
        handler();
      } catch (err) {
        console.error("Error executing late onConnect handler:", err);
      }
    }
    return () => this.eventHandlers.onOpen.delete(handler);
  }

  onDisconnect(handler: WsEventHandler): () => void {
    this.eventHandlers.onClose.add(handler);
    return () => this.eventHandlers.onClose.delete(handler);
  }

  onError(handler: (error: string) => void): () => void {
    this.eventHandlers.onError.add(handler);
    return () => this.eventHandlers.onError.delete(handler);
  }

  send<T = any>(eventType: string, data: T): void {
    if (!this.socket || !this.isConnected()) {
      const error = "WebSocket is not connected";
      this.eventHandlers.onError.forEach((handler) => handler(error));
      throw new Error(error);
    }

    this.socket.send(
      JSON.stringify({
        name: eventType,
        payload: data
      })
    );
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    this.socket?.close();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { name, payload } = message;

        if (name && this.messageHandlers.has(name)) {
          this.messageHandlers
            .get(name)!
            .forEach((handler) => handler(payload));
        }
      } catch (error) {
        const errorMsg = `Failed to parse WebSocket message: ${error}`;
        console.log(errorMsg);
        this.eventHandlers.onError.forEach((handler) => handler(errorMsg));
      }
    };

    this.socket.onclose = () => {
      this.eventHandlers.onClose.forEach((handler) => handler());
    };

    this.socket.onerror = (event) => {
      const error =
        event instanceof Event ? event.type : "Unknown WebSocket error";
      this.eventHandlers.onError.forEach((handler) => handler(error));
    };
  }
}

export const ws = new WsClient();
export { WsClient };
