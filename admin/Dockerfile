# 构建阶段
FROM registry.cn-hangzhou.aliyuncs.com/acs/node:18-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY admin ./admin

RUN pnpm install --frozen-lockfile

WORKDIR /app/admin
RUN pnpm build

# 生产阶段
FROM registry.cn-hangzhou.aliyuncs.com/acs/node:18-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/admin/.next ./.next
COPY --from=builder /app/admin/public ./public
COPY --from=builder /app/admin/package.json ./
COPY --from=builder /app/admin/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]

