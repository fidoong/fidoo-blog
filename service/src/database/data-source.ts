import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { resolve, join } from 'path';

// 加载环境变量（从 service 目录的 .env 文件）
const envPath = resolve(__dirname, '../../.env');
config({ path: envPath });

// 也尝试加载 .env.local
const envLocalPath = resolve(__dirname, '../../.env.local');
config({ path: envLocalPath, override: false });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'fidoo_blog',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
