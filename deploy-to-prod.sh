#!/bin/bash

# 商城小程序生产环境一键部署脚本
# 作者: AI助手
# 日期: 2025-04-25

# 设置服务器IP地址
SERVER_IP="47.107.32.143"
MYSQL_PASSWORD="zhx123456"

echo "=== 开始部署商城小程序生产环境 ==="
echo "服务器IP: $SERVER_IP"

# 将API_URL导出为环境变量供docker-compose使用
export API_URL="http://$SERVER_IP:8084"

# 调用主部署脚本
./deploy-docker.sh $MYSQL_PASSWORD prod $SERVER_IP

echo "=== 生产环境部署完成 ==="
echo "可通过以下地址访问:"
echo "前端: http://$SERVER_IP"
echo "后端API: http://$SERVER_IP:8084/api"
echo "管理员用户名: dev_admin"
echo "管理员密码: dev_pass123" 