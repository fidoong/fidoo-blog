import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateCommentDto } from './create-comment.dto';
import { CommentStatus } from '../entities/comment.entity';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({ description: '评论状态', enum: CommentStatus, required: false })
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;
}
