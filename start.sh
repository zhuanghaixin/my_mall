#!/bin/bash

# 商城管理系统环境切换与启动脚本

# 显示帮助信息
show_help() {
  echo "商城管理系统环境管理脚本"
  echo ""
  echo "用法: ./start.sh [命令] [环境]"
  echo ""
  echo "命令:"
  echo "  start   启动指定环境的服务"
  echo "  stop    停止当前运行的服务"
  echo "  restart 重启服务"
  echo "  status  显示容器状态"
  echo "  logs    查看日志"
  echo "  build   构建镜像"
  echo ""
  echo "环境:"
  echo "  dev     开发环境 (默认)"
  echo "  test    测试环境"
  echo "  staging 预发布环境"
  echo "  prod    生产环境"
  echo ""
  echo "示例:"
  echo "  ./start.sh start dev     # 启动开发环境"
  echo "  ./start.sh start prod    # 启动生产环境"
  echo "  ./start.sh status        # 查看容器状态"
  echo "  ./start.sh logs server   # 查看后端服务日志"
  echo "  ./start.sh logs admin    # 查看前端服务日志"
}

# 获取参数
COMMAND=$1
ENV=$2

# 如果没有指定环境，默认为开发环境
if [ -z "$ENV" ]; then
  case $COMMAND in
    start|build|restart)
      ENV="dev"
      ;;
  esac
fi

# 根据环境设置配置文件
case $ENV in
  dev)
    ENV_FILE="docker-compose.dev.yml"
    ENV_NAME="开发环境"
    ;;
  test)
    ENV_FILE="docker-compose.test.yml"
    ENV_NAME="测试环境"
    ;;
  staging)
    ENV_FILE="docker-compose.staging.yml"
    ENV_NAME="预发布环境"
    ;;
  prod)
    ENV_FILE="docker-compose.prod.yml"
    ENV_NAME="生产环境"
    ;;
  *)
    if [ "$COMMAND" != "stop" ] && [ "$COMMAND" != "status" ] && [ "$COMMAND" != "logs" ]; then
      echo "错误: 未知的环境 '$ENV'"
      echo ""
      show_help
      exit 1
    fi
    ;;
esac

# 设置构建时间
export BUILD_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

# 根据命令执行相应操作
case $COMMAND in
  start)
    echo "正在启动 $ENV_NAME..."
    docker-compose -f docker-compose.yml -f $ENV_FILE up -d
    ;;
  stop)
    echo "正在停止服务..."
    docker-compose down
    ;;
  restart)
    echo "正在重启 $ENV_NAME..."
    docker-compose -f docker-compose.yml -f $ENV_FILE down
    docker-compose -f docker-compose.yml -f $ENV_FILE up -d
    ;;
  status)
    echo "容器状态:"
    docker-compose ps
    ;;
  logs)
    if [ "$ENV" == "server" ]; then
      echo "显示后端服务日志:"
      docker-compose logs -f mall-server
    elif [ "$ENV" == "admin" ]; then
      echo "显示前端服务日志:"
      docker-compose logs -f mall-admin
    else
      echo "显示所有服务日志:"
      docker-compose logs -f
    fi
    ;;
  build)
    echo "正在构建 $ENV_NAME 镜像..."
    docker-compose -f docker-compose.yml -f $ENV_FILE build
    ;;
  *)
    show_help
    exit 1
    ;;
esac

exit 0 