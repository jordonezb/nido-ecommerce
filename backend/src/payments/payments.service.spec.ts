import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SimulateCheckoutDto } from './dto/simulate-checkout.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService - Pruebas Unitarias de Lógica de Pagos y Vaca', () => {
  let service: PaymentsService;
  let prismaMock: {
    giftOrder: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    paymentTransaction: {
      create: jest.Mock;
    };
  };
  let realtimeGatewayMock: {
    emitPaymentUpdated: jest.Mock;
  };

  const sampleGift = {
    id: 'gift-test-123',
    senderId: 'user-mateo',
    receiverId: 'user-valentina',
    mainProductId: 'prod-tec-1',
    capsuleProductIdsJson: ['prod-hog-1', 'prod-moda-2'],
    status: 'PAYMENT_PENDING',
    isGroupGift: false,
    totalAmountCop: 150000,
    paidAmountCop: 0,
    dedication: 'Disfruta tu regalo',
    secretHint: 'Suena increíble',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      giftOrder: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      paymentTransaction: {
        create: jest.fn(),
      },
    };

    realtimeGatewayMock = {
      emitPaymentUpdated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RealtimeGateway, useValue: realtimeGatewayMock },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Checkout Simulado con Resultados APPROVED, PENDING y REJECTED', () => {
    it('debe aprobar el pago total, pasar a READY_TO_UNBOX y emitir evento WebSocket', async () => {
      const dto: SimulateCheckoutDto = {
        giftOrderId: 'gift-test-123',
        payerName: 'Mateo Gómez',
        amountCop: 150000,
        simulationOutcome: 'APPROVED',
      };

      prismaMock.giftOrder.findUnique
        .mockResolvedValueOnce(sampleGift)
        .mockResolvedValueOnce({
          ...sampleGift,
          paidAmountCop: 150000,
          status: 'READY_TO_UNBOX',
          transactions: [],
        });

      prismaMock.paymentTransaction.create.mockResolvedValue({
        id: 'tx-1',
        giftOrderId: 'gift-test-123',
        payerName: 'Mateo Gómez',
        amountCop: 150000,
        status: 'APPROVED',
        simulationOutcome: 'APPROVED',
        createdAt: new Date(),
      });

      prismaMock.giftOrder.update.mockResolvedValue({
        ...sampleGift,
        paidAmountCop: 150000,
        status: 'READY_TO_UNBOX',
      });

      const result = await service.processCheckout(dto);

      expect(result.success).toBe(true);
      expect(prismaMock.paymentTransaction.create).toHaveBeenCalledWith({
        data: {
          giftOrderId: 'gift-test-123',
          payerName: 'Mateo Gómez',
          amountCop: 150000,
          status: 'APPROVED',
          simulationOutcome: 'APPROVED',
        },
      });
      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: 'gift-test-123' },
        data: {
          paidAmountCop: 150000,
          status: 'READY_TO_UNBOX',
        },
      });
      expect(realtimeGatewayMock.emitPaymentUpdated).toHaveBeenCalledWith(
        'gift-test-123',
        expect.objectContaining({
          status: 'READY_TO_UNBOX',
          paymentStatus: 'APPROVED',
          progressPercentage: 100,
          paidAmountCop: 150000,
        }),
      );
    });

    it('debe procesar un pago PENDING, manteniendo PAYMENT_PENDING y emitiendo evento', async () => {
      const dto: SimulateCheckoutDto = {
        giftOrderId: 'gift-test-123',
        payerName: 'Mateo Gómez',
        amountCop: 150000,
        simulationOutcome: 'PENDING',
      };

      prismaMock.giftOrder.findUnique
        .mockResolvedValueOnce(sampleGift)
        .mockResolvedValueOnce({
          ...sampleGift,
          status: 'PAYMENT_PENDING',
          transactions: [],
        });

      prismaMock.paymentTransaction.create.mockResolvedValue({
        id: 'tx-pending',
        giftOrderId: 'gift-test-123',
        payerName: 'Mateo Gómez',
        amountCop: 150000,
        status: 'PENDING',
        simulationOutcome: 'PENDING',
        createdAt: new Date(),
      });

      prismaMock.giftOrder.update.mockResolvedValue({
        ...sampleGift,
        status: 'PAYMENT_PENDING',
      });

      const result = await service.processCheckout(dto);

      expect(result.success).toBe(true);
      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: 'gift-test-123' },
        data: { status: 'PAYMENT_PENDING' },
      });
      expect(realtimeGatewayMock.emitPaymentUpdated).toHaveBeenCalledWith(
        'gift-test-123',
        expect.objectContaining({
          status: 'PAYMENT_PENDING',
          paymentStatus: 'PENDING',
        }),
      );
    });

    it('debe registrar un pago REJECTED, pasar el regalo a PAYMENT_REJECTED sin sumar fondos', async () => {
      const dto: SimulateCheckoutDto = {
        giftOrderId: 'gift-test-123',
        payerName: 'Mateo Gómez',
        amountCop: 150000,
        simulationOutcome: 'REJECTED',
      };

      prismaMock.giftOrder.findUnique
        .mockResolvedValueOnce(sampleGift)
        .mockResolvedValueOnce({
          ...sampleGift,
          paidAmountCop: 0,
          status: 'PAYMENT_REJECTED',
          transactions: [],
        });

      prismaMock.paymentTransaction.create.mockResolvedValue({
        id: 'tx-rejected',
        giftOrderId: 'gift-test-123',
        payerName: 'Mateo Gómez',
        amountCop: 150000,
        status: 'REJECTED',
        simulationOutcome: 'REJECTED',
        createdAt: new Date(),
      });

      prismaMock.giftOrder.update.mockResolvedValue({
        ...sampleGift,
        status: 'PAYMENT_REJECTED',
      });

      const result = await service.processCheckout(dto);

      expect(result.success).toBe(true);
      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: 'gift-test-123' },
        data: { status: 'PAYMENT_REJECTED' },
      });
      expect(realtimeGatewayMock.emitPaymentUpdated).toHaveBeenCalledWith(
        'gift-test-123',
        expect.objectContaining({
          status: 'PAYMENT_REJECTED',
          paymentStatus: 'REJECTED',
          paidAmountCop: 0,
        }),
      );
    });

    it('debe lanzar NotFoundException si el regalo no existe', async () => {
      prismaMock.giftOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.processCheckout({
          giftOrderId: 'inexistente',
          payerName: 'Nadie',
          amountCop: 50000,
          simulationOutcome: 'APPROVED',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el regalo ya fue reclamado', async () => {
      prismaMock.giftOrder.findUnique.mockResolvedValue({
        ...sampleGift,
        status: 'CLAIMED_OR_SWAPPED',
      });

      await expect(
        service.processCheckout({
          giftOrderId: 'gift-test-123',
          payerName: 'Mateo',
          amountCop: 50000,
          simulationOutcome: 'APPROVED',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. Co-gifting ("Vaca"): Múltiples aportes parciales hasta 100%', () => {
    it('debe transicionar a COLLECTING_FUNDS en aporte parcial y luego a READY_TO_UNBOX al completar el 100%', async () => {
      const groupGift = {
        ...sampleGift,
        isGroupGift: true,
        totalAmountCop: 200000,
        paidAmountCop: 0,
        status: 'PAYMENT_PENDING',
      };

      // --- APORTE 1: Camilo aporta $80.000 COP (40%) ---
      prismaMock.giftOrder.findUnique
        .mockResolvedValueOnce(groupGift)
        .mockResolvedValueOnce({
          ...groupGift,
          paidAmountCop: 80000,
          status: 'COLLECTING_FUNDS',
          transactions: [],
        });

      prismaMock.paymentTransaction.create.mockResolvedValueOnce({
        id: 'tx-vaca-1',
        giftOrderId: groupGift.id,
        payerName: 'Camilo Mora',
        amountCop: 80000,
        status: 'APPROVED',
        simulationOutcome: 'APPROVED',
        createdAt: new Date(),
      });

      prismaMock.giftOrder.update.mockResolvedValueOnce({
        ...groupGift,
        paidAmountCop: 80000,
        status: 'COLLECTING_FUNDS',
      });

      const aporte1 = await service.processCheckout({
        giftOrderId: groupGift.id,
        payerName: 'Camilo Mora',
        amountCop: 80000,
        simulationOutcome: 'APPROVED',
      });

      expect(aporte1.success).toBe(true);
      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: groupGift.id },
        data: {
          paidAmountCop: 80000,
          status: 'COLLECTING_FUNDS',
        },
      });
      expect(realtimeGatewayMock.emitPaymentUpdated).toHaveBeenCalledWith(
        groupGift.id,
        expect.objectContaining({
          status: 'COLLECTING_FUNDS',
          paidAmountCop: 80000,
          totalAmountCop: 200000,
          progressPercentage: 40,
        }),
      );

      // --- APORTE 2: Sofía aporta los $120.000 COP restantes (100%) ---
      const giftAfterAporte1 = {
        ...groupGift,
        paidAmountCop: 80000,
        status: 'COLLECTING_FUNDS',
      };

      prismaMock.giftOrder.findUnique
        .mockResolvedValueOnce(giftAfterAporte1)
        .mockResolvedValueOnce({
          ...giftAfterAporte1,
          paidAmountCop: 200000,
          status: 'READY_TO_UNBOX',
          transactions: [],
        });

      prismaMock.paymentTransaction.create.mockResolvedValueOnce({
        id: 'tx-vaca-2',
        giftOrderId: groupGift.id,
        payerName: 'Sofía Castro',
        amountCop: 120000,
        status: 'APPROVED',
        simulationOutcome: 'APPROVED',
        createdAt: new Date(),
      });

      prismaMock.giftOrder.update.mockResolvedValueOnce({
        ...giftAfterAporte1,
        paidAmountCop: 200000,
        status: 'READY_TO_UNBOX',
      });

      const aporte2 = await service.processCheckout({
        giftOrderId: groupGift.id,
        payerName: 'Sofía Castro',
        amountCop: 120000,
        simulationOutcome: 'APPROVED',
      });

      expect(aporte2.success).toBe(true);
      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: groupGift.id },
        data: {
          paidAmountCop: 200000,
          status: 'READY_TO_UNBOX',
        },
      });
      expect(realtimeGatewayMock.emitPaymentUpdated).toHaveBeenCalledWith(
        groupGift.id,
        expect.objectContaining({
          status: 'READY_TO_UNBOX',
          paidAmountCop: 200000,
          totalAmountCop: 200000,
          progressPercentage: 100,
        }),
      );
    });
  });
});
