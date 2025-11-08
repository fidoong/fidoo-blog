import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isNotEmptyString', async: false })
export class IsNotEmptyStringConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  defaultMessage() {
    return '字符串不能为空';
  }
}

/**
 * 验证非空字符串
 * @param validationOptions 验证选项
 */
export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsNotEmptyStringConstraint,
    });
  };
}
