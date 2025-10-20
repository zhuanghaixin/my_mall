#!/bin/bash

# 监控生产环境部署进度
# 用法: ./monitor-deploy.sh [服务器IP]

SERVER_IP=${1:-"47.107.32.143"}
LOG_FILE="/root/my_mall/deploy.log"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

echo -e "${BLUE}=== 连接到服务器监控部署进度 ===${NC}"
echo -e "${BLUE}服务器: $SERVER_IP${NC}"
echo -e "${BLUE}按 Ctrl+C 退出${NC}"
echo ""

# 使用 SSH 实时查看部署日志
ssh -o ServerAliveInterval=60 root@$SERVER_IP << 'ENDSSH'
  cd /root/my_mall
  
  # 检查日志文件是否存在
  if [ ! -f deploy.log ]; then
    echo "部署日志文件不存在，可能部署尚未开始或已完成"
    echo ""
    echo "容器状态:"
    docker ps | grep mall || echo "未找到运行中的容器"
    exit 0
  fi
  
  # 实时查看日志
  tail -f deploy.log
ENDSSH

