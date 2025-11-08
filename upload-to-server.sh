#!/bin/bash

# 项目上传脚本
# 使用方法: ./upload-to-server.sh

echo "=========================================="
echo "开始打包项目..."
echo "=========================================="

# 打包项目（排除不需要的文件）
tar czf fidoo-blog-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='.turbo' \
  --exclude='secrets' \
  --exclude='backups' \
  --exclude='docker/nginx/ssl' \
  --exclude='.env*' \
  --exclude='*.log' \
  --exclude='.git' \
  --exclude='*.md' \
  --exclude='docs' \
  .

echo ""
echo "=========================================="
echo "打包完成！文件大小："
ls -lh fidoo-blog-deploy.tar.gz
echo "=========================================="
echo ""
echo "正在上传到服务器..."
echo ""

# 上传到服务器
scp fidoo-blog-deploy.tar.gz root@120.55.3.205:/root/

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ 上传成功！"
    echo "=========================================="
    echo ""
    echo "在服务器上执行以下命令："
    echo ""
    echo "  cd /root"
    echo "  tar xzf fidoo-blog-deploy.tar.gz -C fidoo-blog"
    echo "  cd fidoo-blog"
    echo "  chmod +x scripts/*.sh"
    echo "  ./scripts/setup-secrets.sh"
    echo "  ./scripts/deploy.sh production"
    echo ""
else
    echo ""
    echo "❌ 上传失败，请检查网络连接和 SSH 配置"
    echo ""
fi
