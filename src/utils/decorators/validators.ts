import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'MinDateString', async: false })
export class MinDateString implements ValidatorConstraintInterface {
  validate(dateStr: string, args: ValidationArguments) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to start of the current day
    return date >= today; // Check if the date is today or later
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a date after or equal to today`;
  }
}
