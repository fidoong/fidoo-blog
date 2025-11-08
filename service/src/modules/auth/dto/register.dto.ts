import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'johndoe' })
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(3, { message: '用户名至少 3 个字符' })
  @MaxLength(20, { message: '用户名最多 20 个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123!' })
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少 6 个字符' })
  @MaxLength(50, { message: '密码最多 50 个字符' })
  password: string;

  @ApiProperty({ description: '昵称', example: 'John Doe', required: false })
  @IsString()
  @MaxLength(50, { message: '昵称最多 50 个字符' })
  nickname?: string;
}
