import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LikeType } from './entities/like.entity';
import { PaginationDto } from '@/common/dto';

@Controller('likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async like(
    @CurrentUser('id') userId: string,
    @Body('targetType') targetType: LikeType,
    @Body('targetId') targetId: string,
  ) {
    return this.likesService.like(userId, targetType, targetId);
  }

  @Post('unlike')
  @HttpCode(HttpStatus.OK)
  async unlike(
    @CurrentUser('id') userId: string,
    @Body('targetType') targetType: LikeType,
    @Body('targetId') targetId: string,
  ) {
    return this.likesService.unlike(userId, targetType, targetId);
  }

  @Get('check')
  async checkLike(
    @CurrentUser('id') userId: string,
    @Query('targetType') targetType: LikeType,
    @Query('targetId') targetId: string,
  ) {
    return { isLiked: await this.likesService.isLiked(userId, targetType, targetId) };
  }

  @Get('my')
  async getMyLikes(
    @CurrentUser('id') userId: string,
    @Query('targetType') targetType: LikeType,
    @Query() pagination: PaginationDto,
  ) {
    return this.likesService.getUserLikes(userId, targetType, pagination.page, pagination.pageSize);
  }
}
