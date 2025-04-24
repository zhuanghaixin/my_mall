# 商城系统Docker部署

本项目使用Docker部署Mall商城的前端(mall-admin)和后端(mall-server)应用。

## 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 支持三种环境:
  - 开发环境(dev)
  - 测试环境(test)
  - 生产环境(prod)

## 目录结构

```
.
├── docker-compose.yml        # 基础Docker Compose配置
├── docker-compose.dev.yml    # 开发环境配置
├── docker-compose.test.yml   # 测试环境配置
├── docker-compose.prod.yml   # 生产环境配置
├── start.sh                  # 启动脚本
├── init.sql                  # 数据库初始化SQL文件
├── mall-admin/               # 前端项目目录
│   ├── Dockerfile            # 前端Docker构建文件
│   ├── nginx.conf            # Nginx配置
│   └── ...
├── mall-server/              # 后端项目目录
│   ├── Dockerfile            # 后端Docker构建文件
│   └── ...
└── troubleshooting.md        # 故障排除指南
```

## 数据库初始化

系统使用项目根目录下的`init.sql`文件初始化MySQL数据库。这个文件包含了完整的表结构和初始数据。

如果您需要修改数据库结构或数据，建议：
1. 先本地修改数据库
2. 导出新的SQL文件：`mysqldump -uroot -p shop > init.sql`
3. 用新的SQL文件替换项目中的init.sql
4. 重新部署：`./start.sh`

## 快速开始

使用脚本启动不同环境:

```bash
# 赋予启动脚本执行权限
chmod +x start.sh

# 启动开发环境(默认)
./start.sh

# 启动测试环境
./start.sh test

# 启动生产环境
./start.sh prod

# 停止所有容器
./start.sh down

# 查看容器日志
./start.sh logs

# 显示帮助信息
./start.sh help
```

## 服务说明

| 服务 | 开发环境端口 | 测试/生产环境端口 | 说明 |
|-----|------------|-----------------|-----|
| 前端 | 3000 | 3000 | mall-admin: Vite + Vue.js |
| 后端 | 8080 | 8080 | mall-server: Node.js |
| 数据库 | 3306 | 3306 | MySQL 8.0 |

## 环境配置

### 前端环境变量

前端环境变量在三个位置配置:
1. `.env.*`文件中
2. `docker-compose.*.yml`中的environment部分
3. Dockerfile的构建参数(ARG)

主要环境变量:
- `VITE_API_URL`: API基础URL
- `VITE_USE_MOCK`: 是否使用模拟数据
- `VITE_USE_DEVTOOLS`: 是否启用开发工具

### 后端环境变量

后端环境变量同样在三个位置配置:
1. `.env.*`文件中
2. `docker-compose.*.yml`中的environment部分
3. Dockerfile中的ENV

主要环境变量:
- `NODE_ENV`: 环境类型(development/testing/production)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: 数据库配置
- `JWT_SECRET`: JWT密钥
- `API_PREFIX`: API前缀
- `LOG_LEVEL`: 日志级别

## 数据持久化

所有环境的MySQL数据使用Docker卷进行持久化:
- 开发环境: `mysql-data-dev`
- 测试环境: `mysql-data-test`
- 生产环境: `mysql-data-prod`

上传的文件保存在:
- `./mall-server/public/uploads`

## 安全注意事项

1. 生产环境部署前需修改所有默认密码和密钥
2. 建议使用Docker Secrets或环境变量文件管理敏感信息
3. 避免将敏感信息提交到版本控制系统

## 故障排除

如果遇到部署问题，请参阅 [故障排除指南](troubleshooting.md)，其中包含常见问题和解决方案。

### 常见问题快速解决

1. **MySQL连接失败**:
```bash
# 检查MySQL状态
docker logs mall-mysql-dev
```

2. **容器无法启动**:
```bash
# 重置环境
./start.sh down
docker system prune -f
./start.sh
```

3. **端口冲突**:
   - 确保3000, 8080, 3306端口未被占用
   - 如果被占用，可以修改docker-compose.yml中的端口映射

4. **数据库初始化失败**:
```bash
# 手动导入数据库
cat init.sql | docker exec -i mall-mysql-dev mysql -uroot -pzhx199710085470 shop
```

## 常见问题

**Q: 如何更新已部署的应用?**
A: 使用以下命令更新:
```bash
git pull  # 获取最新代码
./start.sh [env]  # 重新构建并启动
```

**Q: 如何备份数据库?**
A: 可以使用以下命令:
```bash
docker exec mall-mysql-[env] mysqldump -u root -pzhx199710085470 shop > backup.sql
```

**Q: 前端无法连接后端API?**
A: 检查`VITE_API_URL`配置是否正确，确保网络连接正常。

## 贡献

欢迎提交问题和改进建议。 