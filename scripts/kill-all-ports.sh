#!/bin/bash

# 清理所有项目端口的脚本
# 用法: ./scripts/kill-all-ports.sh

PORTS=(3001 3002 3003 3005)

echo "Cleaning up all project ports..."
echo "Ports to clean: ${PORTS[*]}"
echo ""

for port in "${PORTS[@]}"; do
  PIDS=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "Found processes on port $port:"
    ps -p $PIDS -o pid,command 2>/dev/null | tail -n +2
    kill -9 $PIDS 2>/dev/null
    echo "✓ Killed processes on port $port"
  else
    echo "✓ Port $port is already free"
  fi
done

echo ""
echo "Verifying ports are free..."
sleep 1

for port in "${PORTS[@]}"; do
  if lsof -ti:$port 2>/dev/null > /dev/null; then
    echo "⚠ Warning: Port $port may still be in use"
  else
    echo "✓ Port $port is now available"
  fi
done

echo ""
echo "All ports cleaned!"

