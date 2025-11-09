import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolesService } from './user-roles.service';
import { UserRole } from './entities/user-role.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User, Role])],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
