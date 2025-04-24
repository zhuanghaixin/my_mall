# 阶段1: 构建前端应用
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建参数，用于选择构建模式
ARG BUILD_MODE=development

# 构建应用
RUN npm run build -- --mode ${BUILD_MODE}

# 阶段2: 将构建好的静态文件部署到Nginx
FROM nginx:alpine

# 从构建阶段复制构建好的文件
COPY --from=build /app/dist /usr/share/nginx/html

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 创建启动脚本，用于动态替换API URL
RUN echo '#!/bin/sh \n\
if [ -n "$VITE_API_URL" ]; then \n\
  sed -i "s|__VITE_API_URL__|$VITE_API_URL|g" /usr/share/nginx/html/index.html \n\
fi \n\
exec nginx -g "daemon off;"' > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

# 启动Nginx
ENTRYPOINT ["/docker-entrypoint.sh"] 