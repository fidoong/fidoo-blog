import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/roles/entities/role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  /**
   * 为用户分配角色
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<UserRole[]> {
    // 验证用户是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证角色是否存在
    if (roleIds.length > 0) {
      const roles = await this.roleRepository.find({
        where: { id: In(roleIds) },
      });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('部分角色不存在');
      }
    }

    // 删除用户现有角色
    await this.userRoleRepository.delete({ userId });

    // 创建新角色关联
    if (roleIds.length > 0) {
      const userRoles = roleIds.map((roleId) =>
        this.userRoleRepository.create({ userId, roleId }),
      );
      return await this.userRoleRepository.save(userRoles);
    }

    return [];
  }

  /**
   * 获取用户的角色列表
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: ['role'],
    });
    return userRoles.map((ur) => ur.role).filter((role): role is Role => !!role);
  }

  /**
   * 获取角色的用户列表
   */
  async getRoleUsers(roleId: string): Promise<User[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { roleId },
      relations: ['user'],
    });
    return userRoles.map((ur) => ur.user).filter((user): user is User => !!user);
  }
}

