import dataSource from '../data-source';
import { Menu, MenuType, MenuStatus } from '@/modules/menus/entities/menu.entity';
import {
  Permission,
  PermissionType,
  PermissionStatus,
} from '@/modules/permissions/entities/permission.entity';
import { Role, RoleStatus } from '@/modules/roles/entities/role.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { RolePermission } from '@/modules/role-permissions/entities/role-permission.entity';
import { RoleMenu } from '@/modules/role-menus/entities/role-menu.entity';
import { User, UserRoleEnum } from '@/modules/users/entities/user.entity';

async function initPermissionSystem() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功');

    const menuRepo = dataSource.getRepository(Menu);
    const permissionRepo = dataSource.getRepository(Permission);
    const roleRepo = dataSource.getRepository(Role);
    const userRepo = dataSource.getRepository(User);
    const userRoleRepo = dataSource.getRepository(UserRole);
    const rolePermissionRepo = dataSource.getRepository(RolePermission);
    const roleMenuRepo = dataSource.getRepository(RoleMenu);

    // 0. 清理现有权限系统数据（按依赖关系逆序删除）
    console.log('清理现有权限系统数据...');
    try {
      // 先删除关联表
      await dataSource.query('TRUNCATE TABLE role_menus CASCADE');
      await dataSource.query('TRUNCATE TABLE role_permissions CASCADE');
      await dataSource.query('TRUNCATE TABLE user_roles CASCADE');
      // 再删除主表
      await dataSource.query('TRUNCATE TABLE menus CASCADE');
      await dataSource.query('TRUNCATE TABLE permissions CASCADE');
      await dataSource.query('TRUNCATE TABLE roles CASCADE');
      console.log('✅ 清理完成');
    } catch (error) {
      console.log('⚠️  清理数据时出现错误（可能表不存在），继续执行...', error);
    }

    // 1. 创建完整权限列表
    console.log('创建完整权限列表...');
    const permissions: Permission[] = [];

    // ========== 系统管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '系统管理',
        code: 'system:manage',
        type: PermissionType.MENU,
        status: PermissionStatus.ENABLED,
        description: '系统管理菜单权限',
        sortOrder: 1,
      }),
      permissionRepo.create({
        name: '系统信息查看',
        code: 'system:info:view',
        type: PermissionType.API,
        resource: 'system',
        action: 'info',
        path: '/api/v1/system/info',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看系统信息',
        sortOrder: 2,
      }),
    );

    // ========== 用户管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '用户查看',
        code: 'users:view',
        type: PermissionType.API,
        resource: 'users',
        action: 'view',
        path: '/api/v1/users',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看用户列表',
        sortOrder: 10,
      }),
      permissionRepo.create({
        name: '用户创建',
        code: 'users:create',
        type: PermissionType.API,
        resource: 'users',
        action: 'create',
        path: '/api/v1/users',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建用户',
        sortOrder: 11,
      }),
      permissionRepo.create({
        name: '用户更新',
        code: 'users:update',
        type: PermissionType.API,
        resource: 'users',
        action: 'update',
        path: '/api/v1/users/:id/update',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '更新用户信息',
        sortOrder: 12,
      }),
      permissionRepo.create({
        name: '用户删除',
        code: 'users:delete',
        type: PermissionType.API,
        resource: 'users',
        action: 'delete',
        path: '/api/v1/users/:id/delete',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '删除用户',
        sortOrder: 13,
      }),
    );

    // ========== 文章管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '文章查看',
        code: 'posts:view',
        type: PermissionType.API,
        resource: 'posts',
        action: 'view',
        path: '/api/v1/posts',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看文章列表',
        sortOrder: 20,
      }),
      permissionRepo.create({
        name: '文章创建',
        code: 'posts:create',
        type: PermissionType.API,
        resource: 'posts',
        action: 'create',
        path: '/api/v1/posts',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建文章',
        sortOrder: 21,
      }),
      permissionRepo.create({
        name: '文章更新',
        code: 'posts:update',
        type: PermissionType.API,
        resource: 'posts',
        action: 'update',
        path: '/api/v1/posts/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新文章',
        sortOrder: 22,
      }),
      permissionRepo.create({
        name: '文章删除',
        code: 'posts:delete',
        type: PermissionType.API,
        resource: 'posts',
        action: 'delete',
        path: '/api/v1/posts/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除文章',
        sortOrder: 23,
      }),
      permissionRepo.create({
        name: '文章发布',
        code: 'posts:publish',
        type: PermissionType.BUTTON,
        resource: 'posts',
        action: 'publish',
        status: PermissionStatus.ENABLED,
        description: '发布文章按钮权限',
        sortOrder: 24,
      }),
    );

    // ========== 分类管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '分类查看',
        code: 'categories:view',
        type: PermissionType.API,
        resource: 'categories',
        action: 'view',
        path: '/api/v1/categories',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看分类列表',
        sortOrder: 30,
      }),
      permissionRepo.create({
        name: '分类创建',
        code: 'categories:create',
        type: PermissionType.API,
        resource: 'categories',
        action: 'create',
        path: '/api/v1/categories',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建分类',
        sortOrder: 31,
      }),
      permissionRepo.create({
        name: '分类更新',
        code: 'categories:update',
        type: PermissionType.API,
        resource: 'categories',
        action: 'update',
        path: '/api/v1/categories/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新分类',
        sortOrder: 32,
      }),
      permissionRepo.create({
        name: '分类删除',
        code: 'categories:delete',
        type: PermissionType.API,
        resource: 'categories',
        action: 'delete',
        path: '/api/v1/categories/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除分类',
        sortOrder: 33,
      }),
    );

    // ========== 标签管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '标签查看',
        code: 'tags:view',
        type: PermissionType.API,
        resource: 'tags',
        action: 'view',
        path: '/api/v1/tags',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看标签列表',
        sortOrder: 40,
      }),
      permissionRepo.create({
        name: '标签创建',
        code: 'tags:create',
        type: PermissionType.API,
        resource: 'tags',
        action: 'create',
        path: '/api/v1/tags',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建标签',
        sortOrder: 41,
      }),
      permissionRepo.create({
        name: '标签更新',
        code: 'tags:update',
        type: PermissionType.API,
        resource: 'tags',
        action: 'update',
        path: '/api/v1/tags/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新标签',
        sortOrder: 42,
      }),
      permissionRepo.create({
        name: '标签删除',
        code: 'tags:delete',
        type: PermissionType.API,
        resource: 'tags',
        action: 'delete',
        path: '/api/v1/tags/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除标签',
        sortOrder: 43,
      }),
    );

    // ========== 评论管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '评论查看',
        code: 'comments:view',
        type: PermissionType.API,
        resource: 'comments',
        action: 'view',
        path: '/api/v1/comments',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看评论列表',
        sortOrder: 50,
      }),
      permissionRepo.create({
        name: '评论创建',
        code: 'comments:create',
        type: PermissionType.API,
        resource: 'comments',
        action: 'create',
        path: '/api/v1/comments',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建评论',
        sortOrder: 51,
      }),
      permissionRepo.create({
        name: '评论更新',
        code: 'comments:update',
        type: PermissionType.API,
        resource: 'comments',
        action: 'update',
        path: '/api/v1/comments/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新评论',
        sortOrder: 52,
      }),
      permissionRepo.create({
        name: '评论删除',
        code: 'comments:delete',
        type: PermissionType.API,
        resource: 'comments',
        action: 'delete',
        path: '/api/v1/comments/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除评论',
        sortOrder: 53,
      }),
      permissionRepo.create({
        name: '评论审核',
        code: 'comments:approve',
        type: PermissionType.BUTTON,
        resource: 'comments',
        action: 'approve',
        status: PermissionStatus.ENABLED,
        description: '审核评论按钮权限',
        sortOrder: 54,
      }),
    );

    // ========== 媒体管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '媒体查看',
        code: 'media:view',
        type: PermissionType.API,
        resource: 'media',
        action: 'view',
        path: '/api/v1/media',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看媒体列表',
        sortOrder: 60,
      }),
      permissionRepo.create({
        name: '媒体上传',
        code: 'media:upload',
        type: PermissionType.API,
        resource: 'media',
        action: 'upload',
        path: '/api/v1/media/upload',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '上传媒体文件',
        sortOrder: 61,
      }),
      permissionRepo.create({
        name: '媒体删除',
        code: 'media:delete',
        type: PermissionType.API,
        resource: 'media',
        action: 'delete',
        path: '/api/v1/media/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除媒体文件',
        sortOrder: 62,
      }),
    );

    // ========== 菜单管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '菜单查看',
        code: 'menus:view',
        type: PermissionType.API,
        resource: 'menus',
        action: 'view',
        path: '/api/v1/menus',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看菜单列表',
        sortOrder: 70,
      }),
      permissionRepo.create({
        name: '菜单创建',
        code: 'menus:create',
        type: PermissionType.API,
        resource: 'menus',
        action: 'create',
        path: '/api/v1/menus',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建菜单',
        sortOrder: 71,
      }),
      permissionRepo.create({
        name: '菜单更新',
        code: 'menus:update',
        type: PermissionType.API,
        resource: 'menus',
        action: 'update',
        path: '/api/v1/menus/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新菜单',
        sortOrder: 72,
      }),
      permissionRepo.create({
        name: '菜单删除',
        code: 'menus:delete',
        type: PermissionType.API,
        resource: 'menus',
        action: 'delete',
        path: '/api/v1/menus/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除菜单',
        sortOrder: 73,
      }),
    );

    // ========== 权限管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '权限查看',
        code: 'permissions:view',
        type: PermissionType.API,
        resource: 'permissions',
        action: 'view',
        path: '/api/v1/permissions',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看权限列表',
        sortOrder: 80,
      }),
      permissionRepo.create({
        name: '权限创建',
        code: 'permissions:create',
        type: PermissionType.API,
        resource: 'permissions',
        action: 'create',
        path: '/api/v1/permissions',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建权限',
        sortOrder: 81,
      }),
      permissionRepo.create({
        name: '权限更新',
        code: 'permissions:update',
        type: PermissionType.API,
        resource: 'permissions',
        action: 'update',
        path: '/api/v1/permissions/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新权限',
        sortOrder: 82,
      }),
      permissionRepo.create({
        name: '权限删除',
        code: 'permissions:delete',
        type: PermissionType.API,
        resource: 'permissions',
        action: 'delete',
        path: '/api/v1/permissions/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除权限',
        sortOrder: 83,
      }),
    );

    // ========== 角色管理权限 ==========
    permissions.push(
      permissionRepo.create({
        name: '角色查看',
        code: 'roles:view',
        type: PermissionType.API,
        resource: 'roles',
        action: 'view',
        path: '/api/v1/roles',
        method: 'GET',
        status: PermissionStatus.ENABLED,
        description: '查看角色列表',
        sortOrder: 90,
      }),
      permissionRepo.create({
        name: '角色创建',
        code: 'roles:create',
        type: PermissionType.API,
        resource: 'roles',
        action: 'create',
        path: '/api/v1/roles',
        method: 'POST',
        status: PermissionStatus.ENABLED,
        description: '创建角色',
        sortOrder: 91,
      }),
      permissionRepo.create({
        name: '角色更新',
        code: 'roles:update',
        type: PermissionType.API,
        resource: 'roles',
        action: 'update',
        path: '/api/v1/roles/:id',
        method: 'PUT',
        status: PermissionStatus.ENABLED,
        description: '更新角色',
        sortOrder: 92,
      }),
      permissionRepo.create({
        name: '角色删除',
        code: 'roles:delete',
        type: PermissionType.API,
        resource: 'roles',
        action: 'delete',
        path: '/api/v1/roles/:id',
        method: 'DELETE',
        status: PermissionStatus.ENABLED,
        description: '删除角色',
        sortOrder: 93,
      }),
      permissionRepo.create({
        name: '角色权限分配',
        code: 'roles:assign:permissions',
        type: PermissionType.BUTTON,
        resource: 'roles',
        action: 'assign:permissions',
        status: PermissionStatus.ENABLED,
        description: '为角色分配权限按钮',
        sortOrder: 94,
      }),
      permissionRepo.create({
        name: '角色菜单分配',
        code: 'roles:assign:menus',
        type: PermissionType.BUTTON,
        resource: 'roles',
        action: 'assign:menus',
        status: PermissionStatus.ENABLED,
        description: '为角色分配菜单按钮',
        sortOrder: 95,
      }),
    );

    const savedPermissions = await permissionRepo.save(permissions);
    console.log(`✅ 创建了 ${savedPermissions.length} 个权限`);

    // 2. 创建完整菜单树（分步创建，确保 parentId 关联正确）
    console.log('创建完整菜单树...');

    // 第一步：创建并保存所有父菜单（顶级菜单）
    const rootMenus: Menu[] = [];

    // 仪表盘
    const dashboardMenu = menuRepo.create({
      name: 'dashboard',
      title: '仪表盘',
      path: '/dashboard',
      component: 'dashboard',
      icon: 'LayoutDashboard',
      code: 'menu:dashboard',
      type: MenuType.MENU,
      sortOrder: 1,
      status: MenuStatus.ENABLED,
      description: '系统仪表盘',
    });
    rootMenus.push(dashboardMenu);

    // 内容管理（父菜单）
    const contentMenu = menuRepo.create({
      name: 'content',
      title: '内容管理',
      path: '/content',
      component: 'content',
      icon: 'FileText',
      code: 'menu:content',
      type: MenuType.MENU,
      sortOrder: 2,
      status: MenuStatus.ENABLED,
      description: '内容管理模块',
    });
    rootMenus.push(contentMenu);

    // 用户管理
    const usersMenu = menuRepo.create({
      name: 'users',
      title: '用户管理',
      path: '/users',
      component: 'users',
      icon: 'Users',
      code: 'menu:users',
      type: MenuType.MENU,
      sortOrder: 3,
      status: MenuStatus.ENABLED,
      permissionCode: 'users:view',
      description: '管理用户',
    });
    rootMenus.push(usersMenu);

    // 媒体管理
    const mediaMenu = menuRepo.create({
      name: 'media',
      title: '媒体管理',
      path: '/media',
      component: 'media',
      icon: 'Image',
      code: 'menu:media',
      type: MenuType.MENU,
      sortOrder: 4,
      status: MenuStatus.ENABLED,
      permissionCode: 'media:view',
      description: '管理媒体文件',
    });
    rootMenus.push(mediaMenu);

    // 系统管理（父菜单）
    const systemMenu = menuRepo.create({
      name: 'system',
      title: '系统管理',
      path: '/system',
      component: 'system',
      icon: 'Settings',
      code: 'menu:system',
      type: MenuType.MENU,
      sortOrder: 5,
      status: MenuStatus.ENABLED,
      permissionCode: 'system:manage',
      description: '系统管理模块',
    });
    rootMenus.push(systemMenu);

    // 保存父菜单，获取真实的 ID
    const savedRootMenus = await menuRepo.save(rootMenus);
    console.log(`✅ 创建了 ${savedRootMenus.length} 个父菜单`);

    // 找到保存后的父菜单 ID（用于子菜单关联）
    const contentMenuId = savedRootMenus.find((m) => m.code === 'menu:content')!.id;
    const systemMenuId = savedRootMenus.find((m) => m.code === 'menu:system')!.id;

    // 第二步：创建子菜单（使用保存后的父菜单 ID）
    const childMenus: Menu[] = [];

    // 内容管理的子菜单
    childMenus.push(
      menuRepo.create({
        name: 'posts',
        title: '文章管理',
        path: '/posts',
        component: 'posts',
        icon: 'FileText',
        code: 'menu:posts',
        type: MenuType.MENU,
        parentId: contentMenuId,
        sortOrder: 1,
        status: MenuStatus.ENABLED,
        permissionCode: 'posts:view',
        description: '管理文章',
      }),
    );

    childMenus.push(
      menuRepo.create({
        name: 'categories',
        title: '分类管理',
        path: '/categories',
        component: 'categories',
        icon: 'FolderTree',
        code: 'menu:categories',
        type: MenuType.MENU,
        parentId: contentMenuId,
        sortOrder: 2,
        status: MenuStatus.ENABLED,
        permissionCode: 'categories:view',
        description: '管理分类',
      }),
    );

    childMenus.push(
      menuRepo.create({
        name: 'tags',
        title: '标签管理',
        path: '/tags',
        component: 'tags',
        icon: 'Tag',
        code: 'menu:tags',
        type: MenuType.MENU,
        parentId: contentMenuId,
        sortOrder: 3,
        status: MenuStatus.ENABLED,
        permissionCode: 'tags:view',
        description: '管理标签',
      }),
    );

    childMenus.push(
      menuRepo.create({
        name: 'comments',
        title: '评论管理',
        path: '/comments',
        component: 'comments',
        icon: 'MessageSquare',
        code: 'menu:comments',
        type: MenuType.MENU,
        parentId: contentMenuId,
        sortOrder: 4,
        status: MenuStatus.ENABLED,
        permissionCode: 'comments:view',
        description: '管理评论',
      }),
    );

    // 系统管理的子菜单
    childMenus.push(
      menuRepo.create({
        name: 'menus',
        title: '菜单管理',
        path: '/system/menus',
        component: 'system/menus',
        icon: 'Menu',
        code: 'menu:system:menus',
        type: MenuType.MENU,
        parentId: systemMenuId,
        sortOrder: 1,
        status: MenuStatus.ENABLED,
        permissionCode: 'menus:view',
        description: '管理系统菜单',
      }),
    );

    childMenus.push(
      menuRepo.create({
        name: 'permissions',
        title: '权限管理',
        path: '/system/permissions',
        component: 'system/permissions',
        icon: 'Shield',
        code: 'menu:system:permissions',
        type: MenuType.MENU,
        parentId: systemMenuId,
        sortOrder: 2,
        status: MenuStatus.ENABLED,
        permissionCode: 'permissions:view',
        description: '管理系统权限',
      }),
    );

    childMenus.push(
      menuRepo.create({
        name: 'roles',
        title: '角色管理',
        path: '/system/roles',
        component: 'system/roles',
        icon: 'UserCog',
        code: 'menu:system:roles',
        type: MenuType.MENU,
        parentId: systemMenuId,
        sortOrder: 3,
        status: MenuStatus.ENABLED,
        permissionCode: 'roles:view',
        description: '管理系统角色',
      }),
    );

    childMenus.push(
      menuRepo.create({
        name: 'system-info',
        title: '系统信息',
        path: '/system/info',
        component: 'system/info',
        icon: 'Info',
        code: 'menu:system:info',
        type: MenuType.MENU,
        parentId: systemMenuId,
        sortOrder: 4,
        status: MenuStatus.ENABLED,
        permissionCode: 'system:info:view',
        description: '查看系统信息',
      }),
    );

    // 保存子菜单
    const savedChildMenus = await menuRepo.save(childMenus);
    console.log(`✅ 创建了 ${savedChildMenus.length} 个子菜单`);

    // 合并所有菜单用于后续操作
    const savedMenus = [...savedRootMenus, ...savedChildMenus];
    console.log(`✅ 总共创建了 ${savedMenus.length} 个菜单`);

    // 3. 创建系统角色
    console.log('创建系统角色...');
    const adminRole = roleRepo.create({
      name: '管理员',
      code: 'admin',
      status: RoleStatus.ENABLED,
      description: '系统管理员，拥有所有权限',
      isSystem: true,
      sortOrder: 1,
    });

    const editorRole = roleRepo.create({
      name: '编辑',
      code: 'editor',
      status: RoleStatus.ENABLED,
      description: '内容编辑，可以管理文章、分类、标签、评论',
      isSystem: true,
      sortOrder: 2,
    });

    const userRole = roleRepo.create({
      name: '普通用户',
      code: 'user',
      status: RoleStatus.ENABLED,
      description: '普通用户，只能查看内容',
      isSystem: true,
      sortOrder: 3,
    });

    const savedRoles = await roleRepo.save([adminRole, editorRole, userRole]);
    console.log(`✅ 创建了 ${savedRoles.length} 个角色`);

    // 4. 为管理员角色分配所有权限和菜单
    console.log('为管理员角色分配权限和菜单...');
    const adminRolePermissions = savedPermissions.map((permission) =>
      rolePermissionRepo.create({
        roleId: adminRole.id,
        permissionId: permission.id,
      }),
    );
    await rolePermissionRepo.save(adminRolePermissions);

    const adminRoleMenus = savedMenus.map((menu) =>
      roleMenuRepo.create({
        roleId: adminRole.id,
        menuId: menu.id,
      }),
    );
    await roleMenuRepo.save(adminRoleMenus);
    console.log('✅ 管理员角色权限和菜单分配完成');

    // 5. 为编辑角色分配权限
    console.log('为编辑角色分配权限...');
    const editorPermissions = savedPermissions.filter(
      (p) =>
        p.code.startsWith('posts:') ||
        p.code.startsWith('categories:') ||
        p.code.startsWith('tags:') ||
        p.code.startsWith('comments:') ||
        p.code.startsWith('media:') ||
        p.code === 'menus:view',
    );
    const editorRolePermissions = editorPermissions.map((permission) =>
      rolePermissionRepo.create({
        roleId: editorRole.id,
        permissionId: permission.id,
      }),
    );
    await rolePermissionRepo.save(editorRolePermissions);

    const editorMenus = savedMenus.filter(
      (m) =>
        m.code === 'menu:dashboard' ||
        m.code === 'menu:content' ||
        m.code === 'menu:posts' ||
        m.code === 'menu:categories' ||
        m.code === 'menu:tags' ||
        m.code === 'menu:comments' ||
        m.code === 'menu:media',
    );
    const editorRoleMenus = editorMenus.map((menu) =>
      roleMenuRepo.create({
        roleId: editorRole.id,
        menuId: menu.id,
      }),
    );
    await roleMenuRepo.save(editorRoleMenus);
    console.log('✅ 编辑角色权限和菜单分配完成');

    // 6. 为普通用户角色分配查看权限
    console.log('为普通用户角色分配权限...');
    const userPermissions = savedPermissions.filter(
      (p) =>
        p.code === 'posts:view' ||
        p.code === 'categories:view' ||
        p.code === 'tags:view' ||
        p.code === 'comments:view' ||
        p.code === 'comments:create',
    );
    const userRolePermissions = userPermissions.map((permission) =>
      rolePermissionRepo.create({
        roleId: userRole.id,
        permissionId: permission.id,
      }),
    );
    await rolePermissionRepo.save(userRolePermissions);

    const userMenus = savedMenus.filter(
      (m) =>
        m.code === 'menu:dashboard' ||
        m.code === 'menu:content' ||
        m.code === 'menu:posts' ||
        m.code === 'menu:categories' ||
        m.code === 'menu:tags',
    );
    const userRoleMenus = userMenus.map((menu) =>
      roleMenuRepo.create({
        roleId: userRole.id,
        menuId: menu.id,
      }),
    );
    await roleMenuRepo.save(userRoleMenus);
    console.log('✅ 普通用户角色权限和菜单分配完成');

    // 7. 为现有用户分配角色
    console.log('为现有用户分配角色...');
    const adminUsers = await userRepo.find({
      where: { role: UserRoleEnum.ADMIN },
    });

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
      }
    }
    console.log(`✅ 为 ${adminUsers.length} 个管理员用户分配了角色`);

    const editorUsers = await userRepo.find({
      where: { role: UserRoleEnum.EDITOR },
    });

    for (const user of editorUsers) {
      const existing = await userRoleRepo.findOne({
        where: { userId: user.id, roleId: editorRole.id },
      });
      if (!existing) {
        await userRoleRepo.save(
          userRoleRepo.create({
            userId: user.id,
            roleId: editorRole.id,
          }),
        );
      }
    }
    console.log(`✅ 为 ${editorUsers.length} 个编辑用户分配了角色`);

    const normalUsers = await userRepo.find({
      where: { role: UserRoleEnum.USER },
    });

    for (const user of normalUsers) {
      const existing = await userRoleRepo.findOne({
        where: { userId: user.id, roleId: userRole.id },
      });
      if (!existing) {
        await userRoleRepo.save(
          userRoleRepo.create({
            userId: user.id,
            roleId: userRole.id,
          }),
        );
      }
    }
    console.log(`✅ 为 ${normalUsers.length} 个普通用户分配了角色`);

    console.log('✅ 权限系统初始化完成！');
    console.log(`- 权限: ${savedPermissions.length} 个`);
    console.log(`- 菜单: ${savedMenus.length} 个`);
    console.log(`- 角色: ${savedRoles.length} 个`);
    console.log(`- 管理员权限: ${adminRolePermissions.length} 个`);
    console.log(`- 编辑权限: ${editorRolePermissions.length} 个`);
    console.log(`- 普通用户权限: ${userRolePermissions.length} 个`);

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

initPermissionSystem();
