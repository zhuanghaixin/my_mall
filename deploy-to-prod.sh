#!/bin/bash

# 商城小程序生产环境一键部署脚本（Docker原生命令版）
# 作者: AI助手
# 日期: 2025-04-25
# 更新: 使用新版docker compose命令，添加HTTPS支持，前后端分离Nginx配置

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# 设置服务器IP地址和环境变量
SERVER_IP="js101.fun"
DOMAIN="js101.fun"
WWW_DOMAIN="www.js101.fun"
MYSQL_PASSWORD="zhx123456"
ENV="prod"
PROJECT_NAME="mall-system-${ENV}"
MYSQL_CONTAINER="mall-mysql-${ENV}"
SERVER_CONTAINER="mall-server-${ENV}"
ADMIN_CONTAINER="mall-admin-${ENV}"
BACKEND_PROXY_CONTAINER="mall-backend-proxy-${ENV}"
NETWORK_NAME="${PROJECT_NAME}_mall-network"
FRONTEND_PORT=80
FRONTEND_SSL_PORT=443
BACKEND_PORT=8084
BACKEND_SSL_PORT=8443
MYSQL_PORT=3310
# 添加MySQL数据持久化目录
MYSQL_DATA_DIR="./mysql-data-${ENV}"

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
if ! docker compose version &> /dev/null; then
  log_warn "警告: 未检测到新版docker compose命令，可能需要更新Docker或安装Docker Compose插件"
  log_info "脚本将继续使用Docker原生命令执行..."
fi

echo -e "${BLUE}=== 开始部署商城小程序生产环境 ===${NC}"
echo -e "${BLUE}服务器IP: $SERVER_IP${NC}"
echo -e "${BLUE}域名: $DOMAIN / $WWW_DOMAIN${NC}"

# 创建MySQL数据持久化目录
if [ ! -d "$MYSQL_DATA_DIR" ]; then
  log_info "创建MySQL数据持久化目录..."
  mkdir -p $MYSQL_DATA_DIR
fi

# 修改清理容器的逻辑，保留MySQL容器
log_info "清理旧服务容器..."
# 检查MySQL容器是否存在
MYSQL_EXISTS=$(docker ps -a -q -f name=$MYSQL_CONTAINER)
# 清理其他服务容器，但保留MySQL容器
docker rm -f $SERVER_CONTAINER $ADMIN_CONTAINER $BACKEND_PROXY_CONTAINER 2>/dev/null || true
docker network rm $NETWORK_NAME 2>/dev/null || true

# 将API_URL导出为环境变量供下面的命令使用
export API_URL="https://$SERVER_IP:$BACKEND_SSL_PORT"
export MYSQL_PASSWORD=$MYSQL_PASSWORD
export SERVER_IP=$SERVER_IP

# 检查关键目录和文件
if [ ! -d "mall-server" ] || [ ! -d "mall-admin" ]; then
  log_error "错误: 缺少前端或后端代码目录"
  exit 1
fi

if [ ! -f "init.sql" ]; then
  log_warn "警告: 缺少初始化SQL文件，可能导致数据库未正确初始化"
fi

# 检查SSL证书文件
log_info "检查SSL证书文件..."
if [ ! -d "js101.fun_nginx" ] || [ ! -f "js101.fun_nginx/js101.fun.key" ] || [ ! -f "js101.fun_nginx/js101.fun_bundle.crt" ]; then
  log_error "错误: 缺少SSL证书文件，请确保js101.fun_nginx目录下有证书文件"
  exit 1
fi

# 创建SSL证书目录
log_info "创建SSL证书目录..."
mkdir -p ssl-certs
cp js101.fun_nginx/js101.fun.key ssl-certs/
cp js101.fun_nginx/js101.fun_bundle.crt ssl-certs/

# 创建网络
log_info "创建网络 $NETWORK_NAME..."
docker network create $NETWORK_NAME || true

# 处理MySQL容器
if [ -z "$MYSQL_EXISTS" ]; then
  # 如果MySQL容器不存在，创建一个新的并初始化
  log_info "MySQL容器不存在，创建新的MySQL容器并初始化数据库..."
  docker run --name $MYSQL_CONTAINER \
    -e MYSQL_ROOT_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_DATABASE=shop \
    -e MYSQL_ROOT_HOST=% \
    -p $MYSQL_PORT:3306 \
    -v $MYSQL_DATA_DIR:/var/lib/mysql \
    -v $(pwd)/init.sql:/docker-entrypoint-initdb.d/init.sql \
    --network $NETWORK_NAME \
    --network-alias mysql \
    -d mysql:8.0 \
    --default-authentication-plugin=mysql_native_password \
    --character-set-server=utf8mb4 \
    --collation-server=utf8mb4_unicode_ci
else
  # 如果MySQL容器已存在，启动它并连接到网络
  log_info "MySQL容器已存在，启动并连接到网络..."
  docker start $MYSQL_CONTAINER
  docker network connect $NETWORK_NAME $MYSQL_CONTAINER || true
  # 为MySQL容器设置网络别名
  docker network disconnect $NETWORK_NAME $MYSQL_CONTAINER 2>/dev/null || true
  docker network connect --alias mysql $NETWORK_NAME $MYSQL_CONTAINER
fi

# 等待MySQL启动
log_info "等待MySQL启动..."
MAX_WAIT=60
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

# 创建后端服务镜像
log_info "构建后端服务镜像..."
cd mall-server
docker build -t mall-system-${ENV}_mall-server .
cd ..

# 启动后端容器
log_info "启动后端服务..."
# 创建图片上传持久化目录
UPLOADS_DATA_DIR="./uploads-prod"
if [ ! -d "$UPLOADS_DATA_DIR" ]; then
  log_info "创建图片上传持久化目录..."
  mkdir -p $UPLOADS_DATA_DIR
fi

docker run -d \
  --name $SERVER_CONTAINER \
  --network $NETWORK_NAME \
  -p $BACKEND_PORT:8080 \
  -e NODE_ENV=production \
  -e DB_HOST=mysql \
  -e DB_PORT=3306 \
  -e DB_NAME=shop \
  -e DB_USER=root \
  -e DB_PASSWORD=$MYSQL_PASSWORD \
  -e API_PREFIX=/api \
  -e SERVER_IP=$SERVER_IP \
  -e SERVER_BASE_URL="https://$SERVER_IP:$BACKEND_SSL_PORT" \
  -e JWT_SECRET=mall_${ENV}_secret_key_2023 \
  -e JWT_EXPIRES_IN=7d \
  -e ADMIN_USERNAME=dev_admin \
  -e ADMIN_PASSWORD=dev_pass123 \
  -v $(pwd)/uploads-prod:/app/public/uploads \
  --restart unless-stopped \
  mall-system-${ENV}_mall-server

log_info "等待后端服务启动..."
sleep 10

# 创建前端服务镜像
log_info "构建前端服务镜像..."
cd mall-admin
docker build -t mall-system-${ENV}_mall-admin .
cd ..

# 创建后端SSL代理的Nginx配置
log_info "创建后端SSL代理的Nginx配置..."
mkdir -p backend-nginx-conf
cat > backend-nginx-conf/default.conf <<EOF
# 后端API的SSL代理配置
server {
    listen 8443 ssl;
    server_name $SERVER_IP $DOMAIN $WWW_DOMAIN localhost;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/js101.fun_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/js101.fun.key;
    
    # SSL设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # 日志配置
    access_log /var/log/nginx/backend_access_ssl.log;
    error_log /var/log/nginx/backend_error_ssl.log debug;
    
    # 配置上传文件的客户端大小限制
    client_max_body_size 20M;
    
    # API代理配置 - 转发到后端服务
    location / {
        proxy_pass http://$SERVER_CONTAINER:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 专门处理上传文件目录的路由
    location /public/uploads/ {
        proxy_pass http://$SERVER_CONTAINER:8080/public/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 健康检查
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# 启动后端SSL代理容器
log_info "启动后端SSL代理容器..."
docker run -d \
  --name $BACKEND_PROXY_CONTAINER \
  --network $NETWORK_NAME \
  -p $BACKEND_SSL_PORT:8443 \
  -v $(pwd)/backend-nginx-conf/default.conf:/etc/nginx/conf.d/default.conf \
  -v $(pwd)/ssl-certs/js101.fun.key:/etc/nginx/ssl/js101.fun.key \
  -v $(pwd)/ssl-certs/js101.fun_bundle.crt:/etc/nginx/ssl/js101.fun_bundle.crt \
  --restart unless-stopped \
  nginx:alpine

# 创建适合当前环境的前端nginx配置
log_info "创建前端Nginx配置..."
mkdir -p nginx-conf
cat > nginx-conf/default.conf <<EOF
# HTTP 配置 - 重定向到HTTPS
server {
    listen 80;
    server_name $SERVER_IP $DOMAIN $WWW_DOMAIN localhost;
    
    # 日志配置
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log debug;
    
    # 重定向所有HTTP请求到HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
    
    # 健康检查端点保留在HTTP
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}

# HTTPS 配置
server {
    listen 443 ssl;
    server_name $SERVER_IP $DOMAIN $WWW_DOMAIN localhost;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/js101.fun_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/js101.fun.key;
    
    # SSL设置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS配置（备案通过后可考虑启用）
    # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # 根目录配置
    root /usr/share/nginx/html;
    index index.html;
    
    # 日志配置
    access_log /var/log/nginx/access_ssl.log;
    error_log /var/log/nginx/error_ssl.log debug;
    
    # 支持SPA应用路由
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # 静态资源缓存设置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # 重写 /admin/login 到 /api/admin/login
    location = /admin/login {
        rewrite ^/admin/login$ /api/admin/login last;
    }
    
    # API代理配置 - 使用后端SSL代理
    location /api/ {
        # 使用后端SSL代理而不是直接连接后端容器
        proxy_pass https://$BACKEND_PROXY_CONTAINER:8443/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        # 针对大文件上传的优化配置
        client_max_body_size 20M;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # 上传文件代理配置
    location /uploads/ {
        proxy_pass https://$BACKEND_PROXY_CONTAINER:8443/public/uploads/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 确保所有不带/api前缀的API请求也能正确转发
    location ~* ^/(?!api/)(.*)$ {
        try_files \$uri \$uri/ /index.html;
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

# 启动前端容器
log_info "启动前端服务..."
docker run -d \
  --name $ADMIN_CONTAINER \
  --network $NETWORK_NAME \
  -p $FRONTEND_PORT:80 \
  -p $FRONTEND_SSL_PORT:443 \
  -e VITE_API_URL="https://$SERVER_IP:$BACKEND_SSL_PORT/api" \
  -e NODE_ENV=production \
  -v $(pwd)/nginx-conf/default.conf:/etc/nginx/conf.d/default.conf \
  -v $(pwd)/ssl-certs/js101.fun.key:/etc/nginx/ssl/js101.fun.key \
  -v $(pwd)/ssl-certs/js101.fun_bundle.crt:/etc/nginx/ssl/js101.fun_bundle.crt \
  --restart unless-stopped \
  mall-system-${ENV}_mall-admin

# 检查前端容器是否启动成功
if ! docker ps | grep -q $ADMIN_CONTAINER; then
  log_error "前端容器启动失败，请检查日志:"
  docker logs $ADMIN_CONTAINER
else
  log_success "前端容器启动成功"
fi

# 检查后端SSL代理容器是否启动成功
if ! docker ps | grep -q $BACKEND_PROXY_CONTAINER; then
  log_error "后端SSL代理容器启动失败，请检查日志:"
  docker logs $BACKEND_PROXY_CONTAINER
else
  log_success "后端SSL代理容器启动成功"
fi

# 检查服务状态
log_info "检查服务状态..."
docker ps | grep -E "(mall-mysql|mall-server|mall-admin|mall-backend-proxy)-${ENV}"

# 检查部署结果
log_info "验证部署结果..."
CONTAINERS=$(docker ps | grep -E "(mall-mysql|mall-server|mall-admin|mall-backend-proxy)-${ENV}" | wc -l)

if [ "$CONTAINERS" -eq "4" ]; then
  log_success "=== 生产环境部署成功! ==="
  log_success "所有容器都在正常运行"
else
  log_error "=== 部署可能存在问题! ==="
  log_error "预期4个容器，但只有 $CONTAINERS 个在运行"
  docker ps | grep -E "(mall-mysql|mall-server|mall-admin|mall-backend-proxy)-${ENV}"
  log_warn "请检查上面的容器列表和日志以排查问题"
fi

# 添加诊断信息
log_info "容器运行状态:"
docker ps -a | grep -E "(mall-mysql|mall-server|mall-admin|mall-backend-proxy)-${ENV}"

log_info "网络信息:"
docker network inspect $NETWORK_NAME | grep -E 'Name|IPv4Address'

# 检查容器日志
log_info "前端容器日志 (最后5行):"
docker logs --tail 5 $ADMIN_CONTAINER 2>/dev/null || log_warn "前端容器未运行，无法获取日志"

log_info "后端容器日志 (最后5行):"
docker logs --tail 5 $SERVER_CONTAINER 2>/dev/null || log_warn "后端容器未运行，无法获取日志"

log_info "后端SSL代理容器日志 (最后5行):"
docker logs --tail 5 $BACKEND_PROXY_CONTAINER 2>/dev/null || log_warn "后端SSL代理容器未运行，无法获取日志"

log_success "=== 可通过以下地址访问: ==="
log_success "前端HTTPS: https://$SERVER_IP"
log_success "前端HTTP (会重定向到HTTPS): http://$SERVER_IP"
log_success "后端API (HTTPS): https://$SERVER_IP:$BACKEND_SSL_PORT/api"
log_success "后端API (HTTP): http://$SERVER_IP:$BACKEND_PORT/api"
log_success "待备案完成后，还可通过以下地址访问:"
log_success "https://$DOMAIN 或 https://$WWW_DOMAIN"
log_success "管理员用户名: dev_admin"
log_success "管理员密码: dev_pass123"
log_success "MySQL数据库: $SERVER_IP:$MYSQL_PORT (用户名: root, 密码: $MYSQL_PASSWORD)"

log_info "=== 部署过程完成 ===" 