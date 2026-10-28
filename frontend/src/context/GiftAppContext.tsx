'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  Product,
  GiftOrder,
  ViewMode,
  PaymentUpdatedPayload,
  GiftCreatedPayload,
  GiftLiveActivityPayload,
  GiftCompletedPayload,
} from '../types';
import { fetchBootstrap, resetDemo, getGiftById } from '../services/api';
import { useRealtimeGift } from '../hooks/useRealtimeGift';
import { triggerCelebrationConfetti } from '../lib/confetti';

export interface ValentinaReactionNotification {
  giftOrderId: string;
  reaction: string;
  selectedProductId: string;
  selectedVariant: string;
  unlockedCouponCode: string;
  completedAt: string;
}

interface GiftAppContextType {
  users: User[];
  products: Product[];
  gifts: GiftOrder[];
  activeGift: GiftOrder | null;
  giverUser: User | null;
  receiverUser: User | null;
  viewMode: ViewMode;
  isLoading: boolean;
  isResetting: boolean;
  isConnected: boolean;
  notificationCount: number;
  lastLiveActivity: GiftLiveActivityPayload | null;
  valentinaNotification: ValentinaReactionNotification | null;
  dismissValentinaNotification: () => void;
  triggerValentinaNotification: (notif: ValentinaReactionNotification) => void;
  setViewMode: (mode: ViewMode) => void;
  setActiveGift: (gift: GiftOrder | null) => void;
  loadData: () => Promise<void>;
  handleResetDemo: () => Promise<void>;
  refreshActiveGift: () => Promise<void>;
  updateActiveGiftOptimistic: (patch: Partial<GiftOrder>) => void;
}

const GiftAppContext = createContext<GiftAppContextType | undefined>(undefined);

export function GiftAppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [gifts, setGifts] = useState<GiftOrder[]>([]);
  const [activeGift, setActiveGift] = useState<GiftOrder | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('giver');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [lastLiveActivity, setLastLiveActivity] = useState<GiftLiveActivityPayload | null>(null);
  const [valentinaNotification, setValentinaNotification] = useState<ValentinaReactionNotification | null>(null);

  const dismissValentinaNotification = useCallback(() => {
    setValentinaNotification(null);
  }, []);

  const triggerValentinaNotification = useCallback((notif: ValentinaReactionNotification) => {
    setValentinaNotification(notif);
    triggerCelebrationConfetti();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchBootstrap();
      if (res.success && res.data) {
        setUsers(res.data.users);
        setProducts(res.data.products);
        setGifts(res.data.gifts);

        // Si no hay regalo activo o fue reiniciado, seleccionar el más reciente
        if (res.data.gifts.length > 0) {
          const latest = res.data.gifts[0];
          setActiveGift(latest);
          if (latest.status === 'CLAIMED_OR_SWAPPED' && latest.reaction) {
            setValentinaNotification({
              giftOrderId: latest.id,
              reaction: latest.reaction,
              selectedProductId: latest.selectedProductId || latest.mainProductId,
              selectedVariant: latest.selectedVariant || 'Estándar',
              unlockedCouponCode: latest.unlockedCouponCode || 'NIDO-CONEXION-15',
              completedAt: latest.updatedAt,
            });
          }
        } else {
          setActiveGift(null);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos de bootstrap:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshActiveGift = useCallback(async () => {
    if (!activeGift?.id) return;
    try {
      const updated = await getGiftById(activeGift.id);
      setActiveGift(updated);
      setGifts((prev) =>
        prev.map((g) => (g.id === updated.id ? updated : g)),
      );
      if (updated.status === 'CLAIMED_OR_SWAPPED' && updated.reaction) {
        setValentinaNotification({
          giftOrderId: updated.id,
          reaction: updated.reaction,
          selectedProductId: updated.selectedProductId || updated.mainProductId,
          selectedVariant: updated.selectedVariant || 'Estándar',
          unlockedCouponCode: updated.unlockedCouponCode || 'NIDO-CONEXION-15',
          completedAt: updated.updatedAt,
        });
      }
    } catch (error) {
      console.error('Error al refrescar regalo activo:', error);
    }
  }, [activeGift?.id]);

  const updateActiveGiftOptimistic = useCallback((patch: Partial<GiftOrder>) => {
    setActiveGift((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const handleResetDemo = useCallback(async () => {
    try {
      setIsResetting(true);
      const res = await resetDemo();
      if (res.success) {
        await loadData();
        setLastLiveActivity(null);
        setValentinaNotification(null);
      }
    } catch (error) {
      console.error('Error al reiniciar demo:', error);
    } finally {
      setIsResetting(false);
    }
  }, [loadData]);

  // Manejadores en tiempo real
  const handleGiftCreated = useCallback((payload: GiftCreatedPayload) => {
    getGiftById(payload.giftOrderId).then((gift) => {
      setGifts((prev) => [gift, ...prev.filter((g) => g.id !== gift.id)]);
      setActiveGift(gift);
    });
  }, []);

  const handlePaymentUpdated = useCallback(
    (payload: PaymentUpdatedPayload) => {
      if (activeGift?.id === payload.giftOrderId) {
        setActiveGift((prev) =>
          prev
            ? {
                ...prev,
                status: payload.status,
                paidAmountCop: payload.paidAmountCop,
                totalAmountCop: payload.totalAmountCop,
              }
            : null,
        );
      }
      refreshActiveGift();
    },
    [activeGift?.id, refreshActiveGift],
  );

  const handleLiveActivity = useCallback((payload: GiftLiveActivityPayload) => {
    setLastLiveActivity(payload);
    if (payload.liveStatus === 'UNBOXING_LIVE') {
      setActiveGift((prev) =>
        prev && prev.status !== 'CLAIMED_OR_SWAPPED'
          ? { ...prev, status: 'UNBOXING_LIVE' }
          : prev,
      );
    }
  }, []);

  const handleGiftCompleted = useCallback(
    (payload: GiftCompletedPayload) => {
      triggerCelebrationConfetti();
      setValentinaNotification({
        giftOrderId: payload.giftOrderId,
        reaction: payload.reaction,
        selectedProductId: payload.selectedProductId,
        selectedVariant: payload.selectedVariant,
        unlockedCouponCode: payload.unlockedCouponCode,
        completedAt: payload.completedAt,
      });
      setActiveGift((prev) =>
        prev
          ? {
              ...prev,
              status: 'CLAIMED_OR_SWAPPED',
              selectedProductId: payload.selectedProductId,
              selectedVariant: payload.selectedVariant,
              reaction: payload.reaction,
              unlockedCouponCode: payload.unlockedCouponCode,
            }
          : null,
      );
      refreshActiveGift();
    },
    [refreshActiveGift],
  );

  const { isConnected, notificationCount } = useRealtimeGift({
    giftOrderId: activeGift?.id,
    onGiftCreated: handleGiftCreated,
    onPaymentUpdated: handlePaymentUpdated,
    onLiveActivity: handleLiveActivity,
    onGiftCompleted: handleGiftCompleted,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const giverUser = users.find((u) => u.id === 'user-mateo') || users[0] || null;
  const receiverUser = users.find((u) => u.id === 'user-valentina') || users[1] || null;

  return (
    <GiftAppContext.Provider
      value={{
        users,
        products,
        gifts,
        activeGift,
        giverUser,
        receiverUser,
        viewMode,
        isLoading,
        isResetting,
        isConnected,
        notificationCount,
        lastLiveActivity,
        valentinaNotification,
        dismissValentinaNotification,
        triggerValentinaNotification,
        setViewMode,
        setActiveGift,
        loadData,
        handleResetDemo,
        refreshActiveGift,
        updateActiveGiftOptimistic,
      }}
    >
      {children}
    </GiftAppContext.Provider>
  );
}

export function useGiftApp() {
  const context = useContext(GiftAppContext);
  if (!context) {
    throw new Error('useGiftApp debe usarse dentro de un GiftAppProvider');
  }
  return context;
}
