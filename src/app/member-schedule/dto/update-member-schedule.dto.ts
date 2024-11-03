import { PartialType } from '@nestjs/swagger';
import { CreateMemberScheduleDto } from './create-member-schedule.dto';

export class UpdateMemberScheduleDto extends PartialType(CreateMemberScheduleDto) {}
