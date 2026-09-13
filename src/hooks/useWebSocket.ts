import { useEffect, useRef, useCallback } from "react";
import { EventType, ws, WsMessageHandler, WsEventHandler } from "@/lib/api";
import useConnectionStore from "@/store/useConnectionStore";
import { useShallow } from "zustand/react/shallow";

export function useWebSocket(path: string, enabled = true) {
  const unsubscribesRef = useRef<Array<() => void>>([]);
  const { isConnected, setConnected } = useConnectionStore(
    useShallow((s) => ({
      isConnected: s.isConnected,
      setConnected: s.setConnected
    }))
  );

  useEffect(() => {
    if (!enabled) return;

    setConnected(ws.isConnected());
    (async () => {
      if (!ws.isConnected()) {
        await ws.connect(path).catch(console.error);
      }
    })();
    const unsubscribeConnect = ws.onConnect(() => setConnected(true));
    const unsubscribeDisconnect = ws.onDisconnect(() => setConnected(false));

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribesRef.current.forEach((unsubscribe) => unsubscribe());
      unsubscribesRef.current = [];
    };
  }, [enabled, path]);

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
