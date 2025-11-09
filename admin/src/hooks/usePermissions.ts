import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { Menu } from '@/lib/api/menus';

export function useUserPermissions() {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      return await authApi.getPermissions();
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}

export function useUserMenus() {
  return useQuery({
    queryKey: ['user-menus'],
    queryFn: async () => {
      try {
        const menus = await authApi.getMenus();

        // 调试：打印菜单数据
        if (process.env.NODE_ENV === 'development') {
          console.log('[useUserMenus] 菜单数据:', {
            total: Array.isArray(menus) ? menus.length : 0,
            type: typeof menus,
            isArray: Array.isArray(menus),
            menus: Array.isArray(menus)
              ? menus.map((m) => ({ id: m.id, name: m.name, title: m.title, path: m.path, parentId: m.parentId }))
              : [],
          });
        }

        // 确保返回数组
        if (!Array.isArray(menus)) {
          console.error('[useUserMenus] 菜单数据不是数组:', menus);
          return [];
        }

        return menus;
      } catch (error) {
        console.error('[useUserMenus] 获取菜单失败:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 1, // 失败时重试1次
  });
}

export function useHasPermission(permissionCode: string): boolean {
  const { data: permissions } = useUserPermissions();

  // 确保 permissions 是数组
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.includes(permissionCode);
}

/**
 * 检查用户是否有任意一个权限
 * @param permissionCodes 权限代码数组
 * @returns 如果用户有任意一个权限则返回 true
 */
export function useHasAnyPermission(permissionCodes: string[]): boolean {
  const { data: permissions } = useUserPermissions();

  // 确保 permissions 是数组
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  // 如果不需要任何权限，返回 true
  if (!permissionCodes || permissionCodes.length === 0) {
    return true;
  }

  return permissionCodes.some((code) => permissions.includes(code));
}

// 将菜单列表转换为树形结构
export function buildMenuTree(menus: Menu[] | undefined | null): Menu[] {
  // 确保 menus 是数组
  if (!menus || !Array.isArray(menus)) {
    return [];
  }

  const menuMap = new Map<string, Menu>();
  const rootMenus: Menu[] = [];

  // 创建菜单映射（深拷贝避免修改原数据）
  menus.forEach((menu) => {
    menuMap.set(menu.id, {
      ...menu,
      children: [],
    });
  });

  // 构建树形结构
  menus.forEach((menu) => {
    const menuNode = menuMap.get(menu.id)!;
    // 检查是否有父菜单ID，并且父菜单存在于菜单列表中
    if (menu.parentId && menuMap.has(menu.parentId)) {
      const parent = menuMap.get(menu.parentId)!;
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(menuNode);
    } else {
      // 没有父菜单或父菜单不在列表中，作为根菜单
      rootMenus.push(menuNode);
    }
  });

  // 排序
  const sortMenus = (menus: Menu[]) => {
    menus.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    menus.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });
  };

  sortMenus(rootMenus);
  return rootMenus;
}
