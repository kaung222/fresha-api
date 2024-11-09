import { PartialType } from '@nestjs/swagger';
import { CreateClosedDayDto } from './create-closed-day.dto';

export class UpdateClosedDayDto extends PartialType(CreateClosedDayDto) {}
