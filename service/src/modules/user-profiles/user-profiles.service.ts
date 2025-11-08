import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    private usersService: UsersService,
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    return this.usersService.getProfile(userId);
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    return this.usersService.updateProfile(userId, profileData);
  }
}
