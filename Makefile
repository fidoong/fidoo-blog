.PHONY: help install dev build start clean docker-up docker-down docker-build test lint format setup

help: ## 显示帮助信息
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  Fidoo Blog - 企业级博客系统"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ============================================
# 项目初始化
# ============================================

setup: ## 初始化项目（首次使用）
	@chmod +x scripts/*.sh
	@./scripts/setup.sh

install: ## 安装依赖
	@pnpm install

# ============================================
# 开发环境
# ============================================

dev: ## 启动所有开发服务
	@chmod +x scripts/dev.sh
	@./scripts/dev.sh all

dev-service: ## 仅启动后端服务
	@pnpm dev:service

dev-web: ## 仅启动前台网站
	@pnpm dev:web

dev-admin: ## 仅启动后台管理
	@pnpm dev:admin

dev-shared: ## 仅启动共享包监听
	@pnpm dev:shared

# ============================================
# 构建和启动
# ============================================

build: ## 构建所有项目
	@chmod +x scripts/build.sh
	@./scripts/build.sh all

build-service: ## 构建后端服务
	@pnpm build:service

build-web: ## 构建前台网站
	@pnpm build:web

build-admin: ## 构建后台管理
	@pnpm build:admin

build-shared: ## 构建共享包
	@pnpm build:shared

start: ## 启动所有生产服务
	@pnpm start

start-service: ## 启动后端服务
	@pnpm start:service

start-web: ## 启动前台网站
	@pnpm start:web

start-admin: ## 启动后台管理
	@pnpm start:admin

# ============================================
# 代码质量
# ============================================

lint: ## 代码检查
	@pnpm lint

lint-fix: ## 代码检查并自动修复
	@pnpm lint:fix

format: ## 格式化代码
	@chmod +x scripts/format.sh
	@./scripts/format.sh fix

format-check: ## 检查代码格式
	@chmod +x scripts/format.sh
	@./scripts/format.sh check

typecheck: ## TypeScript 类型检查
	@pnpm typecheck

# ============================================
# 测试
# ============================================

test: ## 运行测试
	@pnpm test

test-cov: ## 测试覆盖率
	@pnpm test:cov

# ============================================
# 数据库迁移
# ============================================

migration-generate: ## 生成数据库迁移
	@cd service && pnpm migration:generate

migration-run: ## 运行数据库迁移
	@cd service && pnpm migration:run

migration-revert: ## 回滚数据库迁移
	@cd service && pnpm migration:revert

seed: ## 运行数据库种子
	@pnpm seed

# ============================================
# Docker
# ============================================

docker-up: ## 启动 Docker 服务（生产环境）
	@docker-compose up -d

docker-up-dev: ## 启动 Docker 服务（开发环境，仅数据库和Redis）
	@docker-compose -f docker-compose.dev.yml up -d

docker-down: ## 停止 Docker 服务
	@docker-compose down

docker-down-dev: ## 停止开发环境 Docker 服务
	@docker-compose -f docker-compose.dev.yml down

docker-build: ## 构建 Docker 镜像
	@docker-compose build

docker-build-service: ## 构建后端服务镜像
	@docker build -f Dockerfile.service -t fidoo-blog-service .

docker-build-web: ## 构建前台网站镜像
	@docker build -f Dockerfile.web -t fidoo-blog-web .

docker-build-admin: ## 构建后台管理镜像
	@docker build -f Dockerfile.admin -t fidoo-blog-admin .

docker-logs: ## 查看 Docker 日志
	@docker-compose logs -f

docker-logs-service: ## 查看后端服务日志
	@docker-compose logs -f service

docker-logs-web: ## 查看前台网站日志
	@docker-compose logs -f web

docker-logs-admin: ## 查看后台管理日志
	@docker-compose logs -f admin

docker-restart: ## 重启 Docker 服务
	@docker-compose restart

docker-ps: ## 查看 Docker 容器状态
	@docker-compose ps

# ============================================
# 清理
# ============================================

clean: ## 清理构建产物
	@pnpm clean

clean-all: ## 清理所有（包括 node_modules）
	@pnpm clean:all

# ============================================
# 发布和部署
# ============================================

release: ## 发布项目（运行测试、构建、创建标签）
	@chmod +x scripts/release.sh
	@./scripts/release.sh

deploy: ## 部署到服务器（Docker 方式）
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh docker production

deploy-pm2: ## 部署到服务器（PM2 方式）
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh pm2 production

