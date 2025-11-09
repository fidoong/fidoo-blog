import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role } from './entities/role.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Menu } from '@/modules/menus/entities/menu.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, RolePermission, RoleMenu, Permission, Menu]),
    UsersModule,
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}

