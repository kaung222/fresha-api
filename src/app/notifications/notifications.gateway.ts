import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway(4445, { cors: { origin: '*' } })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  async createClinicNotification(data: CreateNotificationDto) {
    const { userId } = data;
    this.server.to(userId).emit('NEW_NOTIFICATION', data);
  }

  async createUserNotification(data: CreateNotificationDto) {
    const { userId } = data;
    this.server.to(userId).emit('NEW_NOTIFICATION', data);
  }

  async createGlobalNotification(data: CreateNotificationDto) {
    this.server.emit('NEW_NOTIFICATION', data);
  }

  @SubscribeMessage('JOIN_NOTIFICATION')
  joinNotificationRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() socket: Socket,
  ) {
    const notificationId = payload.userId; // userId is used as roomId
    socket.join(notificationId);
    console.log(`${notificationId} join his Notification room`);
  }
}
