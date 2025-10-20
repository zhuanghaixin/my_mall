#!/bin/bash

# 前端构建测试脚本
# 用于在部署前验证构建是否正常

echo "=== 前端构建测试脚本 ==="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # 恢复默认颜色

# 清理旧的构建产物
echo -e "${BLUE}[1/4] 清理旧的构建产物...${NC}"
rm -rf dist

# 安装依赖（如果需要）
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}[2/4] 安装依赖...${NC}"
  npm install --legacy-peer-deps
else
  echo -e "${GREEN}[2/4] 依赖已存在，跳过安装${NC}"
fi

# 执行构建
echo -e "${BLUE}[3/4] 执行生产环境构建...${NC}"
npx vite build --mode production

# 检查构建结果
if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✓ 构建成功!${NC}"
  echo ""
  echo -e "${BLUE}[4/4] 构建产物信息:${NC}"
  echo "----------------------------------------"
  ls -lh dist/
  echo "----------------------------------------"
  echo ""
  echo -e "${GREEN}可以使用以下命令预览:${NC}"
  echo "  npm run preview"
  echo ""
  echo -e "${GREEN}或者直接部署到生产环境${NC}"
else
  echo ""
  echo -e "${RED}✗ 构建失败，请检查错误信息${NC}"
  exit 1
fi

