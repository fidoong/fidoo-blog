# 构建阶段
FROM node:18-alpine AS builder

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制 workspace 配置
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# 复制服务代码
COPY service ./service

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建服务
WORKDIR /app/service
RUN pnpm build

# 生产阶段
FROM node:18-alpine

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制构建产物
COPY --from=builder /app/service/dist ./dist
COPY --from=builder /app/service/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/service/node_modules ./service_node_modules

# 创建必要的目录
RUN mkdir -p uploads logs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动服务
CMD ["node", "dist/main"]

