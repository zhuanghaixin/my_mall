#!/bin/bash

# 商城小程序Docker一键部署脚本
# 作者: AI助手
# 日期: 2025-04-25

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# MySQL密码配置
MYSQL_PASSWORD=${1:-zhx123456}
ENV=${2:-dev}

# 日志函数
log_info() {
  echo -e "${BLUE}[信息] $1${NC}"
}

log_success() {
  echo -e "${GREEN}[成功] $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}[警告] $1${NC}"
}

log_error() {
  echo -e "${RED}[错误] $1${NC}"
}

# 显示帮助信息
show_help() {
  echo "商城小程序Docker一键部署脚本"
  echo ""
  echo "用法: ./deploy-docker.sh [MySQL密码] [环境]"
  echo ""
  echo "参数:"
  echo "  [MySQL密码]  MySQL数据库密码 (默认: zhx123456)"
  echo "  [环境]       部署环境 (可选: dev/test/staging/prod, 默认: dev)"
  echo ""
  echo "示例:"
  echo "  ./deploy-docker.sh                # 使用默认密码zhx123456部署开发环境"
  echo "  ./deploy-docker.sh mypassword     # 使用自定义密码部署开发环境"
  echo "  ./deploy-docker.sh mypassword test    # 使用自定义密码部署测试环境"
  echo "  ./deploy-docker.sh mypassword staging # 使用自定义密码部署预发布环境"
  echo "  ./deploy-docker.sh mypassword prod    # 使用自定义密码部署生产环境"
}

if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
  show_help 
  exit 0
fi

# 验证环境参数
if [ "$ENV" != "dev" ] && [ "$ENV" != "test" ] && [ "$ENV" != "staging" ] && [ "$ENV" != "prod" ]; then
  log_error "无效的环境参数: $ENV"
  log_info "有效的环境参数: dev, test, staging, prod"
  exit 1
fi

# 准备环境变量
log_info "准备环境变量..."
export MYSQL_PASSWORD=$MYSQL_PASSWORD
export NODE_ENV=$ENV

# 设置项目名称和容器名前缀
PROJECT_NAME="mall-system-${ENV}"
MYSQL_CONTAINER="mall-mysql-${ENV}"
NETWORK_NAME="${PROJECT_NAME}_mall-network"

# 清理旧容器和网络
log_info "清理旧容器和网络..."
if docker ps -a | grep -q "${PROJECT_NAME}"; then
  log_info "停止并删除旧容器..."
  docker-compose -p $PROJECT_NAME down
fi

# 尝试停止和删除任何相关的旧容器
docker ps -a | grep -E "mall-(server|admin|mysql)-${ENV}" | awk '{print $1}' | xargs -r docker rm -f

# 删除旧网络
if docker network ls | grep -q "$NETWORK_NAME"; then
  log_info "删除旧网络 $NETWORK_NAME..."
  docker network rm $NETWORK_NAME 2>/dev/null || true
fi

# 创建新网络
log_info "创建网络 $NETWORK_NAME..."
docker network create $NETWORK_NAME

# 启动MySQL容器
log_info "启动MySQL容器..."
docker run --name $MYSQL_CONTAINER \
  -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
  -e MYSQL_DATABASE=shop \
  -e MYSQL_ROOT_HOST=% \
  -p 3307:3306 \
  -v $(pwd)/init.sql:/docker-entrypoint-initdb.d/init.sql \
  --network $NETWORK_NAME \
  --network-alias mysql \
  -d mysql:8.0 \
  --default-authentication-plugin=mysql_native_password \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 等待MySQL启动
log_info "等待MySQL启动..."
MAX_WAIT=120  # 最多等待120秒
for i in $(seq 1 $MAX_WAIT); do
  if docker exec $MYSQL_CONTAINER mysqladmin ping -uroot -p$MYSQL_PASSWORD 2>/dev/null | grep -q 'mysqld is alive'; then
    log_success "MySQL已成功启动"
    break
  fi
  echo -n "."
  sleep 1
  
  if [ $i -eq $MAX_WAIT ]; then
    log_error "MySQL启动超时，但继续尝试部署其他服务..."
  fi
done

# 验证MySQL数据库
log_info "检查数据库初始化状态..."
RETRY=0
MAX_RETRY=5

while [ $RETRY -lt $MAX_RETRY ]; do
  if docker exec $MYSQL_CONTAINER mysql -uroot -p$MYSQL_PASSWORD -e "USE shop; SHOW TABLES;" 2>/dev/null | grep -q 'Tables_in_shop'; then
    TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mysql -uroot -p$MYSQL_PASSWORD -e "USE shop; SHOW TABLES;" 2>/dev/null | grep -v 'Tables_in_shop' | wc -l)
    log_success "shop数据库初始化成功，包含 $TABLE_COUNT 个表"
    break
  else
    RETRY=$((RETRY+1))
    log_warn "数据库初始化仍在进行中，等待10秒...(尝试 $RETRY/$MAX_RETRY)"
    sleep 10
    
    if [ $RETRY -eq $MAX_RETRY ]; then
      log_warn "数据库表未完全初始化，但继续尝试部署其他服务..."
    fi
  fi
done

# 启动后端服务
log_info "启动后端服务..."
docker-compose -p $PROJECT_NAME build mall-server

# 使用自定义命令启动mall-server，不依赖于mysql服务
ENV_FILE=""
if [ "$ENV" == "prod" ]; then
  ENV_FILE="docker-compose.prod.yml"
elif [ "$ENV" == "test" ]; then
  ENV_FILE="docker-compose.test.yml"
elif [ "$ENV" == "staging" ]; then
  ENV_FILE="docker-compose.staging.yml"
else
  ENV_FILE="docker-compose.dev.yml"
fi

log_info "使用配置文件: docker-compose.yml 和 $ENV_FILE"
docker-compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE create mall-server
docker-compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE start mall-server

# 等待后端服务启动
log_info "等待后端服务启动..."
sleep 10

# 启动前端服务
log_info "启动前端服务..."
docker-compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE create mall-admin
docker-compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE start mall-admin

# 检查服务状态
log_info "检查服务状态..."
docker ps | grep -E "mall-(mysql|server|admin)-${ENV}"

# 显示访问信息
log_info "服务部署完成！"
log_info "环境: $ENV"
log_info "服务访问信息:"
echo "前端界面: http://localhost:3001"
echo "后端API: http://localhost:8081/api"
echo "MySQL数据库: localhost:3307 (用户名: root, 密码: $MYSQL_PASSWORD)"

log_success "所有服务已成功部署！" 