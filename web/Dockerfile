# 构建阶段
FROM registry.cn-hangzhou.aliyuncs.com/acs/node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# 复制 workspace 配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# 复制共享包
COPY packages/shared ./packages/shared

# 复制 web 代码
COPY web ./web

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建共享包
WORKDIR /app/packages/shared
RUN pnpm build

# 构建 web
WORKDIR /app/web
RUN pnpm build

# 生产阶段
FROM registry.cn-hangzhou.aliyuncs.com/acs/node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/web/.next ./.next
COPY --from=builder /app/web/public ./public
COPY --from=builder /app/web/package.json ./
COPY --from=builder /app/web/node_modules ./node_modules
COPY --from=builder /app/web/next.config.js ./next.config.js

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动服务
CMD ["pnpm", "start", "-p", "3000"]

