'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  GiftCreatedPayload,
  PaymentUpdatedPayload,
  GiftLiveActivityPayload,
  GiftCompletedPayload,
} from '../types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

interface UseRealtimeGiftOptions {
  giftOrderId?: string;
  onGiftCreated?: (payload: GiftCreatedPayload) => void;
  onPaymentUpdated?: (payload: PaymentUpdatedPayload) => void;
  onLiveActivity?: (payload: GiftLiveActivityPayload) => void;
  onGiftCompleted?: (payload: GiftCompletedPayload) => void;
}

export function useRealtimeGift(options: UseRealtimeGiftOptions = {}) {
  const {
    giftOrderId,
    onGiftCreated,
    onPaymentUpdated,
    onLiveActivity,
    onGiftCompleted,
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  // Guardar callbacks en refs para evitar suscripciones redundantes
  const callbacksRef = useRef({
    onGiftCreated,
    onPaymentUpdated,
    onLiveActivity,
    onGiftCompleted,
  });

  useEffect(() => {
    callbacksRef.current = {
      onGiftCreated,
      onPaymentUpdated,
      onLiveActivity,
      onGiftCompleted,
    };
  }, [onGiftCreated, onPaymentUpdated, onLiveActivity, onGiftCompleted]);

  useEffect(() => {
    // Inicializar socket singleton para la instancia
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      if (giftOrderId) {
        socket.emit('join_gift_room', { giftOrderId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('gift:created', (payload: GiftCreatedPayload) => {
      setNotificationCount((prev) => prev + 1);
      if (callbacksRef.current.onGiftCreated) {
        callbacksRef.current.onGiftCreated(payload);
      }
    });

    socket.on('payment:updated', (payload: PaymentUpdatedPayload) => {
      setNotificationCount((prev) => prev + 1);
      if (callbacksRef.current.onPaymentUpdated) {
        callbacksRef.current.onPaymentUpdated(payload);
      }
    });

    socket.on('gift:live_activity', (payload: GiftLiveActivityPayload) => {
      setNotificationCount((prev) => prev + 1);
      if (callbacksRef.current.onLiveActivity) {
        callbacksRef.current.onLiveActivity(payload);
      }
    });

    socket.on('gift:completed', (payload: GiftCompletedPayload) => {
      setNotificationCount((prev) => prev + 1);
      if (callbacksRef.current.onGiftCompleted) {
        callbacksRef.current.onGiftCompleted(payload);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Suscribirse a una sala específica cuando cambie el giftOrderId
  useEffect(() => {
    if (socketRef.current && isConnected && giftOrderId) {
      socketRef.current.emit('join_gift_room', { giftOrderId });
    }
  }, [giftOrderId, isConnected]);

  const resetNotificationCount = useCallback(() => {
    setNotificationCount(0);
  }, []);

  return {
    isConnected,
    notificationCount,
    resetNotificationCount,
    socket: socketRef.current,
  };
}
