import dataSource from '../data-source';
import { User, UserRoleEnum } from '@/modules/users/entities/user.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { Role } from '@/modules/roles/entities/role.entity';

async function fixAdminRole() {
  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    const userRepo = dataSource.getRepository(User);
    const userRoleRepo = dataSource.getRepository(UserRole);
    const roleRepo = dataSource.getRepository(Role);

    // 查找 admin 用户
    const adminUser = await userRepo.findOne({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      console.log('❌ 未找到 admin 用户');
      await dataSource.destroy();
      process.exit(1);
    }

    console.log('✅ 找到 admin 用户:', {
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
    });

    // 查找管理员角色
    const adminRole = await roleRepo.findOne({
      where: { code: 'admin' },
    });

    if (!adminRole) {
      console.log('❌ 未找到管理员角色');
      await dataSource.destroy();
      process.exit(1);
    }

    console.log('✅ 找到管理员角色:', {
      id: adminRole.id,
      name: adminRole.name,
      code: adminRole.code,
    });

    // 检查是否已经分配角色
    const existing = await userRoleRepo.findOne({
      where: { userId: adminUser.id, roleId: adminRole.id },
    });

    if (existing) {
      console.log('✅ admin 用户已经分配了管理员角色');
    } else {
      console.log('⚠️  admin 用户未分配管理员角色，正在分配...');
      await userRoleRepo.save(
        userRoleRepo.create({
          userId: adminUser.id,
          roleId: adminRole.id,
        }),
      );
      console.log('✅ 已为 admin 用户分配管理员角色');
    }

    // 同时更新用户的 role 字段为 ADMIN（向后兼容）
    if (adminUser.role !== UserRoleEnum.ADMIN) {
      console.log('⚠️  更新 admin 用户的 role 字段为 ADMIN...');
      adminUser.role = UserRoleEnum.ADMIN;
      await userRepo.save(adminUser);
      console.log('✅ 已更新 admin 用户的 role 字段');
    }

    // 检查所有管理员用户
    const adminUsers = await userRepo.find({
      where: { role: UserRoleEnum.ADMIN },
    });

    console.log(`\n检查所有管理员用户 (${adminUsers.length} 个)...`);
    for (const user of adminUsers) {
      const existing = await userRoleRepo.findOne({
        where: { userId: user.id, roleId: adminRole.id },
      });
      if (!existing) {
        await userRoleRepo.save(
          userRoleRepo.create({
            userId: user.id,
            roleId: adminRole.id,
          }),
        );
        console.log(`✅ 已为 ${user.username} 分配管理员角色`);
      }
    }

    await dataSource.destroy();
    console.log('\n✅ 修复完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

fixAdminRole();
