#!/bin/bash

# 快速清理 3005 端口
PORT=3005

echo "正在清理端口 $PORT..."

# 查找占用端口的进程
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
  echo "端口 $PORT 未被占用。"
  exit 0
fi

echo "找到占用端口的进程: $PIDS"
echo "正在终止..."

# 终止进程
kill -9 $PIDS 2>/dev/null

# 等待一下
sleep 1

# 再次检查
if lsof -ti:$PORT 2>/dev/null > /dev/null; then
  echo "警告: 端口 $PORT 可能仍被占用。"
  exit 1
else
  echo "✓ 端口 $PORT 已释放。"
  exit 0
fi

