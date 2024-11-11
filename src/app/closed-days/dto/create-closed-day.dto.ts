import IsMinCurrentDate from '@/utils/decorators/validators';
import {
  IsDateString,
  IsOptional,
  IsString,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

export function IsGreaterThanStartDate() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isGreaterThanStartDate',
      target: object.constructor,
      propertyName,
      options: {
        message: 'End date should be greater than or equal to start date',
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const inputDate = new Date(value);
          //@ts-expect-error
          const startDate = new Date(args.object?.startDate);
          return inputDate >= startDate;
        },
      },
    });
  };
}

export class CreateClosedDayDto {
  @IsDateString()
  @IsMinCurrentDate()
  startDate: string;

  @IsDateString()
  @IsGreaterThanStartDate()
  endDate: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsString()
  type: string;
}
