/**
 * Definición de tipos TypeScript estrictos para la aplicación Nido Live Gift.
 * Cumple con la regla de diseño: cero 'any' y sincronización estricta con Backend y Prisma.
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
  sku?: string;
  color?: string;
  size?: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'Moda' | 'Tecnología' | 'Hogar' | 'Belleza' | 'Experiencias' | string;
  priceCop: number;
  image: string;
  description: string;
  variantsJson: ProductVariant[];
  tagsJson: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'GIVER' | 'RECEIVER' | 'CUSTOMER';
  preferencesJson: string[];
}

export interface PaymentTransaction {
  id: string;
  giftOrderId: string;
  payerName: string;
  amountCop: number;
  status: PaymentStatus;
  simulationOutcome: PaymentStatus;
  createdAt: string;
}

export interface GiftOrder {
  id: string;
  senderId: string;
  receiverId?: string | null;
  mainProductId: string;
  capsuleProductIdsJson: string[];
  selectedProductId?: string | null;
  selectedVariant?: string | null;
  status: GiftStatus;
  isGroupGift: boolean;
  totalAmountCop: number;
  paidAmountCop: number;
  dedication?: string | null;
  secretHint?: string | null;
  reaction?: string | null;
  unlockedCouponCode?: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
  mainProduct?: Product;
  selectedProduct?: Product | null;
  capsuleProducts?: Product[];
  transactions?: PaymentTransaction[];
}

export interface BootstrapResponse {
  success: boolean;
  data: {
    users: User[];
    products: Product[];
    gifts: GiftOrder[];
  };
}

export interface ResetDemoResponse {
  success: boolean;
  message: string;
  sampleGift: GiftOrder;
}

export interface CreateGiftDto {
  senderId: string;
  receiverId: string;
  mainProductId: string;
  capsuleProductIds?: string[];
  isGroupGift?: boolean;
  dedication?: string;
  secretHint?: string;
  selectedVariant?: string;
}

export interface SimulateCheckoutDto {
  giftOrderId: string;
  payerName: string;
  amountCop: number;
  simulationOutcome: PaymentStatus;
}

export interface SimulateCheckoutResponse {
  success: boolean;
  transaction: PaymentTransaction;
  giftOrder: GiftOrder;
}

export interface GiftAssistantDto {
  receiverId: string;
  mainProductId: string;
  occasion: string;
  tone: string;
  senderName: string;
}

export interface GiftAssistantResponse {
  dedication: string;
  secretHint: string;
  recommendedCapsuleIds: string[];
  provider: 'gemini' | 'deterministic-engine';
}

export interface LiveStatusDto {
  status: 'UNBOXING_LIVE' | string;
  action?: string;
  message?: string;
}

export interface ClaimGiftDto {
  selectedProductId: string;
  selectedVariant: string;
  reaction?: string;
}

// Payloads de Eventos WebSocket
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

export type ViewMode = 'giver' | 'receiver' | 'simultaneous';
