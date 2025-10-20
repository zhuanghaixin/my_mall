# 阶段1: 构建前端应用
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --legacy-peer-deps

# 安装vite
RUN npm install -g vite

# 复制源代码
COPY . .

# 构建参数，用于选择构建模式
ARG BUILD_MODE=production
ENV BUILD_MODE=${BUILD_MODE}

# 增加 Node.js 内存限制，避免构建大型项目时内存溢出
ENV NODE_OPTIONS="--max-old-space-size=4096"

# 验证环境配置
RUN if [ -f ".env.${BUILD_MODE}" ]; then \
      echo "使用环境配置: .env.${BUILD_MODE}"; \
      if [ -f "scripts/verify-env.js" ]; then \
        node scripts/verify-env.js ${BUILD_MODE}; \
      fi \
    else \
      echo "警告: 环境文件 .env.${BUILD_MODE} 不存在，使用默认环境"; \
    fi

# 直接使用vite构建，绕过TypeScript检查
RUN npx vite build --mode ${BUILD_MODE}

# 阶段2: 将构建好的静态文件部署到Nginx
FROM nginx:alpine

# 从构建阶段复制构建好的文件
COPY --from=build /app/dist /usr/share/nginx/html

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制自定义入口脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 添加构建时间和环境信息
ARG BUILD_TIME=unknown
ENV BUILD_TIME=${BUILD_TIME}

ARG DEPLOY_ENV=production
ENV DEPLOY_ENV=${DEPLOY_ENV}

# 启动Nginx
ENTRYPOINT ["/docker-entrypoint.sh"] 