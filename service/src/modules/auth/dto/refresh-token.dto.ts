import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken: string;
}
