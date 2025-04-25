# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 首先复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=development
ENV PORT=8080
ENV DB_HOST=mysql
ENV DB_USER=root
ENV DB_PASSWORD=zhx123456
ENV DB_PORT=3306
ENV DB_NAME=shop

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["node", "src/index.js"] 