import { useEffect, useRef, useCallback, useState } from "react";
import { EventType, ws, WsMessageHandler, WsEventHandler } from "@/lib/api";

export function useWebSocket(path: string) {
  const unsubscribesRef = useRef<Array<() => void>>([]);
  const [isConnected, setIsConnected] = useState(ws.isConnected());

  useEffect(() => {
    (async () => {
      if (!ws.isConnected()) {
        await ws.connect(path).catch(console.error);
      }
    })();
    const unsubscribeConnect = ws.onConnect(() => setIsConnected(true));
    const unsubscribeDisconnect = ws.onDisconnect(() => setIsConnected(false));

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, []);

  const subscribe = useCallback(
    <T>(eventType: EventType, handler: WsMessageHandler<T>): (() => void) => {
      const unsubscribe = ws.on(eventType, handler);
      unsubscribesRef.current.push(unsubscribe);
      return unsubscribe;
    },
    []
  );

  const onConnect = useCallback((handler: WsEventHandler): (() => void) => {
    const unsubscribe = ws.onConnect(handler);
    unsubscribesRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const onDisconnect = useCallback((handler: WsEventHandler): (() => void) => {
    const unsubscribe = ws.onDisconnect(handler);
    unsubscribesRef.current.push(unsubscribe);
    return unsubscribe;
  }, []);

  const send = useCallback(<T>(eventType: EventType, data: T) => {
    try {
      ws.send(eventType, data);
    } catch (error) {
      console.error("Failed to send WebSocket message:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    ws.disconnect();
  }, []);

  return {
    send,
    subscribe,
    disconnect,
    onConnect,
    onDisconnect,
    isConnected
  };
}
