import dataSource from './data-source';

async function revertMigration() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功');

    console.log('正在回滚最后一次迁移...');
    await dataSource.undoLastMigration();
    console.log('✅ 迁移回滚成功');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移回滚失败:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

revertMigration();
