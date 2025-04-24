# Docker部署问题排查指南

## 常见错误及解决方案

### MySQL相关问题

#### 1. MySQL容器无法启动

**可能原因**:
- 端口3306被占用
- 数据卷权限问题
- 初始化脚本错误

**解决方案**:
```bash
# 检查端口占用情况
sudo lsof -i :3306

# 停止本地MySQL服务(如适用)
sudo service mysql stop 

# 清理数据卷重新开始
docker-compose down -v
```

#### 2. 初始化脚本执行失败

**可能原因**:
- init.sql文件格式问题
- SQL语法错误
- 文件权限问题

**解决方案**:
```bash
# 直接进入MySQL容器执行SQL
docker exec -it mall-mysql-dev mysql -uroot -pzhx199710085470

# 在容器内手动执行初始化
CREATE DATABASE IF NOT EXISTS shop;
USE shop;

# 检查初始化脚本是否被正确挂载
docker exec -it mall-mysql-dev ls -la /docker-entrypoint-initdb.d/

# 如果init.sql未被正确挂载，可以手动复制
docker cp init.sql mall-mysql-dev:/docker-entrypoint-initdb.d/
```

#### 3. 手动导入数据库备份

如果自动初始化失败，可以手动导入备份文件：
```bash
# 方法1：直接导入SQL文件
cat init.sql | docker exec -i mall-mysql-dev mysql -uroot -pzhx199710085470 shop

# 方法2：从容器内部导入
docker cp init.sql mall-mysql-dev:/tmp/
docker exec -it mall-mysql-dev bash -c "mysql -uroot -pzhx199710085470 shop < /tmp/init.sql"
```

### Node.js后端相关问题

#### 1. 无法连接到数据库

**可能原因**:
- MySQL容器未准备好
- 环境变量配置错误
- 网络问题

**解决方案**:
```bash
# 检查MySQL容器状态
docker logs mall-mysql-dev

# 确认网络连接
docker exec -it mall-server-dev ping mysql

# 手动验证数据库连接
docker exec -it mall-server-dev node -e "
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'mysql',
  user: 'root',
  password: 'zhx199710085470',
  database: 'shop'
});
conn.connect(err => {
  if(err) { console.error('连接错误:', err); process.exit(1); }
  console.log('数据库连接成功!');
  conn.end();
});"
```

#### 2. Node.js应用启动失败

**解决方案**:
```bash
# 检查日志
docker logs mall-server-dev

# 进入容器排查
docker exec -it mall-server-dev sh
cd /app
node src/index.js
```

### 前端相关问题

#### 1. 前端构建失败

**可能原因**:
- Node模块问题
- 构建脚本错误

**解决方案**:
```bash
# 检查前端构建日志
docker logs mall-admin-dev

# 手动验证构建
cd mall-admin
npm install
npm run build -- --mode development
```

#### 2. Nginx配置问题

**解决方案**:
```bash
# 检查Nginx配置
docker exec -it mall-admin-dev cat /etc/nginx/conf.d/default.conf

# 验证Nginx状态
docker exec -it mall-admin-dev nginx -t
```

### 网络问题

#### 1. 容器间通信失败

**解决方案**:
```bash
# 检查网络设置
docker network inspect mall-network

# 重新创建网络
docker-compose down
docker network rm mall-network
docker-compose up -d
```

## 使用现有数据库备份

系统已配置使用项目根目录下的`init.sql`作为数据库初始化文件。该文件应包含完整的表结构和初始数据。

### 修改现有备份文件

如果需要修改备份文件，有以下几点需要注意：

1. 确保文件包含正确的编码设置：
```sql
SET NAMES utf8mb4;
```

2. 如果是从MySQL导出的备份，请检查是否包含数据库创建语句：
```sql
CREATE DATABASE IF NOT EXISTS shop;
USE shop;
```

3. 表结构定义应包含完整的字符集设置：
```sql
CREATE TABLE ... 
ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 创建新的数据库备份

如果需要创建新的数据库备份，可以使用以下命令：
```bash
# 导出结构和数据
mysqldump -uroot -p shop --hex-blob > init.sql

# 仅导出结构
mysqldump -uroot -p --no-data shop > schema.sql

# 仅导出数据
mysqldump -uroot -p --no-create-info shop > data.sql
```

## 命令行工具

### 1. 快速重置环境
```bash
# 全部重置并重建
./start.sh down
docker system prune -f  # 谨慎使用，会删除未使用的容器、镜像和网络
./start.sh dev
```

### 2. 调试容器环境
```bash
# MySQL
docker exec -it mall-mysql-dev mysql -uroot -pzhx199710085470

# 后端
docker exec -it mall-server-dev sh

# 前端
docker exec -it mall-admin-dev sh
```

### 3. 查看所有日志
```bash
docker-compose logs | grep -i error
```

## 特定平台问题

### macOS相关

- Docker Desktop权限不足: 检查Docker Desktop权限设置
- 性能问题: 在Docker Desktop的资源设置中增加内存和CPU分配

### Windows相关

- 路径问题: 确保使用正确的路径格式，特别是在WSL2环境中
- 端口冲突: 检查IIS或其他本地服务

### Linux相关

- 权限问题: 确保当前用户在docker组中
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 部署前检查清单

1. 确保Docker和Docker Compose已安装并更新到最新版本
2. 检查所有配置文件的环境变量是否正确
3. 验证MySQL数据库名、用户名和密码设置
4. 确认端口3000、8080和3306未被占用
5. 测试网络连接性 