import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationGateway } from './notifications.gateway';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private notificationGateway: NotificationGateway,
  ) {}
  @OnEvent('notification.created')
  async create(createNotificationDto: CreateNotificationDto) {
    const newNoti = this.notificationRepository.create(createNotificationDto);
    const notification = await this.notificationRepository.save(newNoti);
    this.notificationGateway.createNotification(notification);
  }

  async findAll(userId: number, page: number) {
    const [data, totalCount] = await this.notificationRepository.findAndCount({
      where: { userId },
      take: 10,
      skip: 10 * (page - 1),
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: number) {
    return this.notificationRepository.findOneBy({ id });
  }

  async removeAll(userId: number) {
    await this.notificationRepository.delete({ userId });
    return {
      message: 'Delete all notifications successfully',
    };
  }

  async markAsRead(userId: number) {
    await this.notificationRepository.update({ userId }, { isRead: true });
    return {
      message: 'Marked all as read',
    };
  }

  async remove(id: number, userId: number) {
    const response = await this.notificationRepository.delete({ id, userId });
    if (response.affected === 0)
      throw new NotFoundException('Notification not found');
    return {
      message: 'Delete all notifications successfully',
    };
  }
}
