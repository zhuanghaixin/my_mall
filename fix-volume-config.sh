#!/bin/bash
# 该脚本修复docker-compose配置文件中的卷名问题

# 修复主配置文件
sed -i.bak 's/mysql-data: {}/mysql-data:/' docker-compose.yml
# 修复环境配置文件
sed -i.bak 's/mysql-data-dev: {}/mysql-data-dev:/' docker-compose.dev.yml
sed -i.bak 's/mysql-data-test: {}/mysql-data-test:/' docker-compose.test.yml
sed -i.bak 's/mysql-data-prod: {}/mysql-data-prod:/' docker-compose.prod.yml
sed -i.bak 's/mysql-data-staging: {}/mysql-data-staging:/' docker-compose.staging.yml 2>/dev/null || true

echo "配置文件已修复"
