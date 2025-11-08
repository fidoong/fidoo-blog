import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserProfile } from './entities/user-profile.entity';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiQuery } from '@nestjs/swagger';

class GetProfileQueryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
}

@Controller('user-profiles')
@UseGuards(JwtAuthGuard)
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Get()
  @ApiQuery({ name: 'userId', required: false, description: '用户ID（可选，默认当前用户）' })
  async getProfile(@CurrentUser('id') currentUserId: string, @Query() query: GetProfileQueryDto) {
    const userId = query.userId || currentUserId;
    return this.userProfilesService.getProfile(userId);
  }

  @Post('update')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() profileData: Partial<UserProfile>,
  ) {
    return this.userProfilesService.updateProfile(userId, profileData);
  }
}
