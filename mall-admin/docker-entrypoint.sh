#!/bin/sh

echo "开始运行应用，替换环境变量..."

# 替换所有以VITE_开头的环境变量
for envvar in $(env | grep '^VITE_'); do
  key=$(echo $envvar | cut -d= -f1)
  value=$(echo $envvar | cut -d= -f2-)
  
  echo "替换环境变量: $key"
  
  # 使用sed进行替换，匹配__KEY__格式
  sed -i "s|__${key}__|${value}|g" /usr/share/nginx/html/index.html
done

# 单独处理API_URL（向下兼容）
if [ -n "$VITE_API_URL" ]; then
  echo "替换API URL: $VITE_API_URL"
  sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" /usr/share/nginx/html/index.html
fi

# 添加环境标识到HTML注释中
DEPLOY_ENV=${DEPLOY_ENV:-production}
DEPLOY_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

echo "环境: $DEPLOY_ENV"
echo "构建时间: $DEPLOY_TIME"

# 添加部署信息作为HTML注释
sed -i "s|</head>|<!-- 环境: $DEPLOY_ENV -->\n<!-- 部署时间: $DEPLOY_TIME -->\n</head>|g" /usr/share/nginx/html/index.html

# 输出调试信息
echo "环境变量替换完成，启动Nginx..."

# 启动Nginx
exec nginx -g "daemon off;" 