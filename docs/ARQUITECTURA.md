# Arquitectura Técnica - Nido Live Gift & Cápsula Anti-Devoluciones

Este documento recopila la visión técnica, contratos de comunicación y consideraciones de diseño del proyecto TANKU.

---

## 1. Topología del Sistema Contenerizado (Docker)

```text
               +-----------------------------------------+
               |        docker-compose network           |
               |                                         |
[Browser] <--->|  Frontend: Next.js 14 (Port 3000)       |
               |       |                                 |
               |       v (REST & WebSockets)             |
[Browser] <--->|  Backend: NestJS Gateway (Port 4000)    |
               |       |                                 |
               |       v (Prisma ORM)                    |
               |  Database: PostgreSQL 16 (Port 5432)   |
               +-----------------------------------------+
```

---

## 2. Contratos y Protocolos

### A. Endpoints REST Base
- `GET /health`: Healthcheck del backend.
- `GET /products`: Catálogo de productos y alternativas para cápsula.
- `POST /gifts`: Creación del pedido de regalo (`GiftOrder`).
- `GET /gifts/:id`: Detalle del regalo (para emisor y receptor).
- `POST /payments/simulate`: Simulación de transacción (`APPROVED`, `PENDING`, `REJECTED`).
- `POST /ai/dedication`: Generación de dedicatoria y pista emocional (Gemini + fallback).

### B. Eventos WebSocket (Socket.io - Namespace Default)
- `gift:join`: Une el socket a la sala del regalo `gift:{id}`.
- `gift:payment_updated`: Emite el nuevo estado del pago a la sala.
- `gift:opened`: Emite la apertura de caja a la sala (notifica a Mateo en vivo).
- `gift:capsule_selected`: Notifica la confirmación de talla o cambio por alternativa de cápsula.
- `gift:reaction_sent`: Dispara efectos de celebración y confeti simultáneo.

---

## 3. Modelo de Datos Relacional (Prisma)
- **`User`**: Usuarios participantes (`id`, `name`, `email`, `avatar`, `role`, `preferencesJson`).
- **`Product`**: Catálogo con variantes y precio en COP (`id`, `title`, `brand`, `category`, `priceCop`, `image`, `description`, `variantsJson`, `tagsJson`).
- **`GiftOrder`**: Pedido de regalo con enlace a cápsula (`id`, `senderId`, `receiverId`, `mainProductId`, `capsuleProductIdsJson`, `selectedProductId`, `selectedVariant`, `status`, `isGroupGift`, `totalAmountCop`, `paidAmountCop`, `dedication`, `secretHint`, `reaction`, `unlockedCouponCode`).
- **`PaymentTransaction`**: Transacciones de checkout simulado (`id`, `giftOrderId`, `payerName`, `amountCop`, `status`, `simulationOutcome`).
