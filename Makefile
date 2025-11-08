.PHONY: help install dev build start clean docker-up docker-down docker-build test lint format

help: ## 显示帮助信息
	@echo "Fidoo Blog - 可用命令："
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	pnpm install

dev: ## 启动开发环境
	pnpm dev

dev-service: ## 仅启动后端服务
	pnpm service:dev

dev-web: ## 仅启动前台网站
	pnpm web:dev

dev-admin: ## 仅启动后台管理
	pnpm admin:dev

build: ## 构建项目
	pnpm build

start: ## 启动生产服务
	pnpm start

clean: ## 清理构建产物
	pnpm clean
	rm -rf node_modules

docker-up: ## 启动 Docker 服务
	docker-compose up -d

docker-down: ## 停止 Docker 服务
	docker-compose down

docker-build: ## 构建 Docker 镜像
	docker-compose build

docker-logs: ## 查看 Docker 日志
	docker-compose logs -f

test: ## 运行测试
	pnpm test

test-cov: ## 测试覆盖率
	pnpm test:cov

lint: ## 代码检查
	pnpm lint

format: ## 代码格式化
	pnpm format

typecheck: ## 类型检查
	pnpm typecheck

migration-generate: ## 生成数据库迁移
	cd service && pnpm migration:generate

migration-run: ## 运行数据库迁移
	cd service && pnpm migration:run

migration-revert: ## 回滚数据库迁移
	cd service && pnpm migration:revert

setup: ## 初始化项目
	chmod +x scripts/setup.sh
	./scripts/setup.sh

