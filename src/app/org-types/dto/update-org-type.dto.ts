import { PartialType } from '@nestjs/swagger';
import { CreateOrgTypeDto } from './create-org-type.dto';

export class UpdateOrgTypeDto extends PartialType(CreateOrgTypeDto) {}
