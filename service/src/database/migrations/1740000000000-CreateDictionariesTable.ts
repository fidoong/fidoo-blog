import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDictionariesTable1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建 dictionaries 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS dictionaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(100) NOT NULL,
        type VARCHAR(20) DEFAULT 'dict',
        parent_id UUID,
        label VARCHAR(200),
        value VARCHAR(200),
        extra JSONB,
        sort_order INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'enabled',
        description TEXT,
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT FK_dictionaries_parent_id FOREIGN KEY (parent_id) REFERENCES dictionaries(id) ON DELETE CASCADE,
        CONSTRAINT UQ_dictionaries_code_value UNIQUE (code, value)
      );
    `);

    // 创建索引
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_dictionaries_parent_id_sort ON dictionaries(parent_id, sort_order);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_dictionaries_code_type ON dictionaries(code, type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_dictionaries_code ON dictionaries(code);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除索引
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_dictionaries_code;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_dictionaries_code_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS IDX_dictionaries_parent_id_sort;`);

    // 删除表
    await queryRunner.query(`DROP TABLE IF EXISTS dictionaries CASCADE;`);
  }
}
