import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { REGEX_CONSTANTS } from '../constants/regex.constant';

@ValidatorConstraint({ name: 'isPhone', async: false })
export class IsPhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: string, args: ValidationArguments) {
    if (!phone) return false;
    const isInternational = args.constraints?.[0] || false;
    const regex = isInternational ? REGEX_CONSTANTS.PHONE_INTERNATIONAL : REGEX_CONSTANTS.PHONE_CN;
    return regex.test(phone);
  }

  defaultMessage(args: ValidationArguments) {
    const isInternational = args.constraints?.[0] || false;
    return isInternational ? '手机号格式不正确（国际格式）' : '手机号格式不正确（中国）';
  }
}

/**
 * 验证手机号
 * @param isInternational 是否使用国际格式，默认 false（中国格式）
 * @param validationOptions 验证选项
 */
export function IsPhone(isInternational: boolean = false, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [isInternational],
      validator: IsPhoneConstraint,
    });
  };
}
