import { DataSource } from 'typeorm';
import dataSource from './data-source';

async function runMigrations() {
  try {
    console.log('正在连接数据库...');
    await dataSource.initialize();
    console.log('数据库连接成功');

    console.log('正在运行迁移...');
    const migrations = await dataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('✅ 没有待执行的迁移');
    } else {
      console.log(`✅ 成功执行 ${migrations.length} 个迁移:`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runMigrations();

