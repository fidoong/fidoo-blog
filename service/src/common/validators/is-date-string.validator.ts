import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * 日期字符串验证器
 */
@ValidatorConstraint({ async: false })
export class IsDateStringConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid date string`;
  }
}

/**
 * 日期字符串验证装饰器
 */
export function IsDateString(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateStringConstraint,
    });
  };
}
