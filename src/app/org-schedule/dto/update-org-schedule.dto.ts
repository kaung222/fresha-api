import { PartialType } from '@nestjs/swagger';
import { CreateOrgScheduleDto } from './create-org-schedule.dto';

export class UpdateOrgScheduleDto extends PartialType(CreateOrgScheduleDto) {}
