import { Body, Controller, Post } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { ApiOperation } from '@nestjs/swagger';
import { SubscribeDto } from './dto/subscribe.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Role(Roles.org)
  @ApiOperation({ summary: 'Subcribe to premium' })
  subscribe(@Body() subscribeDto: SubscribeDto, @User('id') orgId: number) {
    return this.subscriptionsService.subscribe(orgId, subscribeDto);
  }
}
