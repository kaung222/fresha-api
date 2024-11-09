import { ValidationArguments, registerDecorator } from 'class-validator';

export default function IsMinCurrentDate() {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMinDate',
      target: object.constructor,
      propertyName,
      options: { message: 'Date should be greater than current date' },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const inputdate = new Date(value);
          //   console.log(new Date('2024-11-10'));
          return inputdate >= new Date();
        },
      },
    });
  };
}
// https://drive.google.com/file/d/11Qziebobg7D0yn8RbIXYB5DF3EQdMpbl/view?usp=drive_link

export function MinDateCustom(property: string) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'minDateCustom',
      target: object.constructor,
      propertyName,
      options: {
        message: `Date should be greater than ${property}`,
      },
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const inputDate = new Date(value);
          const [property] = args.constraints;
          const minDate = new Date(property);
          return inputDate >= minDate;
        },
      },
    });
  };
}
