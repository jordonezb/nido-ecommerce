import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  GiftCreatedPayload,
  PaymentUpdatedPayload,
  GiftLiveActivityPayload,
  GiftCompletedPayload,
} from '../common/types/gift.types';

export interface JoinGiftRoomDto {
  giftOrderId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`🔌 Cliente WebSocket conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Cliente WebSocket desconectado: ${client.id}`);
  }

  /**
   * Suscribe al cliente a la sala del regalo específica: gift:{giftOrderId}
   */
  @SubscribeMessage('join_gift_room')
  handleJoinGiftRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinGiftRoomDto,
  ) {
    if (!data?.giftOrderId) {
      return { success: false, error: 'giftOrderId requerido' };
    }
    const room = `gift:${data.giftOrderId}`;
    client.join(room);
    this.logger.log(`📥 Socket ${client.id} se unió a la sala ${room}`);
    return { success: true, room, event: 'joined' };
  }

  /**
   * Alias de suscripción para compatibilidad con SDD (gift:join)
   */
  @SubscribeMessage('gift:join')
  handleGiftJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinGiftRoomDto,
  ) {
    return this.handleJoinGiftRoom(client, data);
  }

  /**
   * Emite el evento de creación de un nuevo regalo a la sala o de forma global
   */
  emitGiftCreated(payload: GiftCreatedPayload) {
    const room = `gift:${payload.giftOrderId}`;
    this.logger.log(`📢 Emitiendo 'gift:created' para ${room}`);
    this.server.to(room).emit('gift:created', payload);
    this.server.emit('gift:created', payload); // Notificar globalmente a dashboards
  }

  /**
   * Emite actualización de pago (transacción o progreso de Vaca)
   */
  emitPaymentUpdated(giftOrderId: string, payload: PaymentUpdatedPayload) {
    const room = `gift:${giftOrderId}`;
    this.logger.log(
      `📢 Emitiendo 'payment:updated' a ${room} [Estado: ${payload.status}, Pago: ${payload.paymentStatus}]`,
    );
    this.server.to(room).emit('payment:updated', payload);
  }

  /**
   * Emite actividad interactiva en vivo (Valentina raspando cápsula, abriendo caja, cambiando variante)
   */
  emitLiveActivity(giftOrderId: string, payload: GiftLiveActivityPayload) {
    const room = `gift:${giftOrderId}`;
    this.logger.log(
      `📢 Emitiendo 'gift:live_activity' a ${room} [Acción: ${payload.action || payload.liveStatus}]`,
    );
    this.server.to(room).emit('gift:live_activity', payload);
  }

  /**
   * Emite confirmación de regalo completado con reacción y cupón de recompra
   */
  emitGiftCompleted(giftOrderId: string, payload: GiftCompletedPayload) {
    const room = `gift:${giftOrderId}`;
    this.logger.log(`📢 Emitiendo 'gift:completed' a ${room} con cupón generado`);
    this.server.to(room).emit('gift:completed', payload);
  }
}
