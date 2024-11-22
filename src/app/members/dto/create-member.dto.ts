import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@/app/users/entities/user.entity';
import { CommissionFeesType, MemberType } from '../entities/member.entity';

export class CreateMemberDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsDateString()
  @IsOptional()
  dob: Date;

  @IsOptional()
  @IsNumber()
  commissionFees: number;

  @IsOptional()
  @IsEnum(CommissionFeesType)
  commissionFeesType: CommissionFeesType;

  @IsUrl()
  @IsOptional()
  profilePictureUrl: string;

  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @IsOptional()
  @IsString()
  jobTitle: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsDateString()
  @IsOptional()
  startDate: Date;

  @IsOptional()
  @IsNumber()
  experience: number;

  @ApiProperty({ example: '[english, burmese]' })
  @IsOptional()
  @IsString({ each: true })
  languageProficiency?: string[];

  @ApiProperty({ example: '[id1, id2]' })
  @IsOptional()
  serviceIds: number[];

  @IsOptional()
  @IsString()
  memberId: string;

  @IsOptional()
  @IsEnum(MemberType)
  type?: MemberType;

  @IsOptional()
  address?: string;

  @IsOptional()
  country?: string;
}
