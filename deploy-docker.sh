#!/bin/bash

# 商城小程序Docker一键部署脚本
# 作者: AI助手
# 日期: 2025-04-25
# 更新: 使用新版docker compose命令

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# MySQL密码配置
MYSQL_PASSWORD=${1:-zhx123456}
ENV=${2:-dev}
SERVER_IP=${3:-localhost}

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

# 检查Docker是否安装并支持新版命令格式
if ! command -v docker &> /dev/null; then
  log_error "错误: Docker未安装，请先安装Docker"
  exit 1
fi

# 检查新版docker compose命令
DOCKER_COMPOSE_CMD="docker compose"
DOCKER_COMPOSE_LEGACY=false

if ! docker compose version &> /dev/null; then
  log_warn "警告: 未检测到新版docker compose命令，将使用旧版docker-compose命令"
  if ! command -v docker-compose &> /dev/null; then
    log_error "错误: docker-compose命令也不可用，请安装Docker Compose"
    exit 1
  fi
  DOCKER_COMPOSE_CMD="docker-compose"
  DOCKER_COMPOSE_LEGACY=true
  log_info "使用旧版命令: $DOCKER_COMPOSE_CMD"
else
  log_info "使用新版命令: $DOCKER_COMPOSE_CMD"
fi

# 显示帮助信息
show_help() {
  echo "商城小程序Docker一键部署脚本"
  echo ""
  echo "用法: ./deploy-docker.sh [MySQL密码] [环境] [服务器IP]"
  echo ""
  echo "参数:"
  echo "  [MySQL密码]  MySQL数据库密码 (默认: zhx123456)"
  echo "  [环境]       部署环境 (可选: dev/test/staging/prod, 默认: dev)"
  echo "  [服务器IP]   服务器IP地址 (可选，默认: localhost，生产环境推荐使用公网IP)"
  echo ""
  echo "示例:"
  echo "  ./deploy-docker.sh                # 使用默认密码zhx123456部署开发环境"
  echo "  ./deploy-docker.sh mypassword     # 使用自定义密码部署开发环境"
  echo "  ./deploy-docker.sh mypassword test    # 使用自定义密码部署测试环境"
  echo "  ./deploy-docker.sh mypassword staging # 使用自定义密码部署预发布环境"
  echo "  ./deploy-docker.sh mypassword prod    # 使用自定义密码部署生产环境"
  echo "  ./deploy-docker.sh mypassword prod 47.107.32.143 # 使用自定义密码部署生产环境并指定公网IP"
  echo ""
  echo "各环境端口映射:"
  echo "  开发环境(dev):    前端:3001, 后端:8081, MySQL:3307"
  echo "  测试环境(test):   前端:3002, 后端:8082, MySQL:3308"
  echo "  预发布环境(staging): 前端:3003, 后端:8083, MySQL:3309"
  echo "  生产环境(prod):   前端:3004, 后端:8084, MySQL:3310"
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

# 根据不同环境设置不同的端口
case $ENV in
  dev)
    FRONTEND_PORT=3001
    BACKEND_PORT=8081
    MYSQL_PORT=3307
    ;;
  test)
    FRONTEND_PORT=3002
    BACKEND_PORT=8082
    MYSQL_PORT=3308
    ;;
  staging)
    FRONTEND_PORT=3003
    BACKEND_PORT=8083
    MYSQL_PORT=3309
    ;;
  prod)
    FRONTEND_PORT=3004
    BACKEND_PORT=8084
    MYSQL_PORT=3310
    ;;
esac

log_info "环境: $ENV, 端口配置 - 前端:$FRONTEND_PORT, 后端:$BACKEND_PORT, MySQL:$MYSQL_PORT"

# 准备环境变量
log_info "准备环境变量..."
export MYSQL_PASSWORD=$MYSQL_PASSWORD
export NODE_ENV=$ENV
export FRONTEND_PORT=$FRONTEND_PORT
export BACKEND_PORT=$BACKEND_PORT
export MYSQL_PORT=$MYSQL_PORT
export SERVER_IP=$SERVER_IP

# 设置项目名称和容器名前缀
PROJECT_NAME="mall-system-${ENV}"
MYSQL_CONTAINER="mall-mysql-${ENV}"
SERVER_CONTAINER="mall-server-${ENV}"
ADMIN_CONTAINER="mall-admin-${ENV}"
NETWORK_NAME="${PROJECT_NAME}_mall-network"

# 检查是否有运行的容器正在使用预定端口
check_port() {
  local port=$1
  local result=$(lsof -i :$port | grep LISTEN)
  if [ ! -z "$result" ]; then
    log_warn "端口 $port 已被占用: $result"
    return 1
  fi
  return 0
}

log_info "检查端口占用情况..."
check_port $FRONTEND_PORT || log_warn "前端端口 $FRONTEND_PORT 已被占用，但将继续尝试部署"
check_port $BACKEND_PORT || log_warn "后端端口 $BACKEND_PORT 已被占用，但将继续尝试部署"
check_port $MYSQL_PORT || log_warn "MySQL端口 $MYSQL_PORT 已被占用，但将继续尝试部署"

# 清理旧容器和网络
log_info "清理旧容器和网络..."
if docker ps -a | grep -q "${PROJECT_NAME}"; then
  log_info "停止并删除旧容器..."
  $DOCKER_COMPOSE_CMD -p $PROJECT_NAME down
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
  -p $MYSQL_PORT:3306 \
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

# 使用自定义命令直接启动后端服务和前端服务
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

# 使用新版或旧版docker compose命令启动后端服务
log_info "构建并启动后端服务..."
# 构建镜像
$DOCKER_COMPOSE_CMD -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE build mall-server

# 等待后端服务启动
log_info "等待后端服务启动..."
sleep 10

# 确保后端服务已经启动
log_info "确保后端服务可访问..."
# 首先检查容器是否存在
if docker ps | grep -q $SERVER_CONTAINER; then
  # 容器存在，尝试健康检查
  docker exec $SERVER_CONTAINER curl -s --head --fail http://localhost:8080/api/health 2>/dev/null || log_warn "后端健康检查失败，但将继续尝试部署前端"
else
  log_error "后端容器 $SERVER_CONTAINER 不存在，部署可能失败！尝试检查错误日志..."
  # 显示构建日志
  $DOCKER_COMPOSE_CMD -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE logs mall-server
  
  # 尝试重新构建和启动
  log_info "尝试重新构建和启动后端服务..."
  $DOCKER_COMPOSE_CMD -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE build mall-server
  
  # 手动启动后端容器
  docker run -d \
    --name $SERVER_CONTAINER \
    --network $NETWORK_NAME \
    -p $BACKEND_PORT:8080 \
    -e NODE_ENV=$ENV \
    -e DB_HOST=mysql \
    -e DB_PORT=3306 \
    -e DB_NAME=shop \
    -e DB_USER=root \
    -e DB_PASSWORD=$MYSQL_PASSWORD \
    -e API_PREFIX=/api \
    -e SERVER_IP=$SERVER_IP \
    -e JWT_SECRET=mall_${ENV}_secret_key_2023 \
    -e JWT_EXPIRES_IN=7d \
    -e ADMIN_USERNAME=dev_admin \
    -e ADMIN_PASSWORD=dev_pass123 \
    --restart unless-stopped \
    mall-system-${ENV}_mall-server
  
  sleep 10
  
  # 再次检查容器状态
  if docker ps | grep -q $SERVER_CONTAINER; then
    log_success "后端服务重新启动成功！"
  else
    log_error "后端服务重新启动失败，但将继续尝试部署前端..."
  fi
fi

# 检查容器间网络连接
log_info "检查容器间网络连接..."
docker run --rm --network $NETWORK_NAME alpine sh -c "ping -c 2 $SERVER_CONTAINER" || log_warn "容器间网络连接测试失败，但将继续尝试部署"

# 手动启动前端容器
log_info "构建并启动前端服务..."
# 构建镜像
$DOCKER_COMPOSE_CMD -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE build mall-admin

# 创建适合当前环境的nginx配置
log_info "创建自定义Nginx配置..."
cat > custom-nginx.conf <<EOF
server {
    listen 80;
    server_name $SERVER_IP;
    root /usr/share/nginx/html;
    index index.html;

    # 日志配置
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # 支持SPA应用路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 静态资源缓存设置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API代理配置 - 使用容器名代替localhost
    location /api/ {
        proxy_pass http://mall-server-${ENV}:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 健康检查
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# 手动启动前端容器，添加额外的卷挂载来覆盖Nginx配置
docker run -d \
  --name $ADMIN_CONTAINER \
  --network $NETWORK_NAME \
  -p $FRONTEND_PORT:80 \
  -e VITE_API_URL="http://$SERVER_IP:${BACKEND_PORT}/api" \
  -e NODE_ENV=$ENV \
  -v $(pwd)/custom-nginx.conf:/etc/nginx/conf.d/default.conf \
  --restart unless-stopped \
  mall-system-${ENV}_mall-admin

# 检查前端容器是否启动成功
if ! docker ps | grep -q $ADMIN_CONTAINER; then
  log_error "前端容器启动失败，请检查日志:"
  docker logs $ADMIN_CONTAINER
else
  log_success "前端容器启动成功"
fi

# 清理临时文件
rm -f custom-nginx.conf

# 检查服务状态
log_info "检查服务状态..."
docker ps | grep -E "mall-(mysql|server|admin)-${ENV}"

# 显示访问信息
log_info "服务部署完成！"
log_info "环境: $ENV"
log_info "服务访问信息:"

if [ "$SERVER_IP" == "localhost" ]; then
  echo "前端界面: http://$SERVER_IP:$FRONTEND_PORT"
else
  # 生产环境使用80端口
  if [ "$ENV" == "prod" ]; then
    echo "前端界面: http://$SERVER_IP"
  else
    echo "前端界面: http://$SERVER_IP:$FRONTEND_PORT"
  fi
fi

echo "后端API: http://$SERVER_IP:$BACKEND_PORT/api"
echo "MySQL数据库: $SERVER_IP:$MYSQL_PORT (用户名: root, 密码: $MYSQL_PASSWORD)"

# 添加诊断信息
log_info "容器运行状态:"
docker ps -a | grep -E "mall-(mysql|server|admin)-${ENV}"

log_info "网络信息:"
docker network inspect $NETWORK_NAME | grep -E 'Name|IPv4Address'

# 检查前端容器日志
if docker ps | grep -q $ADMIN_CONTAINER; then
  log_info "前端容器日志 (最后10行):"
  docker logs --tail 10 $ADMIN_CONTAINER
else
  log_warn "前端容器未运行，无法获取日志"
fi

# 检查后端容器日志
log_info "后端容器日志 (最后10行):"
docker logs --tail 10 $SERVER_CONTAINER

log_success "所有服务已成功部署！如有问题，请检查上方日志信息" 