import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { REGEX_CONSTANTS } from '../constants/regex.constant';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    if (!password) return false;
    return REGEX_CONSTANTS.PASSWORD_STRONG.test(password);
  }

  defaultMessage() {
    return '密码必须至少8位，包含大小写字母、数字和特殊字符';
  }
}

/**
 * 验证强密码
 * @param validationOptions 验证选项
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsStrongPasswordConstraint,
    });
  };
}
