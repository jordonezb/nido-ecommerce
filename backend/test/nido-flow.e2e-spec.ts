import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SEED_USERS, SEED_PRODUCTS } from '../src/bootstrap/seed-data';

/**
 * Suite E2E Integral para Nido Live Gift & Cápsula Anti-Devoluciones
 * Valida los 5 escenarios de negocio y casos límite requeridos por TANKU.
 * Utiliza simulación en memoria determinista de Prisma para ejecución autónoma sin dependencias externas.
 */
class InMemoryPrismaService {
  private users: any[] = [];
  private products: any[] = [];
  private giftOrders: any[] = [];
  private paymentTransactions: any[] = [];

  constructor() {
    this.initData();
  }

  private initData() {
    this.users = SEED_USERS.map((u) => ({ ...u, createdAt: new Date(), updatedAt: new Date() }));
    this.products = SEED_PRODUCTS.map((p) => ({ ...p, createdAt: new Date(), updatedAt: new Date() }));
    this.giftOrders = [];
    this.paymentTransactions = [];
  }

  async $connect() {}
  async $disconnect() {}

  user = {
    count: jest.fn().mockImplementation(async () => this.users.length),
    findMany: jest.fn().mockImplementation(async () => [...this.users]),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.users.find((u) => u.id === where.id || u.email === where.email) || null;
    }),
    upsert: jest.fn().mockImplementation(async ({ where, create, update }) => {
      const idx = this.users.findIndex((u) => u.id === where.id);
      if (idx >= 0) {
        this.users[idx] = { ...this.users[idx], ...update };
        return this.users[idx];
      } else {
        const item = { ...create, createdAt: new Date(), updatedAt: new Date() };
        this.users.push(item);
        return item;
      }
    }),
  };

  product = {
    count: jest.fn().mockImplementation(async () => this.products.length),
    findMany: jest.fn().mockImplementation(async (args) => {
      let result = [...this.products];
      if (args?.where?.id?.in) {
        result = result.filter((p) => args.where.id.in.includes(p.id));
      }
      return result;
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      return this.products.find((p) => p.id === where.id) || null;
    }),
    upsert: jest.fn().mockImplementation(async ({ where, create, update }) => {
      const idx = this.products.findIndex((p) => p.id === where.id);
      if (idx >= 0) {
        this.products[idx] = { ...this.products[idx], ...update };
        return this.products[idx];
      } else {
        const item = { ...create, createdAt: new Date(), updatedAt: new Date() };
        this.products.push(item);
        return item;
      }
    }),
  };

  giftOrder = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const item = {
        id: data.id || `gift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        senderId: data.senderId,
        receiverId: data.receiverId,
        mainProductId: data.mainProductId,
        capsuleProductIdsJson: data.capsuleProductIdsJson || [],
        selectedProductId: data.selectedProductId || null,
        selectedVariant: data.selectedVariant || null,
        status: data.status || 'PAYMENT_PENDING',
        isGroupGift: data.isGroupGift || false,
        totalAmountCop: data.totalAmountCop || 0,
        paidAmountCop: data.paidAmountCop || 0,
        dedication: data.dedication || null,
        secretHint: data.secretHint || null,
        reaction: data.reaction || null,
        unlockedCouponCode: data.unlockedCouponCode || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.giftOrders.push(item);
      return this.populateGift(item);
    }),
    findUnique: jest.fn().mockImplementation(async ({ where }) => {
      const item = this.giftOrders.find((g) => g.id === where.id);
      return item ? this.populateGift(item) : null;
    }),
    findMany: jest.fn().mockImplementation(async () => {
      return this.giftOrders.map((g) => this.populateGift(g));
    }),
    update: jest.fn().mockImplementation(async ({ where, data }) => {
      const idx = this.giftOrders.findIndex((g) => g.id === where.id);
      if (idx === -1) return null;
      this.giftOrders[idx] = {
        ...this.giftOrders[idx],
        ...data,
        updatedAt: new Date(),
      };
      return this.populateGift(this.giftOrders[idx]);
    }),
    deleteMany: jest.fn().mockImplementation(async () => {
      const count = this.giftOrders.length;
      this.giftOrders = [];
      return { count };
    }),
  };

  paymentTransaction = {
    create: jest.fn().mockImplementation(async ({ data }) => {
      const item = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        giftOrderId: data.giftOrderId,
        payerName: data.payerName,
        amountCop: data.amountCop,
        status: data.status,
        simulationOutcome: data.simulationOutcome,
        createdAt: new Date(),
      };
      this.paymentTransactions.push(item);
      return item;
    }),
    deleteMany: jest.fn().mockImplementation(async () => {
      const count = this.paymentTransactions.length;
      this.paymentTransactions = [];
      return { count };
    }),
    findMany: jest.fn().mockImplementation(async () => [...this.paymentTransactions]),
  };

  private populateGift(gift: any) {
    const sender = this.users.find((u) => u.id === gift.senderId) || null;
    const receiver = this.users.find((u) => u.id === gift.receiverId) || null;
    const mainProduct = this.products.find((p) => p.id === gift.mainProductId) || null;
    const selectedProduct = gift.selectedProductId
      ? this.products.find((p) => p.id === gift.selectedProductId) || null
      : null;
    const transactions = this.paymentTransactions
      .filter((tx) => tx.giftOrderId === gift.id)
      .slice()
      .reverse();

    return {
      ...gift,
      sender,
      receiver,
      mainProduct,
      selectedProduct,
      transactions,
    };
  }
}

describe('Nido Live Gift & Cápsula Anti-Devoluciones (E2E)', () => {
  let app: INestApplication;
  let inMemoryPrisma: InMemoryPrismaService;

  beforeAll(async () => {
    inMemoryPrisma = new InMemoryPrismaService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(inMemoryPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // ESCENARIO E2E-01: Bootstrap & Reset Demo
  // =========================================================================
  describe('E2E-01 (Bootstrap & Reset Demo)', () => {
    it('debe reiniciar la demostración y devolver los datos de catálogo y usuarios iniciales', async () => {
      // 1. Reset demo
      const resetRes = await request(app.getHttpServer())
        .post('/api/demo/reset')
        .expect(201);

      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.sampleGift).toBeDefined();
      expect(resetRes.body.sampleGift.id).toBe('gift-demo-1');

      // 2. Consulta bootstrap
      const bootstrapRes = await request(app.getHttpServer())
        .get('/api/bootstrap')
        .expect(200);

      expect(bootstrapRes.body.success).toBe(true);
      const { users, products, gifts } = bootstrapRes.body.data;

      // Validar 2 usuarios precargados
      expect(users.length).toBe(2);
      const mateo = users.find((u: any) => u.id === 'user-mateo');
      const valentina = users.find((u: any) => u.id === 'user-valentina');
      expect(mateo).toBeDefined();
      expect(valentina).toBeDefined();
      expect(valentina.preferencesJson).toContain('cafe de especialidad');

      // Validar 8 productos del catálogo Nido con precios en COP
      expect(products.length).toBe(8);
      const techProduct = products.find((p: any) => p.category === 'Tecnología');
      expect(techProduct).toBeDefined();
      expect(techProduct.priceCop).toBeGreaterThan(0);

      // Validar regalo demo creado
      expect(gifts.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // ESCENARIO E2E-02: Nido AI Assistant & Creación de Regalo con Cápsula
  // =========================================================================
  describe('E2E-02 (Nido AI Assistant & Creación de Regalo con Cápsula)', () => {
    let createdGiftId: string;
    let recommendedAlternatives: string[];

    it('debe generar dedicatoria, pista secreta y sugerencias de cápsula mediante Nido AI', async () => {
      const aiDto = {
        receiverId: 'user-valentina',
        mainProductId: 'prod-tec-1', // Audífonos Inalámbricos Hi-Fi ($195.000 COP)
        occasion: 'Cumpleaños',
        tone: 'emocional y cálido',
        senderName: 'Mateo',
      };

      const aiRes = await request(app.getHttpServer())
        .post('/api/ai/gift-assistant')
        .send(aiDto)
        .expect(201);

      expect(aiRes.body.dedication).toBeDefined();
      expect(aiRes.body.dedication.length).toBeGreaterThan(10);
      expect(aiRes.body.secretHint).toBeDefined();
      expect(aiRes.body.secretHint.length).toBeGreaterThan(5);
      expect(Array.isArray(aiRes.body.recommendedCapsuleIds)).toBe(true);
      expect(aiRes.body.recommendedCapsuleIds.length).toBeLessThanOrEqual(2);

      recommendedAlternatives = aiRes.body.recommendedCapsuleIds;
    });

    it('debe crear un regalo en estado PAYMENT_PENDING con la cápsula anti-devoluciones', async () => {
      const createDto = {
        senderId: 'user-mateo',
        receiverId: 'user-valentina',
        mainProductId: 'prod-tec-1',
        capsuleProductIds: recommendedAlternatives,
        isGroupGift: false,
        dedication: '¡Feliz cumpleaños Valentina! Este detalle es para ti.',
        secretHint: 'Vibra al compás de tu ritmo favorito...',
      };

      const giftRes = await request(app.getHttpServer())
        .post('/api/gifts')
        .send(createDto)
        .expect(201);

      expect(giftRes.body.id).toBeDefined();
      expect(giftRes.body.status).toBe('PAYMENT_PENDING');
      expect(giftRes.body.totalAmountCop).toBe(195000);
      expect(giftRes.body.paidAmountCop).toBe(0);
      expect(giftRes.body.capsuleProductIdsJson).toEqual(recommendedAlternatives);

      createdGiftId = giftRes.body.id;
    });
  });

  // =========================================================================
  // ESCENARIO E2E-03: Máquina de Estados del Checkout Simulado (Casos Límite)
  // =========================================================================
  describe('E2E-03 (Máquina de Estados del Checkout Simulado - Casos Límite)', () => {
    let testGiftId: string;

    beforeAll(async () => {
      // Crear un regalo específico para pruebas de máquina de estados
      const gift = await inMemoryPrisma.giftOrder.create({
        data: {
          senderId: 'user-mateo',
          receiverId: 'user-valentina',
          mainProductId: 'prod-tec-1',
          capsuleProductIdsJson: ['prod-hog-1', 'prod-moda-2'],
          status: 'PAYMENT_PENDING',
          totalAmountCop: 195000,
          paidAmountCop: 0,
        },
      });
      testGiftId = gift.id;
    });

    it('debe transicionar a PAYMENT_REJECTED cuando la simulación es rechazada', async () => {
      const checkoutRes = await request(app.getHttpServer())
        .post('/api/payments/checkout')
        .send({
          giftOrderId: testGiftId,
          payerName: 'Mateo Gómez',
          amountCop: 195000,
          simulationOutcome: 'REJECTED',
        })
        .expect(201);

      expect(checkoutRes.body.success).toBe(true);
      expect(checkoutRes.body.giftOrder.status).toBe('PAYMENT_REJECTED');
    });

    it('debe bloquear el reclamo del regalo (HTTP 400 Bad Request) si el regalo no está pagado', async () => {
      const claimRes = await request(app.getHttpServer())
        .patch(`/api/gifts/${testGiftId}/claim`)
        .send({
          selectedProductId: 'prod-tec-1',
          selectedVariant: 'Edición Negro Mate Titán',
          reaction: '❤️ ¡Gracias!',
        })
        .expect(400);

      expect(claimRes.body.message).toContain('El regalo no puede ser reclamado en estado PAYMENT_REJECTED');
    });

    it('debe transicionar a PAYMENT_PENDING cuando el pago entra en validación bancaria', async () => {
      const checkoutRes = await request(app.getHttpServer())
        .post('/api/payments/checkout')
        .send({
          giftOrderId: testGiftId,
          payerName: 'Mateo Gómez',
          amountCop: 195000,
          simulationOutcome: 'PENDING',
        })
        .expect(201);

      expect(checkoutRes.body.success).toBe(true);
      expect(checkoutRes.body.giftOrder.status).toBe('PAYMENT_PENDING');
    });

    it('debe transicionar a READY_TO_UNBOX al aprobar el 100% del pago', async () => {
      const checkoutRes = await request(app.getHttpServer())
        .post('/api/payments/checkout')
        .send({
          giftOrderId: testGiftId,
          payerName: 'Mateo Gómez',
          amountCop: 195000,
          simulationOutcome: 'APPROVED',
        })
        .expect(201);

      expect(checkoutRes.body.success).toBe(true);
      expect(checkoutRes.body.giftOrder.status).toBe('READY_TO_UNBOX');
      expect(checkoutRes.body.giftOrder.paidAmountCop).toBe(195000);
    });
  });

  // =========================================================================
  // ESCENARIO E2E-04: Unboxing en Vivo + Swap en Cápsula + Cupón de Recompra
  // =========================================================================
  describe('E2E-04 (Unboxing en Vivo + Swap en Cápsula + Cupón de Recompra)', () => {
    let unboxGiftId: string;

    beforeAll(async () => {
      // Regalo listo para unboxing con alternativas de cápsula aprobadas
      const gift = await inMemoryPrisma.giftOrder.create({
        data: {
          senderId: 'user-mateo',
          receiverId: 'user-valentina',
          mainProductId: 'prod-tec-1', // Audífonos ($195.000)
          capsuleProductIdsJson: ['prod-hog-1', 'prod-moda-2'], // Set Barista ($98.000) y Hoodie ($115.000)
          status: 'READY_TO_UNBOX',
          totalAmountCop: 195000,
          paidAmountCop: 195000,
          dedication: '¡Para ti con todo mi cariño!',
        },
      });
      unboxGiftId = gift.id;
    });

    it('debe actualizar el estado a UNBOXING_LIVE cuando Valentina inicia el unboxing', async () => {
      const liveRes = await request(app.getHttpServer())
        .patch(`/api/gifts/${unboxGiftId}/live-status`)
        .send({
          status: 'UNBOXING_LIVE',
          action: 'OPENED_BOX',
          message: 'Valentina está abriendo la cápsula',
        })
        .expect(200);

      expect(liveRes.body.success).toBe(true);
      expect(liveRes.body.liveStatus).toBe('UNBOXING_LIVE');

      // Verificar persistencia del estado en el regalo
      const getRes = await request(app.getHttpServer())
        .get(`/api/gifts/${unboxGiftId}`)
        .expect(200);

      expect(getRes.body.status).toBe('UNBOXING_LIVE');
    });

    it('debe permitir intercambiar por una opción de la cápsula (Set Barista), confirmar talla y desbloquear el cupón', async () => {
      // Valentina decide canjear los audífonos por el Set Barista (prod-hog-1)
      const claimRes = await request(app.getHttpServer())
        .patch(`/api/gifts/${unboxGiftId}/claim`)
        .send({
          selectedProductId: 'prod-hog-1', // Alternativa de la cápsula
          selectedVariant: 'Prensa + Café Molienda Media',
          reaction: '😍 ¡Mateo, me fascina el café de especialidad, muchas gracias!',
        })
        .expect(200);

      expect(claimRes.body.status).toBe('CLAIMED_OR_SWAPPED');
      expect(claimRes.body.selectedProductId).toBe('prod-hog-1');
      expect(claimRes.body.selectedVariant).toBe('Prensa + Café Molienda Media');
      expect(claimRes.body.reaction).toContain('😍 ¡Mateo, me fascina el café');
      expect(claimRes.body.unlockedCouponCode).toBe('NIDO-CONEXION-15');
    });
  });

  // =========================================================================
  // ESCENARIO E2E-05: Flujo Grupal "La Vaca" / Co-Gifting entre varias personas
  // =========================================================================
  describe('E2E-05 (Flujo Grupal "La Vaca" / Co-Gifting entre varias personas)', () => {
    let vacaGiftId: string;

    it('debe crear un regalo en modalidad grupal (La Vaca) de $180.000 COP', async () => {
      const gift = await inMemoryPrisma.giftOrder.create({
        data: {
          senderId: 'user-mateo',
          receiverId: 'user-valentina',
          mainProductId: 'prod-tec-2', // Parlante Bluetooth Nogal ($155.000 COP)
          isGroupGift: true,
          status: 'PAYMENT_PENDING',
          totalAmountCop: 180000,
          paidAmountCop: 0,
        },
      });
      vacaGiftId = gift.id;
    });

    it('Aporte 1 (Mateo, $90.000 COP, APPROVED): debe acumular fondos en COLLECTING_FUNDS sin abrir la caja', async () => {
      const aporte1Res = await request(app.getHttpServer())
        .post('/api/payments/checkout')
        .send({
          giftOrderId: vacaGiftId,
          payerName: 'Mateo Gómez',
          amountCop: 90000,
          simulationOutcome: 'APPROVED',
        })
        .expect(201);

      expect(aporte1Res.body.success).toBe(true);
      expect(aporte1Res.body.giftOrder.paidAmountCop).toBe(90000);
      expect(aporte1Res.body.giftOrder.status).toBe('COLLECTING_FUNDS');
    });

    it('Aporte 2 (Camila, $90.000 COP, APPROVED): debe alcanzar el 100% y transicionar automáticamente a READY_TO_UNBOX', async () => {
      const aporte2Res = await request(app.getHttpServer())
        .post('/api/payments/checkout')
        .send({
          giftOrderId: vacaGiftId,
          payerName: 'Camila Torres',
          amountCop: 90000,
          simulationOutcome: 'APPROVED',
        })
        .expect(201);

      expect(aporte2Res.body.success).toBe(true);
      expect(aporte2Res.body.giftOrder.paidAmountCop).toBe(180000);
      expect(aporte2Res.body.giftOrder.status).toBe('READY_TO_UNBOX');

      // Validar que se registraron ambas transacciones
      const getVaca = await request(app.getHttpServer())
        .get(`/api/gifts/${vacaGiftId}`)
        .expect(200);

      expect(getVaca.body.transactions.length).toBe(2);
      const payerNames = getVaca.body.transactions.map((t: any) => t.payerName);
      expect(payerNames).toContain('Camila Torres');
      expect(payerNames).toContain('Mateo Gómez');
    });
  });
});
