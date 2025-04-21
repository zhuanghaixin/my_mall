#!/bin/bash

# 测试脚本，验证用户管理API是否正常工作

# 设置基础URL
BASE_URL="http://localhost:3000/api"

# 测试登录接口获取token (假设有admin/admin123登录凭证)
echo "=== 测试登录接口 ==="
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "登录响应: $LOGIN_RESPONSE"

# 从登录响应中提取token
TOKEN=$(echo $LOGIN_RESPONSE | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "无法获取token，请检查登录接口是否正常"
  exit 1
fi

echo "获取到Token: $TOKEN"

# 测试用户列表接口
echo -e "\n=== 测试用户列表接口 ==="
USER_LIST_URL="${BASE_URL}/admin/user/list?pageNum=1&pageSize=10"
echo "请求URL: $USER_LIST_URL"

curl -v -X GET "$USER_LIST_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# 测试直接访问/admin/user/list (不带/api前缀)看是否能正常工作
echo -e "\n\n=== 测试不带/api前缀的用户列表接口 ==="
DIRECT_URL="http://localhost:3000/admin/user/list?pageNum=1&pageSize=10"
echo "请求URL: $DIRECT_URL"

curl -v -X GET "$DIRECT_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n测试完成" 