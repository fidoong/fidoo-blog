// PM2 生态系统配置文件
// 用法: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'fidoo-blog-service',
      script: './service/dist/main.js',
      cwd: '/opt/fidoo-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
      error_file: './logs/service-error.log',
      out_file: './logs/service-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=2048',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'fidoo-blog-web',
      script: 'npm',
      args: 'start',
      cwd: '/opt/fidoo-blog/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '../logs/web-error.log',
      out_file: '../logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
    {
      name: 'fidoo-blog-admin',
      script: 'npm',
      args: 'start',
      cwd: '/opt/fidoo-blog/admin',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '../logs/admin-error.log',
      out_file: '../logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};

