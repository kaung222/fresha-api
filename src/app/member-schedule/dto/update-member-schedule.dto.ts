import { IsNotEmpty } from 'class-validator';

export class UpdateMemberScheduleDto {
  @IsNotEmpty()
  startTime: number;
  @IsNotEmpty()
  endTime: number;
}
