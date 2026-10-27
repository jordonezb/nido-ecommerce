import { Test, TestingModule } from '@nestjs/testing';
import { GiftsService } from './gifts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGiftDto } from './dto/create-gift.dto';
import { ClaimGiftDto } from './dto/claim-gift.dto';
import { LiveStatusDto } from './dto/live-status.dto';

describe('GiftsService - Pruebas Unitarias de Cápsula Anti-Devoluciones y Ciclo de Vida', () => {
  let service: GiftsService;
  let prismaMock: {
    giftOrder: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    product: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let realtimeGatewayMock: {
    emitGiftCreated: jest.Mock;
    emitLiveActivity: jest.Mock;
    emitGiftCompleted: jest.Mock;
  };

  const mockMainProduct = {
    id: 'prod-tec-1',
    title: 'Audífonos Inalámbricos Hi-Fi',
    priceCop: 195000,
    category: 'Tecnología',
  };

  const mockCapsuleProduct = {
    id: 'prod-hog-1',
    title: 'Set Barista Prensa Francesa',
    priceCop: 98000,
    category: 'Hogar',
  };

  const mockGift = {
    id: 'gift-100',
    senderId: 'user-mateo',
    receiverId: 'user-valentina',
    mainProductId: 'prod-tec-1',
    capsuleProductIdsJson: ['prod-hog-1', 'prod-moda-2'],
    status: 'READY_TO_UNBOX',
    isGroupGift: false,
    totalAmountCop: 195000,
    paidAmountCop: 195000,
    dedication: 'Para Valentina con cariño',
    secretHint: 'Vibraciones sonoras',
    reaction: null,
    unlockedCouponCode: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      giftOrder: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    realtimeGatewayMock = {
      emitGiftCreated: jest.fn(),
      emitLiveActivity: jest.fn(),
      emitGiftCompleted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GiftsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RealtimeGateway, useValue: realtimeGatewayMock },
      ],
    }).compile();

    service = module.get<GiftsService>(GiftsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('3. Flujo Anti-Devoluciones y Confirmación de Cápsula', () => {
    it('debe permitir a Valentina confirmar el producto principal original y recibir cupón NIDO-CONEXION-15', async () => {
      const claimDto: ClaimGiftDto = {
        selectedProductId: 'prod-tec-1',
        selectedVariant: 'Edición Negro Mate Titán',
        reaction: '🎧 ¡Me encantaron los audífonos, Mateo!',
      };

      prismaMock.giftOrder.findUnique.mockResolvedValue(mockGift);
      prismaMock.product.findUnique.mockResolvedValue(mockMainProduct);

      const updatedDate = new Date();
      prismaMock.giftOrder.update.mockResolvedValue({
        ...mockGift,
        selectedProductId: 'prod-tec-1',
        selectedVariant: 'Edición Negro Mate Titán',
        reaction: '🎧 ¡Me encantaron los audífonos, Mateo!',
        status: 'CLAIMED_OR_SWAPPED',
        unlockedCouponCode: 'NIDO-CONEXION-15',
        updatedAt: updatedDate,
      });

      const result = await service.claimGift('gift-100', claimDto);

      expect(result.status).toBe('CLAIMED_OR_SWAPPED');
      expect(result.selectedProductId).toBe('prod-tec-1');
      expect(result.unlockedCouponCode).toBe('NIDO-CONEXION-15');

      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: 'gift-100' },
        data: expect.objectContaining({
          selectedProductId: 'prod-tec-1',
          selectedVariant: 'Edición Negro Mate Titán',
          status: 'CLAIMED_OR_SWAPPED',
          unlockedCouponCode: 'NIDO-CONEXION-15',
        }),
        include: expect.any(Object),
      });

      expect(realtimeGatewayMock.emitGiftCompleted).toHaveBeenCalledWith(
        'gift-100',
        expect.objectContaining({
          giftOrderId: 'gift-100',
          status: 'CLAIMED_OR_SWAPPED',
          selectedProductId: 'prod-tec-1',
          unlockedCouponCode: 'NIDO-CONEXION-15',
        }),
      );
    });

    it('debe permitir a Valentina cambiar el producto principal por una opción pre-aprobada de la Cápsula (Mitigación de devolución)', async () => {
      const swapDto: ClaimGiftDto = {
        selectedProductId: 'prod-hog-1', // Intercambia audífonos por Set Barista
        selectedVariant: 'Prensa + Café Molienda Media',
        reaction: '☕ ¡Prefiero mil veces este café de especialidad!',
      };

      prismaMock.giftOrder.findUnique.mockResolvedValue(mockGift);
      prismaMock.product.findUnique.mockResolvedValue(mockCapsuleProduct);

      const updatedDate = new Date();
      prismaMock.giftOrder.update.mockResolvedValue({
        ...mockGift,
        selectedProductId: 'prod-hog-1',
        selectedVariant: 'Prensa + Café Molienda Media',
        reaction: '☕ ¡Prefiero mil veces este café de especialidad!',
        status: 'CLAIMED_OR_SWAPPED',
        unlockedCouponCode: 'NIDO-CONEXION-15',
        updatedAt: updatedDate,
      });

      const result = await service.claimGift('gift-100', swapDto);

      expect(result.status).toBe('CLAIMED_OR_SWAPPED');
      expect(result.selectedProductId).toBe('prod-hog-1');
      expect(result.unlockedCouponCode).toBe('NIDO-CONEXION-15');

      expect(realtimeGatewayMock.emitGiftCompleted).toHaveBeenCalledWith(
        'gift-100',
        expect.objectContaining({
          selectedProductId: 'prod-hog-1',
          selectedVariant: 'Prensa + Café Molienda Media',
          unlockedCouponCode: 'NIDO-CONEXION-15',
        }),
      );
    });

    it('debe rechazar con BadRequestException si se intenta reclamar un producto ajeno a la cápsula aprobada', async () => {
      const invalidDto: ClaimGiftDto = {
        selectedProductId: 'prod-no-autorizado',
        selectedVariant: 'Talla M',
      };

      prismaMock.giftOrder.findUnique.mockResolvedValue(mockGift);

      await expect(service.claimGift('gift-100', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('4. Interacciones en Vivo y Creación', () => {
    it('debe emitir live_activity cuando Valentina notifica apertura o raspado en vivo', async () => {
      prismaMock.giftOrder.findUnique.mockResolvedValue(mockGift);
      prismaMock.giftOrder.update.mockResolvedValue({
        ...mockGift,
        status: 'UNBOXING_LIVE',
      });

      const liveDto: LiveStatusDto = {
        status: 'UNBOXING_LIVE',
        action: 'scratching_capsule',
        message: 'Valentina está descubriendo las alternativas',
      };

      const result = await service.updateLiveStatus('gift-100', liveDto);

      expect(result.success).toBe(true);
      expect(prismaMock.giftOrder.update).toHaveBeenCalledWith({
        where: { id: 'gift-100' },
        data: { status: 'UNBOXING_LIVE' },
      });
      expect(realtimeGatewayMock.emitLiveActivity).toHaveBeenCalledWith(
        'gift-100',
        expect.objectContaining({
          giftOrderId: 'gift-100',
          liveStatus: 'UNBOXING_LIVE',
          action: 'scratching_capsule',
        }),
      );
    });

    it('debe validar que los productos de la cápsula no superen el precio del producto principal al crear el regalo', async () => {
      const expensiveAlt = {
        id: 'prod-caro',
        title: 'Bicicleta Eléctrica',
        priceCop: 500000, // Mayor que los 195.000 COP del principal
      };

      prismaMock.product.findUnique.mockResolvedValue(mockMainProduct);
      prismaMock.product.findMany.mockResolvedValue([expensiveAlt]);

      const createDto: CreateGiftDto = {
        senderId: 'user-mateo',
        receiverId: 'user-valentina',
        mainProductId: 'prod-tec-1',
        capsuleProductIds: ['prod-caro'],
      };

      await expect(service.createGift(createDto)).rejects.toThrow(BadRequestException);
    });
  });
});
