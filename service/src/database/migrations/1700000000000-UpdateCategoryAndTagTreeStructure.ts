import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCategoryAndTagTreeStructure1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 更新 categories 表
    // 1. 移除 name 的唯一约束（因为现在可以有同名的子分类）
    await queryRunner.query(`
      ALTER TABLE categories
      DROP CONSTRAINT IF EXISTS "UQ_categories_name";
    `);

    // 2. 添加 parent_id 列
    await queryRunner.query(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS parent_id UUID;
    `);

    // 3. 添加 level 列
    await queryRunner.query(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;
    `);

    // 4. 添加 icon 列
    await queryRunner.query(`
      ALTER TABLE categories
      ADD COLUMN IF NOT EXISTS icon VARCHAR(100);
    `);

    // 5. 添加 parent_id 索引
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_categories_parent_id"
      ON categories(parent_id);
    `);

    // 6. 添加外键约束
    await queryRunner.query(`
      ALTER TABLE categories
      ADD CONSTRAINT "FK_categories_parent_id"
      FOREIGN KEY (parent_id)
      REFERENCES categories(id)
      ON DELETE CASCADE;
    `);

    // 更新 tags 表
    // 1. 添加 category_id 列
    await queryRunner.query(`
      ALTER TABLE tags
      ADD COLUMN IF NOT EXISTS category_id UUID;
    `);

    // 2. 添加 category_id 索引
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tags_category_id"
      ON tags(category_id);
    `);

    // 3. 添加外键约束
    await queryRunner.query(`
      ALTER TABLE tags
      ADD CONSTRAINT "FK_tags_category_id"
      FOREIGN KEY (category_id)
      REFERENCES categories(id)
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚 tags 表
    await queryRunner.query(`
      ALTER TABLE tags
      DROP CONSTRAINT IF EXISTS "FK_tags_category_id";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_tags_category_id";
    `);
    await queryRunner.query(`
      ALTER TABLE tags
      DROP COLUMN IF EXISTS category_id;
    `);

    // 回滚 categories 表
    await queryRunner.query(`
      ALTER TABLE categories
      DROP CONSTRAINT IF EXISTS "FK_categories_parent_id";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_categories_parent_id";
    `);
    await queryRunner.query(`
      ALTER TABLE categories
      DROP COLUMN IF EXISTS icon;
    `);
    await queryRunner.query(`
      ALTER TABLE categories
      DROP COLUMN IF EXISTS level;
    `);
    await queryRunner.query(`
      ALTER TABLE categories
      DROP COLUMN IF EXISTS parent_id;
    `);
    // 恢复 name 的唯一约束（如果需要）
    await queryRunner.query(`
      ALTER TABLE categories
      ADD CONSTRAINT IF NOT EXISTS "UQ_categories_name"
      UNIQUE (name);
    `);
  }
}
