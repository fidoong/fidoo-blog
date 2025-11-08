import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '用户名', example: 'johndoe' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  ip?: string;
}
