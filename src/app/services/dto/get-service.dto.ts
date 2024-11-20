import { IsEnum, IsOptional } from 'class-validator';
import { ServiceType } from '../entities/service.entity';

export class GetServicesDto {
  @IsOptional()
  @IsEnum(ServiceType)
  type?: ServiceType;
}
