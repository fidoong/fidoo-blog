import dataSource from './src/database/data-source';
import { User } from './src/modules/users/entities/user.entity';
import { UserRole } from './src/modules/user-roles/entities/user-role.entity';
import { Role } from './src/modules/roles/entities/role.entity';
import { RoleMenu } from './src/modules/role-menus/entities/role-menu.entity';
import { Menu } from './src/modules/menus/entities/menu.entity';

async function checkAdminUser() {
  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    const userRepo = dataSource.getRepository(User);
    const userRoleRepo = dataSource.getRepository(UserRole);
    const roleRepo = dataSource.getRepository(Role);
    const roleMenuRepo = dataSource.getRepository(RoleMenu);
    const menuRepo = dataSource.getRepository(Menu);

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

    // 检查用户角色关联
    const userRoles = await userRoleRepo.find({
      where: { userId: adminUser.id },
      relations: ['role'],
    });

    console.log(`\n用户角色关联数量: ${userRoles.length}`);
    if (userRoles.length > 0) {
      userRoles.forEach((ur) => {
        console.log(`  - 角色ID: ${ur.roleId}, 角色: ${ur.role?.name || 'N/A'}`);
      });
    } else {
      console.log('❌ admin 用户没有分配角色！');
    }

    // 检查管理员角色
    const adminRole = await roleRepo.findOne({
      where: { code: 'admin' },
    });

    if (adminRole) {
      console.log(`\n✅ 找到管理员角色: ${adminRole.name} (${adminRole.code})`);

      // 检查角色菜单关联
      const roleMenus = await roleMenuRepo.find({
        where: { roleId: adminRole.id },
        relations: ['menu'],
      });

      console.log(`\n管理员角色菜单数量: ${roleMenus.length}`);
      const permissionsMenu = roleMenus.find((rm) => rm.menu?.code === 'menu:system:permissions');
      if (permissionsMenu) {
        console.log('✅ 权限管理菜单已分配给管理员角色:', {
          menuId: permissionsMenu.menuId,
          menuName: permissionsMenu.menu?.name,
          menuTitle: permissionsMenu.menu?.title,
          menuPath: permissionsMenu.menu?.path,
          permissionCode: permissionsMenu.menu?.permissionCode,
        });
      } else {
        console.log('❌ 权限管理菜单未分配给管理员角色！');
      }
    } else {
      console.log('❌ 未找到管理员角色！');
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 检查失败:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

checkAdminUser();
