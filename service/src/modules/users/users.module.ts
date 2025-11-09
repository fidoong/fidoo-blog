import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from '@/modules/user-profiles/entities/user-profile.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Menu } from '@/modules/menus/entities/menu.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      UserRole,
      RolePermission,
      Permission,
      Menu,
      RoleMenu,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
