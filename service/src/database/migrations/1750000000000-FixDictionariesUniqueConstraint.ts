import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixDictionariesUniqueConstraint1750000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 检查是否存在旧的唯一约束
    const result = await queryRunner.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'dictionaries' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%code%';
    `);

    // 删除旧的 code 唯一约束（如果存在）
    if (result && result.length > 0) {
      for (const row of result) {
        try {
          await queryRunner.query(
            `ALTER TABLE dictionaries DROP CONSTRAINT IF EXISTS ${row.constraint_name};`,
          );
        } catch (error) {
          console.log(`约束 ${row.constraint_name} 可能不存在，跳过删除`);
        }
      }
    }

    // 添加新的组合唯一约束 (code, value)
    // 注意：如果 value 为 null，需要先处理
    await queryRunner.query(`
      DO $$
      BEGIN
        -- 确保所有记录的 value 不为 null
        UPDATE dictionaries 
        SET value = COALESCE(value, name, id::text) 
        WHERE value IS NULL;
        
        -- 添加组合唯一约束
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'UQ_dictionaries_code_value'
        ) THEN
          ALTER TABLE dictionaries 
          ADD CONSTRAINT UQ_dictionaries_code_value UNIQUE (code, value);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除组合唯一约束
    await queryRunner.query(`
      ALTER TABLE dictionaries DROP CONSTRAINT IF EXISTS UQ_dictionaries_code_value;
    `);

    // 恢复 code 的唯一约束（如果需要）
    await queryRunner.query(`
      ALTER TABLE dictionaries ADD CONSTRAINT UQ_dictionaries_code UNIQUE (code);
    `);
  }
}
