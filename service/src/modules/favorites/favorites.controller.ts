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
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':postId')
  @HttpCode(HttpStatus.OK)
  async favorite(@CurrentUser('id') userId: string, @Param('postId') postId: string) {
    return this.favoritesService.favorite(userId, postId);
  }

  @Post(':postId/unfavorite')
  @HttpCode(HttpStatus.OK)
  async unfavorite(@CurrentUser('id') userId: string, @Param('postId') postId: string) {
    return this.favoritesService.unfavorite(userId, postId);
  }

  @Get('check/:postId')
  async checkFavorite(@CurrentUser('id') userId: string, @Param('postId') postId: string) {
    return { isFavorited: await this.favoritesService.isFavorited(userId, postId) };
  }

  @Get('my')
  async getMyFavorites(@CurrentUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.favoritesService.getUserFavorites(userId, pagination.page, pagination.pageSize);
  }
}
