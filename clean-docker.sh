#!/bin/bash

# 商城小程序Docker环境清理脚本
# 作者: AI助手
# 日期: 2025-04-25
# 更新: 检测并支持新版docker compose命令

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

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

# 检查Docker是否安装
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
    log_warn "警告: docker-compose命令也不可用，仅使用Docker原生命令清理"
    DOCKER_COMPOSE_CMD=""
  else
    DOCKER_COMPOSE_CMD="docker-compose"
    DOCKER_COMPOSE_LEGACY=true
    log_info "使用旧版命令: $DOCKER_COMPOSE_CMD"
  fi
else
  log_info "使用新版命令: $DOCKER_COMPOSE_CMD"
fi

ENV=${1:-all}

if [ "$ENV" == "all" ]; then
  log_info "清理所有环境的Docker容器和网络..."
  ENVS="dev test staging prod"
else
  log_info "清理 $ENV 环境的Docker容器和网络..."
  ENVS="$ENV"
fi

for env in $ENVS; do
  log_info "开始清理 $env 环境..."
  
  # 容器名称
  PROJECT_NAME="mall-system-$env"
  MYSQL_CONTAINER="mall-mysql-$env"
  SERVER_CONTAINER="mall-server-$env"
  ADMIN_CONTAINER="mall-admin-$env"
  NETWORK_NAME="mall-system-${env}_mall-network"
  
  # 如果存在docker compose配置文件和Docker Compose命令，优先使用docker compose down
  if [ ! -z "$DOCKER_COMPOSE_CMD" ] && [ -f "docker-compose.yml" ]; then
    ENV_FILE=""
    if [ "$env" == "prod" ]; then
      ENV_FILE="docker-compose.prod.yml"
    elif [ "$env" == "test" ]; then
      ENV_FILE="docker-compose.test.yml"
    elif [ "$env" == "staging" ]; then
      ENV_FILE="docker-compose.staging.yml"
    else
      ENV_FILE="docker-compose.dev.yml"
    fi
    
    if [ -f "$ENV_FILE" ]; then
      log_info "使用 $DOCKER_COMPOSE_CMD 清理 $env 环境..."
      $DOCKER_COMPOSE_CMD -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE down
      continue
    fi
  fi
  
  # 如果不能使用docker compose，则使用原生Docker命令
  log_info "使用Docker原生命令清理 $env 环境..."
  
  # 停止并删除容器
  log_info "停止并删除 $env 环境的容器..."
  docker rm -f $MYSQL_CONTAINER $SERVER_CONTAINER $ADMIN_CONTAINER 2>/dev/null || true
  
  # 删除网络
  log_info "删除 $env 环境的网络..."
  docker network rm $NETWORK_NAME 2>/dev/null || true
  
  log_success "$env 环境清理完成！"
done

# 清理未使用的镜像
log_info "清理未使用的Docker镜像..."
docker image prune -f

# 列出清理后的容器状态
log_info "当前运行的相关容器:"
docker ps | grep mall || echo "没有运行中的mall相关容器"

log_info "所有相关容器(包括已停止):"
docker ps -a | grep mall || echo "没有mall相关容器"

log_info "当前存在的相关网络:"
docker network ls | grep mall || echo "没有mall相关网络"

log_success "Docker环境清理完成！" 