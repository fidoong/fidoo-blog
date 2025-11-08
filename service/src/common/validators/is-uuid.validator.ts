import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { validate as uuidValidate } from 'uuid';

/**
 * UUID 验证器
 */
@ValidatorConstraint({ async: false })
export class IsUuidConstraint implements ValidatorConstraintInterface {
  validate(value: any, _args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }
    return uuidValidate(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid UUID`;
  }
}

/**
 * UUID 验证装饰器
 */
export function IsUuid(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUuidConstraint,
    });
  };
}
