#!/bin/bash

# 清理指定端口的脚本
# 用法: ./scripts/kill-port.sh <port>

PORT=${1:-3005}

if [ -z "$PORT" ]; then
  echo "Usage: $0 <port>"
  exit 1
fi

echo "Checking port $PORT..."

# 查找占用端口的进程
PIDS=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PIDS" ]; then
  echo "Port $PORT is not in use."
  exit 0
fi

echo "Found processes using port $PORT:"
ps -p $PIDS -o pid,command

read -p "Kill these processes? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  kill -9 $PIDS 2>/dev/null
  echo "Killed processes on port $PORT"
else
  echo "Cancelled."
  exit 0
fi

# 再次检查
sleep 1
if lsof -ti:$PORT 2>/dev/null > /dev/null; then
  echo "Warning: Port $PORT may still be in use."
else
  echo "Port $PORT is now free."
fi

