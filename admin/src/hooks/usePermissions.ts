import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';
import type { Menu } from '@/lib/api/menus';

export function useUserPermissions() {
  return useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const response = await authApi.getPermissions();
      // 确保返回的是数组
      let data = response.data;

      // 如果 response.data 不是数组，可能是嵌套结构，尝试访问 response.data.data
      if (!Array.isArray(data) && data && typeof data === 'object' && 'data' in data) {
        data = (data as { data: string[] }).data;
      }

      // 确保返回数组
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
}

export function useUserMenus() {
  return useQuery({
    queryKey: ['user-menus'],
    queryFn: async () => {
      const response = await authApi.getMenus();
      // response 是 ApiResponse<Menu[]>，所以 response.data 是菜单数组
      // 但如果 response 本身已经是 { code, data, message }，则需要访问 response.data
      let data = response.data;

      // 如果 response.data 不是数组，可能是嵌套结构，尝试访问 response.data.data
      if (!Array.isArray(data) && data && typeof data === 'object' && 'data' in data) {
        data = (data as { data: Menu[] }).data;
      }

      // 调试：打印菜单数据
      if (process.env.NODE_ENV === 'development') {
        console.log('[useUserMenus] 菜单数据:', {
          total: Array.isArray(data) ? data.length : 0,
          menus: Array.isArray(data)
            ? data.map((m) => ({ name: m.name, title: m.title, path: m.path }))
            : [],
        });
      }

      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
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
