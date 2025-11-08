import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: '评论内容' })
  @IsString()
  content: string;

  @ApiProperty({ description: '文章 ID' })
  @IsUUID()
  postId: string;

  @ApiProperty({ description: '父评论 ID', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
