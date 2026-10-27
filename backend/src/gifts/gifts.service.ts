import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateGiftDto } from './dto/create-gift.dto';
import { ClaimGiftDto } from './dto/claim-gift.dto';
import { LiveStatusDto } from './dto/live-status.dto';
import { GiftStatus } from '../common/types/gift.types';

@Injectable()
export class GiftsService {
  private readonly logger = new Logger(GiftsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Crea un nuevo pedido de regalo individual o grupal ("Vaca")
   */
  async createGift(dto: CreateGiftDto) {
    // 1. Validar que el producto principal exista
    const mainProduct = await this.prisma.product.findUnique({
      where: { id: dto.mainProductId },
    });
    if (!mainProduct) {
      throw new NotFoundException(`Producto principal con ID ${dto.mainProductId} no encontrado`);
    }

    // 2. Validar que los productos de la cápsula existan y no superen el precio del principal
    const capsuleIds = dto.capsuleProductIds || [];
    if (capsuleIds.length > 0) {
      const capsuleProducts = await this.prisma.product.findMany({
        where: { id: { in: capsuleIds } },
      });

      if (capsuleProducts.length !== capsuleIds.length) {
        throw new BadRequestException('Uno o más productos de la cápsula no existen en el catálogo');
      }

      for (const alt of capsuleProducts) {
        if (alt.priceCop > mainProduct.priceCop) {
          throw new BadRequestException(
            `El producto de la cápsula "${alt.title}" ($${alt.priceCop} COP) supera el valor del producto principal ($${mainProduct.priceCop} COP)`,
          );
        }
      }
    }

    // 3. Crear el pedido en estado PAYMENT_PENDING
    const gift = await this.prisma.giftOrder.create({
      data: {
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        mainProductId: dto.mainProductId,
        capsuleProductIdsJson: capsuleIds,
        status: 'PAYMENT_PENDING',
        isGroupGift: dto.isGroupGift ?? false,
        totalAmountCop: mainProduct.priceCop,
        paidAmountCop: 0,
        dedication: dto.dedication,
        secretHint: dto.secretHint,
        selectedVariant: dto.selectedVariant,
      },
      include: {
        sender: true,
        receiver: true,
        mainProduct: true,
        transactions: true,
      },
    });

    this.logger.log(`🎁 Regalo creado exitosamente: ${gift.id} [Monto: $${gift.totalAmountCop} COP]`);

    // 4. Emitir evento por WebSocket
    this.realtimeGateway.emitGiftCreated({
      giftOrderId: gift.id,
      senderId: gift.senderId,
      receiverId: gift.receiverId,
      mainProductId: gift.mainProductId,
      isGroupGift: gift.isGroupGift,
      totalAmountCop: gift.totalAmountCop,
      status: gift.status as GiftStatus,
      createdAt: gift.createdAt.toISOString(),
    });

    return gift;
  }

  /**
   * Obtiene la lista completa de regalos
   */
  async findAll() {
    return this.prisma.giftOrder.findMany({
      include: {
        sender: true,
        receiver: true,
        mainProduct: true,
        selectedProduct: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene el detalle de un regalo resolviendo los productos completos de la cápsula
   */
  async findById(id: string) {
    const gift = await this.prisma.giftOrder.findUnique({
      where: { id },
      include: {
        sender: true,
        receiver: true,
        mainProduct: true,
        selectedProduct: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!gift) {
      throw new NotFoundException(`Regalo con ID ${id} no encontrado`);
    }

    // Resolver los productos alternativos de la cápsula a partir del JSON
    const capsuleIds: string[] = Array.isArray(gift.capsuleProductIdsJson)
      ? (gift.capsuleProductIdsJson as string[])
      : [];

    const capsuleProducts =
      capsuleIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: capsuleIds } },
          })
        : [];

    return {
      ...gift,
      capsuleProducts,
    };
  }

  /**
   * Notifica actividad interactiva en vivo (Valentina abriendo la caja o raspando)
   */
  async updateLiveStatus(id: string, dto: LiveStatusDto) {
    const gift = await this.prisma.giftOrder.findUnique({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Regalo con ID ${id} no encontrado`);
    }

    // Si el estado en vivo es UNBOXING_LIVE, persistir en el registro si aún no está completado
    if (dto.status === 'UNBOXING_LIVE' && gift.status !== 'CLAIMED_OR_SWAPPED') {
      await this.prisma.giftOrder.update({
        where: { id },
        data: { status: 'UNBOXING_LIVE' },
      });
    }

    // Emitir a la sala de Socket.io en tiempo real
    this.realtimeGateway.emitLiveActivity(id, {
      giftOrderId: id,
      liveStatus: dto.status,
      action: dto.action,
      message: dto.message,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      giftOrderId: id,
      liveStatus: dto.status,
      action: dto.action,
    };
  }

  /**
   * Reclamo o Intercambio de Cápsula Anti-Devoluciones
   * Valida que el producto confirmado sea el original o una de las alternativas aprobadas
   */
  async claimGift(id: string, dto: ClaimGiftDto) {
    const gift = await this.prisma.giftOrder.findUnique({ where: { id } });
    if (!gift) {
      throw new NotFoundException(`Regalo con ID ${id} no encontrado`);
    }

    // Validar que el regalo esté pagado y listo para ser reclamado
    if (gift.status !== 'READY_TO_UNBOX' && gift.status !== 'UNBOXING_LIVE') {
      throw new BadRequestException(
        `El regalo no puede ser reclamado en estado ${gift.status}. Debe estar pagado (READY_TO_UNBOX o UNBOXING_LIVE)`,
      );
    }

    // Validar que el producto seleccionado pertenezca al regalo o a la cápsula autorizada
    const capsuleIds: string[] = Array.isArray(gift.capsuleProductIdsJson)
      ? (gift.capsuleProductIdsJson as string[])
      : [];

    const isOriginalProduct = dto.selectedProductId === gift.mainProductId;
    const isCapsuleOption = capsuleIds.includes(dto.selectedProductId);

    if (!isOriginalProduct && !isCapsuleOption) {
      throw new BadRequestException(
        'El producto seleccionado no pertenece a la cápsula anti-devoluciones aprobada para este regalo',
      );
    }

    // Validar que el producto seleccionado exista
    const selectedProduct = await this.prisma.product.findUnique({
      where: { id: dto.selectedProductId },
    });
    if (!selectedProduct) {
      throw new NotFoundException(`Producto seleccionado con ID ${dto.selectedProductId} no existe`);
    }

    // Código de cupón exclusivo para retención y fidelización (meta 18% recompra)
    const unlockedCouponCode = 'NIDO-CONEXION-15';
    const reactionText = dto.reaction || '❤️ ¡Me encantó la sorpresa!';

    // Actualizar pedido a estado CLAIMED_OR_SWAPPED
    const updatedGift = await this.prisma.giftOrder.update({
      where: { id },
      data: {
        selectedProductId: dto.selectedProductId,
        selectedVariant: dto.selectedVariant,
        reaction: reactionText,
        status: 'CLAIMED_OR_SWAPPED',
        unlockedCouponCode,
      },
      include: {
        sender: true,
        receiver: true,
        mainProduct: true,
        selectedProduct: true,
        transactions: true,
      },
    });

    this.logger.log(
      `🎉 Regalo ${id} completado. Valentina confirmó: "${selectedProduct.title}" [Talla/Variante: ${dto.selectedVariant}]. Cupón generado: ${unlockedCouponCode}`,
    );

    // Emitir evento WebSocket a Mateo y Valentina
    this.realtimeGateway.emitGiftCompleted(id, {
      giftOrderId: id,
      status: 'CLAIMED_OR_SWAPPED',
      selectedProductId: dto.selectedProductId,
      selectedVariant: dto.selectedVariant,
      reaction: reactionText,
      unlockedCouponCode,
      completedAt: updatedGift.updatedAt.toISOString(),
    });

    return updatedGift;
  }
}
