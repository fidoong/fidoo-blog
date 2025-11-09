import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissionSystem1730000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 创建 menus 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        title VARCHAR(200),
        path VARCHAR(200),
        component VARCHAR(200),
        icon VARCHAR(200),
        code VARCHAR(100) UNIQUE,
        type VARCHAR(20) DEFAULT 'menu',
        parent_id UUID,
        sort_order INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'enabled',
        description TEXT,
        is_hidden BOOLEAN DEFAULT false,
        is_cache BOOLEAN DEFAULT false,
        is_external BOOLEAN DEFAULT false,
        external_url TEXT,
        permission_code VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT FK_menus_parent_id FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_menus_parent_id_sort ON menus(parent_id, sort_order);
    `);

    // 2. 创建 permissions 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL,
        resource VARCHAR(200),
        action VARCHAR(200),
        path VARCHAR(500),
        method VARCHAR(20),
        status VARCHAR(20) DEFAULT 'enabled',
        description TEXT,
        parent_id UUID,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_permissions_code ON permissions(code);
    `);

    // 3. 创建 roles 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'enabled',
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_system BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_roles_code ON roles(code);
    `);

    // 4. 创建 user_roles 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        role_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT FK_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT FK_user_roles_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        CONSTRAINT UQ_user_roles_user_role UNIQUE (user_id, role_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_user_roles_user_id ON user_roles(user_id);
      CREATE INDEX IF NOT EXISTS IDX_user_roles_role_id ON user_roles(role_id);
    `);

    // 5. 创建 role_permissions 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL,
        permission_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT FK_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        CONSTRAINT FK_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        CONSTRAINT UQ_role_permissions_role_permission UNIQUE (role_id, permission_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_role_permissions_role_id ON role_permissions(role_id);
      CREATE INDEX IF NOT EXISTS IDX_role_permissions_permission_id ON role_permissions(permission_id);
    `);

    // 6. 创建 role_menus 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_menus (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id UUID NOT NULL,
        menu_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT FK_role_menus_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        CONSTRAINT FK_role_menus_menu_id FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        CONSTRAINT UQ_role_menus_role_menu UNIQUE (role_id, menu_id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_role_menus_role_id ON role_menus(role_id);
      CREATE INDEX IF NOT EXISTS IDX_role_menus_menu_id ON role_menus(menu_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除表（按相反顺序）
    await queryRunner.query(`DROP TABLE IF EXISTS role_menus CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS menus CASCADE;`);
  }
}
