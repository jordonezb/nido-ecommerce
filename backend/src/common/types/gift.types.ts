/**
 * Tipos e interfaces de dominio para la experiencia de regalos interactivos Nido
 * Diseñado con tipado estricto (cero 'any').
 */

export type GiftStatus =
  | 'DRAFT'
  | 'PAYMENT_PENDING'
  | 'COLLECTING_FUNDS'
  | 'READY_TO_UNBOX'
  | 'UNBOXING_LIVE'
  | 'CLAIMED_OR_SWAPPED'
  | 'PAYMENT_REJECTED';

export type PaymentStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface ProductVariant {
  id: string;
  name: string;
  stock?: number;
  color?: string;
  size?: string;
}

export interface ReactionData {
  emoji: string;
  message: string;
}

export interface GiftCreatedPayload {
  giftOrderId: string;
  senderId: string;
  receiverId?: string | null;
  mainProductId: string;
  isGroupGift: boolean;
  totalAmountCop: number;
  status: GiftStatus;
  createdAt: string;
}

export interface PaymentUpdatedPayload {
  giftOrderId: string;
  status: GiftStatus;
  paymentStatus: PaymentStatus;
  paidAmountCop: number;
  totalAmountCop: number;
  progressPercentage: number;
  transaction: {
    id: string;
    payerName: string;
    amountCop: number;
    status: PaymentStatus;
    simulationOutcome: string;
    createdAt: string;
  };
}

export interface GiftLiveActivityPayload {
  giftOrderId: string;
  liveStatus: 'UNBOXING_LIVE' | string;
  action?: string;
  message?: string;
  timestamp: string;
}

export interface GiftCompletedPayload {
  giftOrderId: string;
  status: 'CLAIMED_OR_SWAPPED';
  selectedProductId: string;
  selectedVariant: string;
  reaction: string;
  unlockedCouponCode: string;
  completedAt: string;
}
