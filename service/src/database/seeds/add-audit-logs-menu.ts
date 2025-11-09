/**
 * 添加审计日志菜单和权限脚本
 * 用于在现有权限系统中添加审计日志相关的菜单和权限
 */

import dataSource from '../data-source';
import { Menu, MenuType, MenuStatus } from '@/modules/menus/entities/menu.entity';
import {
  Permission,
  PermissionType,
  PermissionStatus,
} from '@/modules/permissions/entities/permission.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';
import { Role } from '@/modules/roles/entities/role.entity';

async function addAuditLogsMenu() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功');

    const menuRepo = dataSource.getRepository(Menu);
    const permissionRepo = dataSource.getRepository(Permission);
    const roleRepo = dataSource.getRepository(Role);
    const rolePermissionRepo = dataSource.getRepository(RolePermission);
    const roleMenuRepo = dataSource.getRepository(RoleMenu);

    // 1. 创建审计日志相关权限
    console.log('创建审计日志权限...');
    const auditLogsPermissions: Permission[] = [];

    auditLogsPermissions.push(
      permissionRepo.create({
        name: '审计日志查看',
        code: 'audit-logs:view',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'view',
        path: '/api/v1/audit-logs',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看审计日志列表',
        sortOrder: 600,
      }),
      permissionRepo.create({
        name: '审计日志查询',
        code: 'audit-logs:query',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'query',
        path: '/api/v1/audit-logs',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查询审计日志（支持多种过滤条件）',
        sortOrder: 601,
      }),
      permissionRepo.create({
        name: '异常日志查看',
        code: 'audit-logs:anomalies:view',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'anomalies',
        path: '/api/v1/audit-logs/anomalies',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看异常日志',
        sortOrder: 602,
      }),
      permissionRepo.create({
        name: '用户操作历史查看',
        code: 'audit-logs:user:view',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'user-logs',
        path: '/api/v1/audit-logs/user/:userId',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看用户操作历史',
        sortOrder: 603,
      }),
      permissionRepo.create({
        name: 'IP 操作历史查看',
        code: 'audit-logs:ip:view',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'ip-logs',
        path: '/api/v1/audit-logs/ip/:ip',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看 IP 操作历史',
        sortOrder: 604,
      }),
      permissionRepo.create({
        name: '追踪 ID 查询',
        code: 'audit-logs:trace:view',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'trace',
        path: '/api/v1/audit-logs/trace/:traceId',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '根据追踪 ID 查询日志',
        sortOrder: 605,
      }),
      permissionRepo.create({
        name: '操作统计查看',
        code: 'audit-logs:stats:view',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'stats',
        path: '/api/v1/audit-logs/stats/**',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看操作统计',
        sortOrder: 606,
      }),
      permissionRepo.create({
        name: '清理过期日志',
        code: 'audit-logs:clean',
        type: PermissionType.API,
        resource: 'audit-logs',
        action: 'clean',
        path: '/api/v1/audit-logs/clean',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '清理过期审计日志',
        sortOrder: 607,
      }),
    );

    // 检查权限是否已存在
    const existingPermissionCodes = await permissionRepo.find({
      where: auditLogsPermissions.map((p) => ({ code: p.code })),
    });
    const existingCodes = new Set(existingPermissionCodes.map((p) => p.code));

    const newPermissions = auditLogsPermissions.filter((p) => !existingCodes.has(p.code));
    if (newPermissions.length > 0) {
      const savedPermissions = await permissionRepo.save(newPermissions);
      console.log(`✅ 创建了 ${savedPermissions.length} 个审计日志权限`);
    } else {
      console.log('✅ 审计日志权限已存在，跳过创建');
    }

    // 2. 查找系统管理菜单
    const systemMenu = await menuRepo.findOne({
      where: { code: 'menu:system' },
    });

    if (!systemMenu) {
      console.error('❌ 未找到系统管理菜单，请先运行 init-permission-system.ts');
      await dataSource.destroy();
      return;
    }

    // 3. 创建审计日志菜单
    console.log('创建审计日志菜单...');
    const existingAuditLogsMenu = await menuRepo.findOne({
      where: { code: 'menu:system:audit-logs' },
    });

    if (existingAuditLogsMenu) {
      console.log('✅ 审计日志菜单已存在，跳过创建');
    } else {
      // 查找系统管理下最大的 sortOrder
      const maxSortOrder = await menuRepo
        .createQueryBuilder('menu')
        .where('menu.parentId = :parentId', { parentId: systemMenu.id })
        .select('MAX(menu.sortOrder)', 'max')
        .getRawOne();

      const nextSortOrder = (maxSortOrder?.max || 0) + 1;

      const auditLogsMenu = menuRepo.create({
        name: 'audit-logs',
        title: '审计日志',
        path: '/system/audit-logs',
        component: 'system/audit-logs',
        icon: 'FileSearch',
        code: 'menu:system:audit-logs',
        type: MenuType.MENU,
        parentId: systemMenu.id,
        sortOrder: nextSortOrder,
        status: MenuStatus.ENABLED,
        permissionCode: 'audit-logs:view',
        description: '查看和管理审计日志',
      });

      await menuRepo.save(auditLogsMenu);
      console.log('✅ 创建了审计日志菜单');
    }

    // 4. 为管理员角色分配审计日志权限和菜单
    console.log('为管理员角色分配审计日志权限...');
    const adminRole = await roleRepo.findOne({
      where: { code: 'admin' },
    });

    if (!adminRole) {
      console.error('❌ 未找到管理员角色');
      await dataSource.destroy();
      return;
    }

    // 获取所有审计日志权限
    const allAuditLogsPermissions = await permissionRepo.find({
      where: auditLogsPermissions.map((p) => ({ code: p.code })),
    });

    // 检查并创建角色权限关联
    for (const permission of allAuditLogsPermissions) {
      const existingRolePermission = await rolePermissionRepo.findOne({
        where: {
          role: { id: adminRole.id },
          permission: { id: permission.id },
        },
      });

      if (!existingRolePermission) {
        await rolePermissionRepo.save({
          role: adminRole,
          permission: permission,
        });
      }
    }

    // 检查并创建角色菜单关联
    const auditLogsMenu = await menuRepo.findOne({
      where: { code: 'menu:system:audit-logs' },
    });

    if (auditLogsMenu) {
      const existingRoleMenu = await roleMenuRepo.findOne({
        where: {
          role: { id: adminRole.id },
          menu: { id: auditLogsMenu.id },
        },
      });

      if (!existingRoleMenu) {
        await roleMenuRepo.save({
          role: adminRole,
          menu: auditLogsMenu,
        });
        console.log('✅ 为管理员角色分配了审计日志菜单');
      } else {
        console.log('✅ 管理员角色已拥有审计日志菜单权限');
      }
    }

    console.log('✅ 审计日志菜单和权限添加完成');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 执行失败:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// 执行脚本
addAuditLogsMenu();
