#!/bin/bash

# 启动脚本，用于启动不同环境的Docker容器
# 用法: ./start.sh [dev|test|prod]

# 默认环境
ENV=${1:-dev}

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示帮助信息
function show_help {
  echo -e "${YELLOW}商城系统Docker部署启动脚本${NC}"
  echo "用法: ./start.sh [dev|test|prod]"
  echo
  echo "参数:"
  echo "  dev   - 启动开发环境 (默认)"
  echo "  test  - 启动测试环境"
  echo "  prod  - 启动生产环境"
  echo
  echo "命令:"
  echo "  help  - 显示此帮助信息"
  echo "  down  - 停止并移除容器"
  echo "  logs  - 查看容器日志"
  echo
  exit 0
}

# 处理帮助命令
if [ "$ENV" == "help" ]; then
  show_help
fi

# 停止并移除容器
if [ "$ENV" == "down" ]; then
  echo -e "${YELLOW}停止并移除所有容器...${NC}"
  docker-compose down
  exit 0
fi

# 查看日志
if [ "$ENV" == "logs" ]; then
  echo -e "${YELLOW}查看容器日志...${NC}"
  docker-compose logs -f
  exit 0
fi

# 检查环境参数
if [ "$ENV" != "dev" ] && [ "$ENV" != "test" ] && [ "$ENV" != "prod" ]; then
  echo -e "${RED}错误: 未知的环境 '$ENV'${NC}"
  show_help
fi

# 确定环境配置文件
if [ "$ENV" == "dev" ]; then
  COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
  ENV_NAME="开发环境"
elif [ "$ENV" == "test" ]; then
  COMPOSE_FILES="-f docker-compose.yml -f docker-compose.test.yml"
  ENV_NAME="测试环境"
elif [ "$ENV" == "prod" ]; then
  COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
  ENV_NAME="生产环境"
fi

echo -e "${GREEN}启动${ENV_NAME}...${NC}"

# 启动容器
echo -e "${YELLOW}构建并启动容器...${NC}"
docker-compose ${COMPOSE_FILES} up -d --build

# 检查启动状态
if [ $? -eq 0 ]; then
  echo -e "${GREEN}${ENV_NAME}启动成功!${NC}"
  echo -e "${YELLOW}前端地址: ${GREEN}http://localhost:3000${NC}"
  echo -e "${YELLOW}后端地址: ${GREEN}http://localhost:8080${NC}"
  echo -e "${YELLOW}数据库地址: ${GREEN}localhost:3306${NC}"
  echo -e "${YELLOW}查看容器日志: ${GREEN}./start.sh logs${NC}"
  echo -e "${YELLOW}停止服务: ${GREEN}./start.sh down${NC}"
else
  echo -e "${RED}启动失败，请检查日志信息${NC}"
fi 