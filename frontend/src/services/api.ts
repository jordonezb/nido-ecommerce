import {
  BootstrapResponse,
  ResetDemoResponse,
  Product,
  GiftOrder,
  CreateGiftDto,
  SimulateCheckoutDto,
  SimulateCheckoutResponse,
  GiftAssistantDto,
  GiftAssistantResponse,
  LiveStatusDto,
  ClaimGiftDto,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Helper genérico para peticiones HTTP con manejo estricto de errores
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Error en la solicitud: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMessage = Array.isArray(errorJson.message)
          ? errorJson.message.join(', ')
          : errorJson.message;
      }
    } catch {
      // Usar mensaje genérico si no hay cuerpo JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

/**
 * Obtiene los datos iniciales de la aplicación (usuarios, catálogo, regalos)
 */
export async function fetchBootstrap(): Promise<BootstrapResponse> {
  return request<BootstrapResponse>('/api/bootstrap');
}

/**
 * Reinicia la demostración técnica en la base de datos
 */
export async function resetDemo(): Promise<ResetDemoResponse> {
  return request<ResetDemoResponse>('/api/demo/reset', {
    method: 'POST',
  });
}

/**
 * Obtiene el catálogo completo de productos Nido
 */
export async function getProducts(): Promise<Product[]> {
  return request<Product[]>('/api/products');
}

/**
 * Obtiene las alternativas sugeridas para la cápsula de un producto principal
 */
export async function getProductAlternatives(productId: string): Promise<Product[]> {
  return request<Product[]>(`/api/products/${productId}/alternatives`);
}

/**
 * Obtiene el detalle completo de un pedido de regalo por ID
 */
export async function getGiftById(giftId: string): Promise<GiftOrder> {
  return request<GiftOrder>(`/api/gifts/${giftId}`);
}

/**
 * Crea un nuevo pedido de regalo individual o grupal ("Vaca")
 */
export async function createGift(dto: CreateGiftDto): Promise<GiftOrder> {
  return request<GiftOrder>('/api/gifts', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Simula el checkout o aporte a la Vaca (APPROVED, PENDING, REJECTED)
 */
export async function simulateCheckout(
  dto: SimulateCheckoutDto,
): Promise<SimulateCheckoutResponse> {
  return request<SimulateCheckoutResponse>('/api/payments/checkout', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Consulta al Asistente IA de Nido para dedicatoria, pista secreta y alternativas
 */
export async function getGiftAssistantAdvice(
  dto: GiftAssistantDto,
): Promise<GiftAssistantResponse> {
  return request<GiftAssistantResponse>('/api/ai/gift-assistant', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

/**
 * Actualiza el estado de actividad en vivo (ej. UNBOXING_LIVE)
 */
export async function updateGiftLiveStatus(
  giftId: string,
  dto: LiveStatusDto,
): Promise<{ success: boolean; giftOrderId: string; liveStatus: string }> {
  return request<{ success: boolean; giftOrderId: string; liveStatus: string }>(
    `/api/gifts/${giftId}/live-status`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    },
  );
}

/**
 * Reclama o intercambia el producto de la cápsula anti-devoluciones
 */
export async function claimGift(
  giftId: string,
  dto: ClaimGiftDto,
): Promise<GiftOrder> {
  return request<GiftOrder>(`/api/gifts/${giftId}/claim`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}
