#!/bin/bash

echo "=== 商城系统 MySQL 修复脚本 ==="
echo "此脚本将清理MySQL数据并使用正确的配置重启数据库容器"
echo

# 确认操作
read -p "警告：此操作将删除并重建MySQL容器数据，确定要继续吗？(y/n): " confirm
if [[ $confirm != "y" && $confirm != "Y" ]]; then
  echo "操作已取消"
  exit 0
fi

# 获取当前环境
echo "请选择要修复的环境："
echo "1. 开发环境 (dev)"
echo "2. 测试环境 (test)"
echo "3. 预发布环境 (staging)"
echo "4. 生产环境 (prod)"
read -p "请输入选择 [1-4]: " env_choice

case $env_choice in
  1)
    ENV="dev"
    MYSQL_CONTAINER="mall-mysql-dev"
    ENV_FILE="docker-compose.dev.yml"
    ;;
  2)
    ENV="test"
    MYSQL_CONTAINER="mall-mysql-test"
    ENV_FILE="docker-compose.test.yml"
    ;;
  3)
    ENV="staging"
    MYSQL_CONTAINER="mall-mysql-staging"
    ENV_FILE="docker-compose.staging.yml"
    ;;
  4)
    ENV="prod"
    MYSQL_CONTAINER="mall-mysql-prod"
    ENV_FILE="docker-compose.prod.yml"
    ;;
  *)
    echo "无效的选择，使用开发环境"
    ENV="dev"
    MYSQL_CONTAINER="mall-mysql-dev"
    ENV_FILE="docker-compose.dev.yml"
    ;;
esac

echo "选择的环境: $ENV (容器名: $MYSQL_CONTAINER)"

# 检查是否存在init.sql文件
if [ ! -f "init.sql" ]; then
  echo "错误: 未找到init.sql文件，请确保数据库初始化文件存在"
  exit 1
fi

# 检查Docker是否运行
if ! docker info >/dev/null 2>&1; then
  echo "错误: Docker未运行，请先启动Docker服务"
  exit 1
fi

# 首先停止所有服务
echo "停止所有服务..."
docker-compose -f docker-compose.yml -f $ENV_FILE down

# 修复docker-compose.yml和docker-compose.dev.yml中的卷定义问题
echo "检查并修复Docker Compose配置文件..."

# 运行中间脚本来修改配置
cat > fix-volume-config.sh << 'EOF'
#!/bin/bash
# 该脚本修复docker-compose配置文件中的卷名问题

# 修复主配置文件
sed -i.bak 's/mysql-data: {}/mysql-data:/' docker-compose.yml
# 修复环境配置文件
sed -i.bak 's/mysql-data-dev: {}/mysql-data-dev:/' docker-compose.dev.yml
sed -i.bak 's/mysql-data-test: {}/mysql-data-test:/' docker-compose.test.yml
sed -i.bak 's/mysql-data-prod: {}/mysql-data-prod:/' docker-compose.prod.yml
sed -i.bak 's/mysql-data-staging: {}/mysql-data-staging:/' docker-compose.staging.yml 2>/dev/null || true

echo "配置文件已修复"
EOF

chmod +x fix-volume-config.sh
./fix-volume-config.sh

# 如果容器仍在运行，强制停止
if docker ps | grep -q $MYSQL_CONTAINER; then
  echo "强制停止容器: $MYSQL_CONTAINER"
  docker stop $MYSQL_CONTAINER
  docker rm -f $MYSQL_CONTAINER
fi

# 查找与MySQL相关的所有卷
echo "查找MySQL相关卷..."
MYSQL_VOLUMES=$(docker volume ls --format "{{.Name}}" | grep -E "mysql-data|mysql-data-${ENV}" || echo "")

if [ -z "$MYSQL_VOLUMES" ]; then
  echo "未找到MySQL相关卷"
else
  echo "找到以下MySQL相关卷:"
  echo "$MYSQL_VOLUMES"
  
  # 检查并删除每个卷
  echo "$MYSQL_VOLUMES" | while read volume; do
    echo "处理卷: $volume"
    
    # 查找使用该卷的容器
    CONTAINERS=$(docker ps -a --filter "volume=$volume" --format "{{.Names}}" || echo "")
    
    if [ ! -z "$CONTAINERS" ]; then
      echo "卷 $volume 正在被以下容器使用:"
      echo "$CONTAINERS"
      echo "停止并删除这些容器..."
      
      # 停止并删除容器（macOS兼容方式）
      for container in $CONTAINERS; do
        docker rm -f $container || true
      done
    fi
    
    # 删除卷
    echo "删除卷 $volume..."
    docker volume rm $volume || true
  done
fi

# 确保Docker网络正确
echo "清理Docker网络..."
if docker network ls | grep -q "_mall-network"; then
  docker network rm _mall-network || true
fi

if docker network ls | grep -q "mall-system"; then
  docker network ls | grep "mall-system" | awk '{print $1}' | xargs -I{} docker network rm {} || true
fi

# 重新创建并启动MySQL容器
echo "启动新MySQL容器..."
docker-compose -f docker-compose.yml -f $ENV_FILE up -d mysql

# 等待MySQL启动
echo "等待MySQL启动..."
MAX_WAIT=120 # 增加等待时间到2分钟
for i in $(seq 1 $MAX_WAIT); do
  if docker ps | grep -q $MYSQL_CONTAINER; then
    if docker exec $MYSQL_CONTAINER mysqladmin ping -h localhost -u root -pzhx199710085470 --silent >/dev/null 2>&1; then
      echo "MySQL已启动"
      break
    fi
  fi
  echo -n "."
  sleep 1
  
  if [ $i -eq $MAX_WAIT ]; then
    echo "MySQL启动超时，请检查容器日志"
    docker-compose -f docker-compose.yml -f $ENV_FILE logs mysql
    exit 1
  fi
done

# 验证MySQL初始化是否成功
echo "检查MySQL初始化状态..."
if docker exec $MYSQL_CONTAINER mysql -u root -pzhx199710085470 -e "SHOW DATABASES;" >/dev/null 2>&1; then
  echo "MySQL初始化成功"
  
  # 检查shop数据库是否存在
  if docker exec $MYSQL_CONTAINER mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" >/dev/null 2>&1; then
    echo "shop数据库已初始化"
    TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" 2>/dev/null | wc -l)
    echo "shop数据库中的表数量: $((TABLE_COUNT-1))"
  else
    echo "shop数据库未初始化或初始化失败"
    echo "尝试手动导入init.sql..."
    
    # 复制SQL文件到容器
    echo "复制init.sql到容器..."
    docker cp init.sql $MYSQL_CONTAINER:/tmp/init.sql
    
    # 导入SQL
    echo "导入SQL文件..."
    docker exec $MYSQL_CONTAINER sh -c "mysql -u root -pzhx199710085470 shop < /tmp/init.sql"
    
    # 再次检查
    if docker exec $MYSQL_CONTAINER mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" >/dev/null 2>&1; then
      TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" 2>/dev/null | wc -l)
      echo "SQL导入成功，shop数据库中的表数量: $((TABLE_COUNT-1))"
    else
      echo "SQL导入失败"
    fi
  fi
else
  echo "MySQL初始化失败，请检查容器日志"
  docker-compose -f docker-compose.yml -f $ENV_FILE logs mysql
  exit 1
fi

# 清理临时文件
rm -f fix-volume-config.sh
rm -f docker-compose.yml.bak
rm -f docker-compose.dev.yml.bak
rm -f docker-compose.test.yml.bak
rm -f docker-compose.prod.yml.bak
rm -f docker-compose.staging.yml.bak 2>/dev/null || true

echo "MySQL修复操作完成"
echo "您可以使用以下命令查看容器日志："
echo "docker logs $MYSQL_CONTAINER"
echo
echo "要重启所有服务，请运行："
echo "./start.sh restart $ENV" 