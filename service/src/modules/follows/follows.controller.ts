import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @HttpCode(HttpStatus.OK)
  async follow(@CurrentUser('id') userId: string, @Param('userId') followingId: string) {
    return this.followsService.follow(userId, followingId);
  }

  @Post(':userId/unfollow')
  @HttpCode(HttpStatus.OK)
  async unfollow(@CurrentUser('id') userId: string, @Param('userId') followingId: string) {
    return this.followsService.unfollow(userId, followingId);
  }

  @Get('following/:userId')
  async getFollowings(@Param('userId') userId: string, @Query() pagination: PaginationDto) {
    return this.followsService.getFollowings(userId, pagination.page, pagination.pageSize);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string, @Query() pagination: PaginationDto) {
    return this.followsService.getFollowers(userId, pagination.page, pagination.pageSize);
  }

  @Get('check/:userId')
  async checkFollowing(@CurrentUser('id') userId: string, @Param('userId') followingId: string) {
    return { isFollowing: await this.followsService.isFollowing(userId, followingId) };
  }
}
