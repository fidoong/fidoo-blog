import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResponseCode } from '../enums/response-code.enum';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: '响应代码，0 表示成功，非 0 表示失败', example: 0 })
  code: number;

  @ApiPropertyOptional({ description: '响应数据' })
  data?: T;

  @ApiPropertyOptional({ description: '响应消息' })
  message?: string;

  @ApiProperty({ description: '时间戳' })
  timestamp: string;

  constructor(data?: T, message?: string, code: number = ResponseCode.SUCCESS) {
    this.code = code;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponseDto {
  @ApiProperty({ description: '错误代码，非 0 表示失败', example: 400 })
  code: number;

  @ApiProperty({ description: '错误消息' })
  message: string;

  @ApiPropertyOptional({ description: '错误详情数据' })
  data?: any;

  @ApiProperty({ description: '时间戳' })
  timestamp: string;
}
