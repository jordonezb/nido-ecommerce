import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { SimulateCheckoutDto } from './dto/simulate-checkout.dto';
import { GiftStatus, PaymentStatus } from '../common/types/gift.types';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  /**
   * Procesa la simulación de checkout o aportes a una Vaca grupal
   */
  async processCheckout(dto: SimulateCheckoutDto) {
    // 1. Validar existencia del pedido de regalo
    const gift = await this.prisma.giftOrder.findUnique({
      where: { id: dto.giftOrderId },
    });

    if (!gift) {
      throw new NotFoundException(`Regalo con ID ${dto.giftOrderId} no encontrado`);
    }

    if (gift.status === 'CLAIMED_OR_SWAPPED') {
      throw new BadRequestException('El regalo ya fue reclamado y completado previamente');
    }

    // 2. Registrar la transacción inmutable de pago
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        giftOrderId: dto.giftOrderId,
        payerName: dto.payerName,
        amountCop: dto.amountCop,
        status: dto.simulationOutcome,
        simulationOutcome: dto.simulationOutcome,
      },
    });

    // 3. Determinar el nuevo estado y acumulado de fondos del regalo
    let newStatus: GiftStatus = gift.status as GiftStatus;
    let newPaidAmountCop = gift.paidAmountCop;

    if (dto.simulationOutcome === 'REJECTED') {
      newStatus = 'PAYMENT_REJECTED';
      if (!gift.isGroupGift) {
        newPaidAmountCop = 0;
      }
      await this.prisma.giftOrder.update({
        where: { id: dto.giftOrderId },
        data: {
          status: newStatus,
          paidAmountCop: newPaidAmountCop,
        },
      });
      this.logger.warn(`❌ Pago rechazado para orden ${dto.giftOrderId} por $${dto.amountCop} COP`);
    } else if (dto.simulationOutcome === 'PENDING') {
      newStatus = 'PAYMENT_PENDING';
      if (!gift.isGroupGift) {
        newPaidAmountCop = 0;
      }
      await this.prisma.giftOrder.update({
        where: { id: dto.giftOrderId },
        data: {
          status: newStatus,
          paidAmountCop: newPaidAmountCop,
        },
      });
      this.logger.log(`⏳ Pago pendiente en validación bancaria para orden ${dto.giftOrderId}`);
    } else if (dto.simulationOutcome === 'APPROVED') {
      newPaidAmountCop = gift.paidAmountCop + dto.amountCop;

      if (newPaidAmountCop >= gift.totalAmountCop) {
        newStatus = 'READY_TO_UNBOX';
      } else {
        newStatus = 'COLLECTING_FUNDS';
      }

      await this.prisma.giftOrder.update({
        where: { id: dto.giftOrderId },
        data: {
          paidAmountCop: newPaidAmountCop,
          status: newStatus,
        },
      });

      this.logger.log(
        `💳 Pago aprobado de $${dto.amountCop} COP para orden ${dto.giftOrderId}. Total recaudado: $${newPaidAmountCop}/$${gift.totalAmountCop} COP [Estado: ${newStatus}]`,
      );
    }

    // 4. Obtener orden actualizada con relaciones
    const updatedGift = await this.prisma.giftOrder.findUnique({
      where: { id: dto.giftOrderId },
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

    const totalAmount = updatedGift?.totalAmountCop ?? gift.totalAmountCop;
    const currentPaid = updatedGift?.paidAmountCop ?? newPaidAmountCop;
    const progressPercentage =
      totalAmount > 0 ? Math.min(100, Math.round((currentPaid / totalAmount) * 100)) : 100;

    // 5. Emitir evento Socket.io a la sala
    this.realtimeGateway.emitPaymentUpdated(dto.giftOrderId, {
      giftOrderId: dto.giftOrderId,
      status: newStatus,
      paymentStatus: dto.simulationOutcome,
      paidAmountCop: currentPaid,
      totalAmountCop: totalAmount,
      progressPercentage,
      transaction: {
        id: transaction.id,
        payerName: transaction.payerName,
        amountCop: transaction.amountCop,
        status: transaction.status as PaymentStatus,
        simulationOutcome: transaction.simulationOutcome,
        createdAt: transaction.createdAt.toISOString(),
      },
    });

    return {
      success: true,
      transaction,
      giftOrder: updatedGift,
    };
  }
}
