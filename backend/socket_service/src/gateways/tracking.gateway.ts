import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';

@WebSocketGateway({ cors: { origin: '*' } })
export class TrackingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private redisSubscriber: ReturnType<typeof createClient>;

  async afterInit() {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || '6379';

    try {
      this.redisSubscriber = createClient({ url: `redis://${redisHost}:${redisPort}` });
      await this.redisSubscriber.connect();

      // Escuchar eventos globales de KYC desde backend/api
      await this.redisSubscriber.subscribe('kyc.events', (message) => {
        try {
          const payload = JSON.parse(message);
          if (payload.userId) {
            // Emite evento en tiempo real al canal privado del usuario
            this.server.to(`user_${payload.userId}`).emit('kyc:status_updated', {
              status: payload.status,
              reason: payload.reason,
              timestamp: payload.timestamp || new Date().toISOString(),
            });
            console.log(`[Socket Gateway] Notificación KYC emitida a user_${payload.userId}: ${payload.status}`);
          }
        } catch (e) {}
      });
      console.log(`[Socket Gateway] Suscrito a eventos Redis de KYC en ${redisHost}:${redisPort}`);
    } catch (err) {
      console.warn('[Socket Gateway] Redis subscriber no disponible. Modo standalone activo.');
    }
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`[Socket] Cliente autenticado unido a sala privada: user_${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[Socket] Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('driver_location_update')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { driverId: string; latitude: number; longitude: number; tripId?: string },
  ) {
    if (payload.tripId) {
      this.server.to(`trip_${payload.tripId}`).emit('trip_location', payload);
    }
    return { status: 'acknowledged', driverId: payload.driverId };
  }

  @SubscribeMessage('join_trip_room')
  handleJoinTripRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { tripId: string },
  ) {
    client.join(`trip_${payload.tripId}`);
    return { status: 'joined', room: `trip_${payload.tripId}` };
  }
}
