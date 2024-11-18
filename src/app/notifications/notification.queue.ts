import { Process, Processor } from '@nestjs/bull';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationGateway } from './notifications.gateway';
import { Notification } from './entities/notification.entity';
import { Job } from 'bull';

@Processor('notificationQueue')
export class NotificationQueue {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private notificationGateway: NotificationGateway,
  ) {}
  @Process('notification.created')
  async create({ data }: Job<CreateNotificationDto>) {
    const newNoti = this.notificationRepository.create(data);
    const notification = await this.notificationRepository.save(newNoti);
    this.notificationGateway.createNotification(notification);
  }
}
