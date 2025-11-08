import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDto, PaginationResponseDto } from '@/common/dto';
import { QueryBuilderHelper } from '@/common/helpers';
import { CryptoUtil } from '@/common/utils';
import { UserProfile } from '@/modules/user-profiles/entities/user-profile.entity';
import { BusinessException } from '@/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw BusinessException.conflict('用户名已存在', { field: 'username' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw BusinessException.conflict('邮箱已被注册', { field: 'email' });
    }

    const hashedPassword = await CryptoUtil.hashPassword(createUserDto.password);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // 创建用户扩展信息
    const profile = this.userProfileRepository.create({
      user: savedUser,
    });
    await this.userProfileRepository.save(profile);

    return savedUser;
  }

  async findAll(queryDto: QueryDto): Promise<PaginationResponseDto<User>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    // 应用查询条件
    QueryBuilderHelper.applyQuery(
      queryBuilder,
      queryDto,
      ['user.username', 'user.nickname', 'user.email'],
      'user.createdAt',
    );

    const [users, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(users, total, queryDto.page || 1, queryDto.pageSize || 10);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw BusinessException.notFound('用户不存在');
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await CryptoUtil.hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.usersRepository.softRemove(user);
  }

  async updateLastLogin(id: string, ip?: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      // 如果不存在，创建一个
      const user = await this.findById(userId);
      const newProfile = this.userProfileRepository.create({
        user: user,
      });
      return this.userProfileRepository.save(newProfile);
    }

    return profile;
  }

  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    Object.assign(profile, profileData);
    return this.userProfileRepository.save(profile);
  }
}
