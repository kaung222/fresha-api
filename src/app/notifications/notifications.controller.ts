import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { NotificationsService } from './notifications.service';
import { Roles, User } from '@/security/user.decorator';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('notifications')
@ApiTags('Notification')
@Role(Roles.user, Roles.member, Roles.org)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notification by user, org, member' })
  findAll(@User('id') userId: number, @Query() { page }: PaginateQuery) {
    return this.notificationService.findAll(userId, page);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete notification' })
  remove(@Param('id') id: string, @User('id') userId: number) {
    return this.notificationService.remove(+id, userId);
  }

  @Delete('delete/all')
  @ApiOperation({ summary: 'delete all notification' })
  removeAll(@User('id') userId: number) {
    return this.notificationService.removeAll(+userId);
  }

  @Patch()
  @ApiOperation({ summary: 'mark all as read notification' })
  mark(@User('id') userId: number) {
    return this.notificationService.markAsRead(userId);
  }
}
