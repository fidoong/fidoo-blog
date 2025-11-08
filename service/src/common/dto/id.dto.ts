import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdDto {
  @ApiProperty({ description: 'ID', example: 'uuid-string' })
  @IsUUID('4', { message: 'ID 必须是有效的 UUID' })
  id: string;
}

export class IdsDto {
  @ApiProperty({ description: 'ID 列表', example: ['uuid-string-1', 'uuid-string-2'] })
  @IsUUID('4', { each: true, message: '所有 ID 必须是有效的 UUID' })
  ids: string[];
}
