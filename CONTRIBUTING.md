# 贡献指南

感谢您考虑为 Fidoo Blog 做出贡献！

## 行为准则

- 尊重他人
- 接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表现出同理心

## 如何贡献

### 报告 Bug

在创建 Bug 报告之前，请检查是否已有类似的 Issue。

Bug 报告应包含：

- 清晰的标题和描述
- 重现步骤
- 预期行为和实际行为
- 系统信息（操作系统、Node.js 版本等）
- 相关的日志或截图

### 提出新功能

功能建议应包含：

- 功能的详细描述
- 为什么需要这个功能
- 可能的实现方案

### Pull Request 流程

1. **Fork 仓库**

```bash
git clone https://github.com/your-username/fidoo-blog.git
cd fidoo-blog
```

2. **创建分支**

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

分支命名规范：

- `feature/*` - 新功能
- `fix/*` - Bug 修复
- `docs/*` - 文档更新
- `refactor/*` - 代码重构
- `test/*` - 测试相关

3. **进行更改**

- 遵循代码规范
- 添加必要的测试
- 更新相关文档
- 确保所有测试通过

4. **提交更改**

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
git commit -m "feat: 添加用户头像上传功能"
git commit -m "fix: 修复文章列表分页bug"
git commit -m "docs: 更新API文档"
```

提交类型：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `build`: 构建系统或外部依赖
- `ci`: CI 配置
- `chore`: 其他修改

5. **推送到 GitHub**

```bash
git push origin feature/your-feature-name
```

6. **创建 Pull Request**

- 提供清晰的 PR 标题和描述
- 引用相关的 Issue
- 添加截图或 GIF（如果适用）
- 等待代码审查

## 开发指南

### 环境设置

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp service/env.example service/.env

# 启动数据库
docker-compose up -d postgres redis

# 运行迁移
cd service && pnpm migration:run

# 启动开发服务器
pnpm service:dev
```

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 编写有意义的注释
- 保持函数简洁（单一职责）

### 测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:cov

# E2E 测试
pnpm test:e2e
```

确保：

- 所有测试通过
- 新功能有相应的测试
- 测试覆盖率不降低

### 文档

- 更新 API 文档
- 添加代码注释
- 更新 README（如果需要）
- 添加示例代码

## 项目结构

```
fidoo-blog/
├── service/          # 后端服务
│   ├── src/
│   │   ├── modules/ # 业务模块
│   │   ├── common/  # 公共模块
│   │   └── config/  # 配置
│   └── test/        # 测试
├── web/             # 前台网站
├── admin/           # 后台管理
├── app/             # 移动端
└── docs/            # 文档
```

## 审查流程

1. 自动检查（CI/CD）
   - 代码规范检查
   - 测试运行
   - 构建测试

2. 代码审查
   - 至少一名维护者审查
   - 解决所有反馈
   - 获得批准

3. 合并
   - Squash and merge
   - 更新 CHANGELOG

## 发布流程

1. 更新版本号
2. 更新 CHANGELOG
3. 创建 Git tag
4. 发布到 npm（如果适用）
5. 发布 Release Notes

## 获取帮助

- 查看 [文档](./docs)
- 提出 [Issue](https://github.com/fidoo/fidoo-blog/issues)
- 加入讨论区

## 许可证

通过贡献，您同意您的贡献将在 MIT 许可证下授权。

---

再次感谢您的贡献！ ❤️
