#!/bin/bash

# 商城管理系统环境管理脚本 (增强版)
# 集成了环境切换、MySQL修复和网络配置功能

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# MySQL密码配置 - 统一密码变量以便维护
MYSQL_PASSWORD=zhx123456

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
  echo "商城管理系统环境管理脚本 (增强版)"
  echo ""
  echo "用法: ./start.sh [命令] [环境]"
  echo ""
  echo "命令:"
  echo "  start     启动指定环境的服务"
  echo "  stop      停止当前运行的服务"
  echo "  restart   重启服务"
  echo "  status    显示容器状态"
  echo "  logs      查看日志"
  echo "  build     构建镜像"
  echo "  fix-mysql 修复MySQL容器和数据"
  echo ""
  echo "环境:"
  echo "  dev       开发环境 (默认)"
  echo "  test      测试环境"
  echo "  staging   预发布环境"
  echo "  prod      生产环境"
  echo ""
  echo "示例:"
  echo "  ./start.sh start dev     # 启动开发环境"
  echo "  ./start.sh start prod    # 启动生产环境"
  echo "  ./start.sh status        # 查看容器状态"
  echo "  ./start.sh logs server   # 查看后端服务日志"
  echo "  ./start.sh logs admin    # 查看前端服务日志"
  echo "  ./start.sh fix-mysql dev # 修复开发环境MySQL"
}

# 检查MySQL连接和网络
check_and_fix_mysql_network() {
  local MYSQL_CONTAINER=$1
  local NETWORK=$2
  
  # 检查MySQL容器是否存在
  if ! docker ps | grep -q $MYSQL_CONTAINER; then
    log_warn "MySQL容器 $MYSQL_CONTAINER 不存在或未运行"
    return 1
  fi
  
  # 检查MySQL容器是否有正确的网络别名
  log_info "检查MySQL网络配置..."
  if ! docker network inspect $NETWORK | grep -q '"Name": "mysql"'; then
    log_info "为MySQL容器添加网络别名 'mysql'..."
    # 先断开网络连接，再重新连接并添加别名
    docker network disconnect $NETWORK $MYSQL_CONTAINER 2>/dev/null || true
    docker network connect --alias mysql $NETWORK $MYSQL_CONTAINER
    log_success "MySQL网络配置已修复"
  else
    log_success "MySQL网络配置正确"
  fi
  
  # 检查MySQL是否正确启动
  log_info "检查MySQL连接..."
  if docker exec $MYSQL_CONTAINER mysqladmin -u root -p$MYSQL_PASSWORD ping -h localhost --silent >/dev/null 2>&1; then
    log_success "MySQL连接正常"
    return 0
  else
    log_warn "MySQL无法连接，尝试使用空密码..."
    if docker exec $MYSQL_CONTAINER mysqladmin -u root ping -h localhost --silent >/dev/null 2>&1; then
      log_warn "MySQL使用空密码可以连接，将重置为标准密码"
      docker exec $MYSQL_CONTAINER mysql -u root -e "ALTER USER 'root'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';" >/dev/null 2>&1
      log_success "MySQL密码已重置为 $MYSQL_PASSWORD"
      return 0
    else
      log_error "MySQL无法连接，可能需要重启"
      return 1
    fi
  fi
}

# 修复Docker Compose配置文件中的卷定义问题
fix_compose_volume_config() {
  log_info "修复Docker Compose配置文件..."
  
  # 修复主配置文件
  if grep -q "mysql-data: {}" docker-compose.yml; then
    sed -i.bak 's/mysql-data: {}/mysql-data:/' docker-compose.yml
    log_info "修复了主配置文件"
  fi
  
  # 修复环境配置文件
  if [ -f "docker-compose.dev.yml" ] && grep -q "mysql-data-dev: {}" docker-compose.dev.yml; then
    sed -i.bak 's/mysql-data-dev: {}/mysql-data-dev:/' docker-compose.dev.yml
    log_info "修复了开发环境配置文件"
  fi
  
  if [ -f "docker-compose.test.yml" ] && grep -q "mysql-data-test: {}" docker-compose.test.yml; then
    sed -i.bak 's/mysql-data-test: {}/mysql-data-test:/' docker-compose.test.yml
    log_info "修复了测试环境配置文件"
  fi
  
  if [ -f "docker-compose.prod.yml" ] && grep -q "mysql-data-prod: {}" docker-compose.prod.yml; then
    sed -i.bak 's/mysql-data-prod: {}/mysql-data-prod:/' docker-compose.prod.yml
    log_info "修复了生产环境配置文件"
  fi
  
  if [ -f "docker-compose.staging.yml" ] && grep -q "mysql-data-staging: {}" docker-compose.staging.yml; then
    sed -i.bak 's/mysql-data-staging: {}/mysql-data-staging:/' docker-compose.staging.yml
    log_info "修复了预发布环境配置文件"
  fi
  
  # 清理备份文件
  rm -f docker-compose.yml.bak docker-compose.dev.yml.bak docker-compose.test.yml.bak docker-compose.prod.yml.bak docker-compose.staging.yml.bak 2>/dev/null || true
  
  log_success "配置文件修复完成"
}

# 重置并修复MySQL
fix_mysql() {
  local ENV=$1
  local ENV_FILE
  local MYSQL_CONTAINER
  local PROJECT_NAME
  local NETWORK_NAME
  
  # 检查环境参数
  if [ -z "$ENV" ]; then
    log_error "未指定环境参数"
    return 1
  fi
  
  # 根据环境设置变量
  case $ENV in
    dev)
      ENV_FILE="docker-compose.dev.yml"
      MYSQL_CONTAINER="mall-mysql-dev"
      ;;
    test)
      ENV_FILE="docker-compose.test.yml"
      MYSQL_CONTAINER="mall-mysql-test"
      ;;
    staging)
      ENV_FILE="docker-compose.staging.yml"
      MYSQL_CONTAINER="mall-mysql-staging"
      ;;
    prod)
      ENV_FILE="docker-compose.prod.yml"
      MYSQL_CONTAINER="mall-mysql-prod"
      ;;
    *)
      log_error "无效的环境参数: $ENV"
      return 1
      ;;
  esac
  
  # 获取项目名称和网络
  PROJECT_NAME="mall-system-${ENV}"
  NETWORK_NAME="${PROJECT_NAME}_mall-network"
  
  log_info "准备修复 $ENV 环境的MySQL (容器名: $MYSQL_CONTAINER)"
  
  # 检查init.sql文件
  if [ ! -f "init.sql" ]; then
    log_error "未找到init.sql文件，请确保数据库初始化文件存在"
    return 1
  fi
  
  # 先停止所有服务
  log_info "停止所有运行中的服务..."
  docker-compose -f docker-compose.yml -f $ENV_FILE down
  
  # 修复Docker Compose卷配置
  fix_compose_volume_config
  
  # 确保MySQL容器停止
  if docker ps -a | grep -q $MYSQL_CONTAINER; then
    log_info "强制删除旧的MySQL容器..."
    docker stop $MYSQL_CONTAINER 2>/dev/null || true
    docker rm -f $MYSQL_CONTAINER 2>/dev/null || true
  fi
  
  # 查找并删除MySQL相关卷
  log_info "查找MySQL相关卷..."
  MYSQL_VOLUMES=$(docker volume ls --format "{{.Name}}" | grep -E "mysql-data|mysql.*${ENV}" || echo "")
  
  if [ -z "$MYSQL_VOLUMES" ]; then
    log_info "未找到MySQL相关卷"
  else
    log_info "找到以下MySQL相关卷:"
    echo "$MYSQL_VOLUMES"
    
    # 删除卷
    for volume in $MYSQL_VOLUMES; do
      log_info "删除卷: $volume"
      
      # 查找使用该卷的容器
      CONTAINERS=$(docker ps -a --filter "volume=$volume" --format "{{.Names}}" || echo "")
      
      if [ ! -z "$CONTAINERS" ]; then
        log_warn "卷 $volume 正在被以下容器使用:"
        echo "$CONTAINERS"
        for container in $CONTAINERS; do
          docker rm -f $container 2>/dev/null || true
        done
      fi
      
      # 删除卷
      docker volume rm $volume 2>/dev/null || true
    done
  fi
  
  # 清理相关网络
  if docker network ls | grep -q "_mall-network"; then
    log_info "清理网络 _mall-network..."
    docker network rm _mall-network 2>/dev/null || true
  fi
  
  if docker network ls | grep -q "$NETWORK_NAME"; then
    log_info "清理网络 $NETWORK_NAME..."
    # 检查网络是否有连接的容器
    if [ -z "$(docker network inspect $NETWORK_NAME --format '{{range $i, $c := .Containers}}{{$c.Name}} {{end}}' 2>/dev/null)" ]; then
      docker network rm $NETWORK_NAME 2>/dev/null || true
    else
      log_warn "网络 $NETWORK_NAME 仍有容器连接，无法删除"
    fi
  fi
  
  # 创建自定义网络
  if ! docker network ls | grep -q "$NETWORK_NAME"; then
    log_info "创建网络 $NETWORK_NAME..."
    docker network create $NETWORK_NAME
  fi
  
  # 使用单独Docker命令创建MySQL容器
  log_info "创建MySQL容器..."
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
  MAX_WAIT=120  # 增加等待时间
  for i in $(seq 1 $MAX_WAIT); do
    # 尝试简单ping测试
    if docker exec $MYSQL_CONTAINER sh -c "mysqladmin ping" 2>/dev/null | grep -q 'alive'; then
      log_success "MySQL已启动"
      break
    fi
    
    echo -n "."
    sleep 2
    
    if [ $i -eq $MAX_WAIT ]; then
      log_error "MySQL启动超时，请检查容器日志"
      docker logs $MYSQL_CONTAINER
      return 1
    fi
  done
  
  # 给MySQL留更多时间初始化
  log_info "等待MySQL初始化..."
  sleep 10
  
  # 验证MySQL数据
  log_info "检查数据库初始化状态..."
  if docker exec $MYSQL_CONTAINER sh -c "mysql -uroot -p$MYSQL_PASSWORD -e 'USE shop; SHOW TABLES;'" 2>/dev/null | grep -q 'Tables_in_shop'; then
    TABLE_COUNT=$(docker exec $MYSQL_CONTAINER sh -c "mysql -uroot -p$MYSQL_PASSWORD -e 'USE shop; SHOW TABLES;'" 2>/dev/null | grep -v 'Tables_in_shop' | wc -l)
    log_success "shop数据库初始化成功，包含 $TABLE_COUNT 个表"
  else
    log_warn "数据库可能未正确初始化，再等待10秒..."
    sleep 10
    
    # 再次检查
    if docker exec $MYSQL_CONTAINER sh -c "mysql -uroot -p$MYSQL_PASSWORD -e 'USE shop; SHOW TABLES;'" 2>/dev/null | grep -q 'Tables_in_shop'; then
      TABLE_COUNT=$(docker exec $MYSQL_CONTAINER sh -c "mysql -uroot -p$MYSQL_PASSWORD -e 'USE shop; SHOW TABLES;'" 2>/dev/null | grep -v 'Tables_in_shop' | wc -l)
      log_success "shop数据库初始化成功，包含 $TABLE_COUNT 个表"
    else
      log_error "数据库初始化失败"
      return 1
    fi
  fi
  
  log_success "MySQL修复完成，现在可以启动其他服务"
  return 0
}

# 启动其他服务（前端和后端）
start_services() {
  local ENV=$1
  local ENV_FILE
  local MYSQL_CONTAINER
  local NETWORK_NAME
  
  # 检查环境参数
  if [ -z "$ENV" ]; then
    log_error "未指定环境参数"
    return 1
  fi
  
  # 根据环境设置变量
  case $ENV in
    dev)
      ENV_FILE="docker-compose.dev.yml"
      MYSQL_CONTAINER="mall-mysql-dev"
      ;;
    test)
      ENV_FILE="docker-compose.test.yml"
      MYSQL_CONTAINER="mall-mysql-test"
      ;;
    staging)
      ENV_FILE="docker-compose.staging.yml"
      MYSQL_CONTAINER="mall-mysql-staging"
      ;;
    prod)
      ENV_FILE="docker-compose.prod.yml"
      MYSQL_CONTAINER="mall-mysql-prod"
      ;;
    *)
      log_error "无效的环境参数: $ENV"
      return 1
      ;;
  esac
  
  # 获取项目名称和网络
  PROJECT_NAME="mall-system-${ENV}"
  NETWORK_NAME="${PROJECT_NAME}_mall-network"
  
  # 检查MySQL容器是否运行
  if ! docker ps | grep -q $MYSQL_CONTAINER; then
    log_warn "MySQL容器 $MYSQL_CONTAINER 未运行，尝试启动..."
    if docker ps -a | grep -q $MYSQL_CONTAINER; then
      docker start $MYSQL_CONTAINER
    else
      log_error "MySQL容器不存在，请先运行 fix-mysql 命令修复MySQL"
      return 1
    fi
  fi
  
  # 创建网络（如果不存在）
  if ! docker network ls | grep -q "$NETWORK_NAME"; then
    log_info "创建网络 $NETWORK_NAME..."
    docker network create $NETWORK_NAME
  fi
  
  # 确保MySQL容器已连接到网络并有正确的别名
  if ! docker network inspect $NETWORK_NAME | grep -q "$MYSQL_CONTAINER"; then
    log_info "将MySQL容器连接到网络..."
    docker network connect --alias mysql $NETWORK_NAME $MYSQL_CONTAINER
  elif ! docker network inspect $NETWORK_NAME | grep -q '"Name": "mysql"'; then
    log_info "为MySQL容器添加网络别名..."
    docker network disconnect $NETWORK_NAME $MYSQL_CONTAINER
    docker network connect --alias mysql $NETWORK_NAME $MYSQL_CONTAINER
  fi
  
  # 检查MySQL密码是否正确设置
  log_info "验证MySQL密码..."
  if ! docker exec $MYSQL_CONTAINER mysqladmin ping -h localhost --silent >/dev/null 2>&1; then
    log_warn "MySQL可能未启动或不可访问"
    docker start $MYSQL_CONTAINER 2>/dev/null || true
    sleep 5
    
    if ! docker exec $MYSQL_CONTAINER mysqladmin ping -h localhost --silent >/dev/null 2>&1; then
      log_error "无法连接MySQL，请运行 fix-mysql 命令进行修复"
      return 1
    fi
  fi
  
  # 确保密码已设置
  log_info "确保MySQL密码已正确设置..."
  docker exec $MYSQL_CONTAINER mysql -e "ALTER USER 'root'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';" >/dev/null 2>&1 || true
  docker exec $MYSQL_CONTAINER mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';" >/dev/null 2>&1 || true
  
  # 导出MySQL密码环境变量给docker-compose
  export DB_PASSWORD=$MYSQL_PASSWORD
  export MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD
  
  # 启动所有服务（包括MySQL）
  log_info "启动所有服务..."
  
  # 先停止旧的容器（如果有）
  docker ps -a | grep -E "mall-(admin|server)-$ENV" | awk '{print $1}' | xargs -r docker rm -f
  
  # 启动所有服务
  docker-compose -p mall-system-${ENV} -f docker-compose.yml -f $ENV_FILE up -d
  
  # 检查服务状态
  log_info "检查服务状态..."
  if docker ps | grep -q "mall-server" && docker ps | grep -q "mall-admin"; then
    log_success "所有服务已启动"
    # 检查后端服务连接MySQL的状态
    sleep 5
    if docker logs --tail 20 mall-server-$ENV | grep -q "数据库连接完成" || docker logs --tail 50 mall-server-$ENV | grep -q "数据库连接成功"; then
      log_success "后端服务已成功连接到数据库"
    else
      log_warn "后端服务可能未成功连接到数据库，请检查日志"
      docker logs --tail 50 mall-server-$ENV | grep -E "数据库|连接|MySQL|Error"
    fi
  else
    log_warn "部分服务可能未启动，请检查日志"
  fi
  
  # 显示访问信息
  log_info "服务访问信息:"
  echo "前端界面: http://localhost:3001"
  echo "后端API: http://localhost:8081/api"
  echo "MySQL数据库: localhost:3307 (用户名: root, 密码: $MYSQL_PASSWORD)"
  
  return 0
}

# 获取参数
COMMAND=$1
ENV=$2

# 如果没有指定环境，默认为开发环境
if [ -z "$ENV" ]; then
  case $COMMAND in
    start|build|restart|fix-mysql)
      ENV="dev"
      ;;
  esac
fi

# 设置构建时间
export BUILD_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

# 根据命令执行相应操作
case $COMMAND in
  start)
    log_info "启动 $ENV 环境服务..."
    # 确保配置文件正确
    fix_compose_volume_config
    
    # 检查MySQL状态
    if [ "$ENV" != "" ]; then
      MYSQL_CONTAINER="mall-mysql-$ENV"
      NETWORK_NAME="mall-system-${ENV}_mall-network"
      
      if docker ps | grep -q $MYSQL_CONTAINER; then
        log_info "MySQL容器已存在，检查网络配置..."
        # 若网络存在且MySQL容器连接了网络但没有mysql别名，修复网络配置
        if docker network ls | grep -q "$NETWORK_NAME" && \
           docker network inspect $NETWORK_NAME | grep -q "$MYSQL_CONTAINER" && \
           ! docker network inspect $NETWORK_NAME | grep -q '"Name": "mysql"'; then
          log_info "修复MySQL网络配置..."
          docker network disconnect $NETWORK_NAME $MYSQL_CONTAINER
          docker network connect --alias mysql $NETWORK_NAME $MYSQL_CONTAINER
        fi
        
        # 启动其他服务
        start_services $ENV
      else
        # MySQL容器不存在，先修复MySQL
        log_warn "MySQL容器不存在，先进行修复..."
        if fix_mysql $ENV; then
          start_services $ENV
        else
          log_error "MySQL修复失败，无法启动其他服务"
          exit 1
        fi
      fi
    else
      # 直接启动所有服务（包括MySQL）
      docker-compose -f docker-compose.yml -f $ENV_FILE up -d
    fi
    ;;
    
  stop)
    log_info "停止服务..."
    docker-compose down
    ;;
    
  restart)
    log_info "重启 $ENV 环境服务..."
    # 先停止所有服务
    docker-compose down
    
    # 再启动服务
    fix_compose_volume_config
    
    # 先启动MySQL
    if fix_mysql $ENV; then
      # 再启动其他服务
      start_services $ENV
    else
      log_error "MySQL修复失败，无法启动其他服务"
      exit 1
    fi
    ;;
    
  status)
    log_info "容器状态:"
    docker-compose ps
    ;;
    
  logs)
    if [ "$ENV" == "server" ]; then
      log_info "显示后端服务日志:"
      docker logs -f $(docker ps --filter "name=mall-server" --format "{{.Names}}" | head -1)
    elif [ "$ENV" == "admin" ]; then
      log_info "显示前端服务日志:"
      docker logs -f $(docker ps --filter "name=mall-admin" --format "{{.Names}}" | head -1)
    elif [ "$ENV" == "mysql" ]; then
      log_info "显示MySQL服务日志:"
      docker logs -f $(docker ps --filter "name=mall-mysql" --format "{{.Names}}" | head -1)
    else
      log_info "显示所有服务日志:"
      docker-compose logs -f
    fi
    ;;
    
  build)
    log_info "构建 $ENV 环境镜像..."
    docker-compose -f docker-compose.yml -f docker-compose.$ENV.yml build
    ;;
    
  fix-mysql)
    log_info "修复 $ENV 环境MySQL..."
    if fix_mysql $ENV; then
      log_success "MySQL修复成功"
    else
      log_error "MySQL修复失败"
      exit 1
    fi
    ;;
    
  *)
    show_help
    exit 1
    ;;
esac

exit 0