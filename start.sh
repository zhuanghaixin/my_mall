#!/bin/bash

# 商城管理系统Docker部署脚本（支持多环境隔离）

# 显示帮助信息
show_help() {
  echo "商城管理系统Docker管理脚本"
  echo "用法: ./start.sh [命令] [环境] [服务名(可选)]"
  echo ""
  echo "命令:"
  echo "  start   [env]   启动指定环境"
  echo "  stop    [env]   停止指定环境"
  echo "  restart [env]   重启指定环境"
  echo "  status  [env]   查看环境状态"
  echo "  logs    [env]  [service] 查看日志"
  echo "  build   [env]   构建镜像"
  echo ""
  echo "环境:"
  echo "  dev     开发环境 (默认)"
  echo "  test    测试环境"
  echo "  staging 预发布环境"
  echo "  prod    生产环境"
  echo ""
  echo "示例:"
  echo "  ./start.sh start dev       # 启动开发环境"
  echo "  ./start.sh logs prod server  # 查看生产环境后端日志"
  echo "  ./start.sh stop test       # 停止测试环境"
}

# 检查Docker是否安装
if ! command -v docker &>/dev/null; then
  echo "错误: Docker 未安装"
  exit 1
fi

# 参数解析
COMMAND=$1
ENV=${2:-dev}  # 默认环境为dev
SERVICE=$3      # 服务名（仅logs命令需要）

# 环境配置
case $ENV in
  dev|test|staging|prod)
    ENV_FILE="docker-compose.$ENV.yml"
    ENV_NAME="$ENV 环境"
    ;;
  *)
    echo "错误: 未知环境 '$ENV'"
    show_help
    exit 1
    ;;
esac

# 项目名隔离
PROJECT_NAME="mall-system-${ENV}"

# 执行命令
case $COMMAND in
  start)
    echo "启动 $ENV_NAME..."
    docker compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE up -d
    ;;
  stop)
    echo "停止 $ENV_NAME..."
    docker compose -p $PROJECT_NAME down
    ;;
  restart)
    echo "重启 $ENV_NAME..."
    docker compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE down
    docker compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE up -d
    ;;
  status)
    echo "$ENV_NAME 状态:"
    docker compose -p $PROJECT_NAME ps
    ;;
  logs)
    echo "$ENV_NAME 日志:"
    if [ -n "$SERVICE" ]; then
      docker compose -p $PROJECT_NAME logs -f $SERVICE
    else
      docker compose -p $PROJECT_NAME logs -f
    fi
    ;;
  build)
    echo "构建 $ENV_NAME 镜像..."
    docker compose -p $PROJECT_NAME -f docker-compose.yml -f $ENV_FILE build
    ;;
  *)
    show_help
    exit 1
    ;;
esac

exit 0