import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';

@WebSocketGateway(4445, { cors: { origin: '*' } })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  getRoomId(userId: number) {
    const roomId = `notification_room_${userId}`;
    return roomId;
  }
  // emit notification to user
  async createNotification(notification: Notification) {
    const roomId = this.getRoomId(notification.userId);
    this.server.to(roomId).emit('NOTIFICATIONS', notification);
  }

  // global notification to all users
  async createGlobalNotification(notification: Notification) {
    this.server.emit('NOTIFICATIONS', notification);
  }

  // join my notification room
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
