#!/bin/bash

echo "=== 商城系统 MySQL 简化修复脚本 ==="
echo

# 停止所有容器
echo "停止所有容器..."
./start.sh stop

# 清理Docker资源
echo "清理Docker资源..."
docker system prune -f

# 检查并创建MySQL容器
echo "创建并启动MySQL容器..."
docker run --name mall-mysql-dev \
  -e MYSQL_ROOT_PASSWORD=zhx199710085470 \
  -e MYSQL_DATABASE=shop \
  -e MYSQL_ROOT_HOST=% \
  -p 3307:3306 \
  -v $(pwd)/init.sql:/docker-entrypoint-initdb.d/init.sql \
  -d mysql:8.0 \
  --default-authentication-plugin=mysql_native_password \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 等待MySQL启动
echo "等待MySQL启动..."
for i in {1..60}; do
  if docker exec mall-mysql-dev mysqladmin ping -h localhost -u root -pzhx199710085470 --silent >/dev/null 2>&1; then
    echo "MySQL已启动"
    break
  fi
  echo -n "."
  sleep 1
  
  if [ $i -eq 60 ]; then
    echo "MySQL启动超时，请检查容器日志"
    docker logs mall-mysql-dev
    exit 1
  fi
done

# 验证MySQL初始化是否成功
echo "检查MySQL初始化状态..."
if docker exec mall-mysql-dev mysql -u root -pzhx199710085470 -e "SHOW DATABASES;" >/dev/null 2>&1; then
  echo "MySQL初始化成功"
  
  # 检查shop数据库是否存在
  if docker exec mall-mysql-dev mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" >/dev/null 2>&1; then
    echo "shop数据库已初始化"
    TABLE_COUNT=$(docker exec mall-mysql-dev mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" 2>/dev/null | wc -l)
    echo "shop数据库中的表数量: $((TABLE_COUNT-1))"
  else
    echo "shop数据库未初始化或初始化失败"
    echo "尝试手动导入init.sql..."
    
    # 复制SQL文件到容器
    echo "复制init.sql到容器..."
    docker cp init.sql mall-mysql-dev:/tmp/init.sql
    
    # 导入SQL
    echo "导入SQL文件..."
    docker exec mall-mysql-dev sh -c "mysql -u root -pzhx199710085470 shop < /tmp/init.sql"
    
    # 再次检查
    if docker exec mall-mysql-dev mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" >/dev/null 2>&1; then
      TABLE_COUNT=$(docker exec mall-mysql-dev mysql -u root -pzhx199710085470 -e "USE shop; SHOW TABLES;" 2>/dev/null | wc -l)
      echo "SQL导入成功，shop数据库中的表数量: $((TABLE_COUNT-1))"
    else
      echo "SQL导入失败"
    fi
  fi
else
  echo "MySQL初始化失败，请检查容器日志"
  docker logs mall-mysql-dev
  exit 1
fi

echo "MySQL修复操作完成"
echo "您可以使用以下命令查看容器日志："
echo "docker logs mall-mysql-dev"
echo
echo "要启动其他服务，请运行："
echo "./start.sh start dev" 