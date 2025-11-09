/**
 * 修复审计日志菜单图标
 * 将 FileSearch 改为 SearchOutlined
 */

import dataSource from '../data-source';
import { Menu } from '@/modules/menus/entities/menu.entity';

async function fixAuditLogsIcon() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功');

    const menuRepo = dataSource.getRepository(Menu);

    // 查找审计日志菜单
    const auditLogsMenu = await menuRepo.findOne({
      where: { code: 'menu:system:audit-logs' },
    });

    if (!auditLogsMenu) {
      console.log('⚠️  未找到审计日志菜单，请先运行 seed:audit-logs 或 seed:permission');
      await dataSource.destroy();
      return;
    }

    // 更新图标
    if (auditLogsMenu.icon === 'FileSearch' || auditLogsMenu.icon === 'file-search') {
      auditLogsMenu.icon = 'SearchOutlined';
      await menuRepo.save(auditLogsMenu);
      console.log('✅ 已更新审计日志菜单图标为 SearchOutlined');
    } else {
      console.log(`✅ 审计日志菜单图标已经是 ${auditLogsMenu.icon}，无需更新`);
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 执行失败:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// 执行脚本
fixAuditLogsIcon();

