# 生产环境部署指南

## 问题与解决方案

### 之前的问题
在使用 GitHub Actions 部署时，SSH 连接在前端构建过程中断开，导致部署失败：
```
client_loop: send disconnect: Broken pipe
Error: Process completed with exit code 255.
```

**原因分析：**
1. 前端构建耗时长（npm install 2分钟 + vite build 数分钟）
2. GitHub Actions 的 SSH 会话在长时间无输出时超时
3. SSH 断开后，前台进程被终止

### 解决方案

#### 1. 使用后台部署
部署脚本在服务器后台运行，不受 SSH 连接影响：
```bash
nohup bash deploy-to-prod.sh > deploy.log 2>&1 &
```

#### 2. Docker 构建优化
- 使用 Docker 层缓存加速构建
- 添加 `--no-audit --no-fund` 参数跳过不必要的检查
- 设置 `CI=true` 优化构建输出

#### 3. SSH 保活设置
在 GitHub Actions 中添加：
```yaml
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=120
```

## 部署方式

### 方式 1: GitHub Actions 自动部署（推荐）

**配置步骤：**

1. 在 GitHub 仓库设置 Secrets：
   ```
   Settings -> Secrets and variables -> Actions -> New repository secret
   ```
   
   添加以下 secrets：
   - `SSH_PRIVATE_KEY`: 服务器 SSH 私钥
   - `SERVER_IP`: 服务器 IP 地址（如: 47.107.32.143）

2. 推送代码到 main 分支自动触发部署：
   ```bash
   git add .
   git commit -m "your commit message"
   git push origin main
   ```

3. 或手动触发部署：
   - 进入 GitHub 仓库
   - 点击 "Actions"
   - 选择 "Deploy to Production"
   - 点击 "Run workflow"

**查看部署进度：**

在本地运行监控脚本：
```bash
./monitor-deploy.sh
# 或指定服务器 IP
./monitor-deploy.sh 47.107.32.143
```

### 方式 2: 直接在服务器上部署

SSH 登录服务器：
```bash
ssh root@47.107.32.143
cd /root/my_mall
git pull origin main
./deploy-to-prod.sh
```

### 方式 3: 本地触发远程部署

在本地运行：
```bash
ssh root@47.107.32.143 << 'EOF'
  cd /root/my_mall
  git pull origin main
  nohup bash deploy-to-prod.sh > deploy.log 2>&1 &
EOF

# 然后监控部署进度
./monitor-deploy.sh
```

## 文件关系说明

```
├── .github/workflows/deploy-prod.yml   # GitHub Actions 自动部署配置
├── docker-compose.prod.yml             # Docker Compose 配置（声明式）
├── deploy-to-prod.sh                   # 部署脚本（命令式，实际使用）
├── monitor-deploy.sh                   # 监控部署进度脚本
└── mall-admin/
    └── Dockerfile                      # 前端镜像构建配置
```

### 各文件作用：

1. **Dockerfile**
   - 定义如何构建前端 Docker 镜像
   - 两阶段构建：编译 Vue + 部署到 Nginx
   - 被 `deploy-to-prod.sh` 调用

2. **docker-compose.prod.yml**
   - 声明式配置，定义所有服务
   - 当前**仅作为配置参考**
   - 如果要使用，运行：`docker compose -f docker-compose.prod.yml up -d`

3. **deploy-to-prod.sh**
   - **实际使用的部署脚本**
   - 使用原生 Docker 命令
   - 包含详细日志和错误处理
   - 支持 HTTPS 配置

4. **.github/workflows/deploy-prod.yml**
   - GitHub Actions 工作流
   - 自动拉取代码并触发部署
   - 后台运行避免超时

5. **monitor-deploy.sh**
   - 实时监控部署进度
   - SSH 到服务器查看日志

## 部署验证

部署完成后，通过以下方式验证：

### 1. 检查容器状态
```bash
ssh root@47.107.32.143 "docker ps | grep mall"
```

应该看到 4 个容器：
- `mall-mysql-prod`
- `mall-server-prod`
- `mall-admin-prod`
- `mall-backend-proxy-prod`

### 2. 访问服务
- 前端 HTTPS: https://js101.fun
- 前端 HTTP: http://js101.fun (自动重定向到 HTTPS)
- 后端 API: https://js101.fun:8443/api
- 管理员账号: `dev_admin` / `dev_pass123`

### 3. 查看日志
```bash
# 查看所有容器日志
ssh root@47.107.32.143 << 'EOF'
  cd /root/my_mall
  docker logs mall-admin-prod --tail 50
  docker logs mall-server-prod --tail 50
  docker logs mall-backend-proxy-prod --tail 50
EOF

# 或查看部署日志
ssh root@47.107.32.143 "cat /root/my_mall/deploy.log"
```

## 常见问题

### Q1: GitHub Actions 部署失败
**A:** 检查 GitHub Secrets 是否正确配置：
```bash
# 验证 SSH 连接
ssh root@47.107.32.143 "echo 'SSH 连接正常'"
```

### Q2: 构建时间太长
**A:** Docker 已经优化了缓存策略，第二次构建会快很多。如果还是慢：
1. 在服务器上启用 npm 镜像加速
2. 考虑使用 Docker BuildKit

### Q3: 部署后服务无法访问
**A:** 按顺序检查：
```bash
# 1. 检查容器是否运行
docker ps | grep mall

# 2. 检查端口是否开放
netstat -tlnp | grep -E '80|443|8443'

# 3. 检查 Nginx 配置
docker exec mall-admin-prod nginx -t

# 4. 查看容器日志
docker logs mall-admin-prod --tail 100
```

### Q4: 如何回滚到上一个版本
```bash
ssh root@47.107.32.143 << 'EOF'
  cd /root/my_mall
  git log --oneline -5  # 查看最近的提交
  git checkout <commit-hash>  # 切换到指定版本
  ./deploy-to-prod.sh
EOF
```

## 性能优化建议

### 1. 启用 npm 镜像加速（国内服务器）
编辑 `mall-admin/Dockerfile`，取消注释：
```dockerfile
RUN npm config set registry https://registry.npmmirror.com
```

### 2. 使用 Docker BuildKit
在 `deploy-to-prod.sh` 中添加：
```bash
export DOCKER_BUILDKIT=1
```

### 3. 预构建镜像
在开发环境预先构建镜像并推送到 Docker Hub：
```bash
# 构建并推送
docker build -t your-username/mall-admin:latest ./mall-admin
docker push your-username/mall-admin:latest

# 在生产环境直接拉取
docker pull your-username/mall-admin:latest
```

## 监控与维护

### 日志管理
```bash
# 清理旧日志（防止磁盘占满）
ssh root@47.107.32.143 << 'EOF'
  find /var/lib/docker/containers -name "*.log" -size +100M -delete
  docker system prune -f
EOF
```

### 定期备份
```bash
# 备份数据库
ssh root@47.107.32.143 << 'EOF'
  docker exec mall-mysql-prod mysqldump -uroot -pzhx123456 shop > backup-$(date +%Y%m%d).sql
EOF
```

### 健康检查
在 `docker-compose.prod.yml` 中已配置健康检查：
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 总结

现在的部署流程：

1. **开发** → 本地开发完成
2. **提交** → `git push origin main`
3. **自动部署** → GitHub Actions 触发
4. **后台运行** → 服务器后台执行部署
5. **监控** → 使用 `./monitor-deploy.sh` 查看进度
6. **验证** → 访问服务确认部署成功

整个流程完全自动化，解决了 SSH 超时问题！

