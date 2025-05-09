#!/bin/bash

# 部署状态通知脚本
# 使用方法: ./deployment-notification.sh [start|success|failure] "可选的额外信息"

# 配置区域 - 根据需要修改
# ===================================================
# 项目信息
PROJECT_NAME="商城小程序"
SERVER_IP="js101.fun"

# 企业微信配置
ENABLE_WECHAT_WORK=false  # 设为true启用企业微信通知
WECHAT_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY"

# 钉钉配置
ENABLE_DINGTALK=true  # 设为true启用钉钉通知
DINGTALK_WEBHOOK="https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN"
DINGTALK_SECRET="YOUR_SECRET"  # 安全设置对应的加签密钥，不设置可留空

# 邮件配置
ENABLE_EMAIL=false  # 设为true启用邮件通知
EMAIL_RECIPIENTS="admin@example.com,dev@example.com"
# ===================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取当前git提交信息
get_git_info() {
  GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "未知")
  GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "未知")
  GIT_AUTHOR=$(git log -1 --pretty=format:'%an' 2>/dev/null || echo "未知")
  GIT_COMMIT_MSG=$(git log -1 --pretty=format:'%s' 2>/dev/null || echo "未知")
}

# 根据参数生成通知内容
generate_message() {
  STATUS=$1
  EXTRA_INFO=$2
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  case $STATUS in
    start)
      TITLE="🚀 部署开始"
      CONTENT="**$PROJECT_NAME** 部署任务已开始\n\n**服务器:** $SERVER_IP\n**分支:** $GIT_BRANCH\n**提交:** $GIT_COMMIT\n**提交者:** $GIT_AUTHOR\n**提交信息:** $GIT_COMMIT_MSG\n**时间:** $TIMESTAMP"
      ;;
    success)
      TITLE="✅ 部署成功"
      CONTENT="**$PROJECT_NAME** 部署成功\n\n**服务器:** $SERVER_IP\n**分支:** $GIT_BRANCH\n**提交:** $GIT_COMMIT\n**提交者:** $GIT_AUTHOR\n**提交信息:** $GIT_COMMIT_MSG\n**时间:** $TIMESTAMP"
      ;;
    failure)
      TITLE="❌ 部署失败"
      CONTENT="**$PROJECT_NAME** 部署失败\n\n**服务器:** $SERVER_IP\n**分支:** $GIT_BRANCH\n**提交:** $GIT_COMMIT\n**提交者:** $GIT_AUTHOR\n**提交信息:** $GIT_COMMIT_MSG\n**错误信息:** $EXTRA_INFO\n**时间:** $TIMESTAMP"
      ;;
    *)
      echo -e "${RED}错误: 未知状态 '$STATUS'${NC}"
      echo "使用方法: $0 [start|success|failure] \"可选的额外信息\""
      exit 1
      ;;
  esac
}

# 发送企业微信通知
send_wechat_work_notification() {
  if [ "$ENABLE_WECHAT_WORK" != "true" ]; then
    return 0
  fi

  echo -e "${BLUE}正在发送企业微信通知...${NC}"
  
  # 构建企业微信消息
  WECHAT_MSG='{
    "msgtype": "markdown",
    "markdown": {
      "content": "'"${TITLE}\n${CONTENT}"'"
    }
  }'
  
  # 发送消息
  curl -s -H "Content-Type: application/json" -X POST -d "$WECHAT_MSG" $WECHAT_WEBHOOK
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}企业微信通知发送成功${NC}"
  else
    echo -e "${RED}企业微信通知发送失败${NC}"
  fi
}

# 计算钉钉签名
calculate_dingtalk_sign() {
  TIMESTAMP=$(date +%s000)
  STRING_TO_SIGN="${TIMESTAMP}\n${DINGTALK_SECRET}"
  SIGN=$(echo -n "$STRING_TO_SIGN" | openssl dgst -sha256 -hmac "$DINGTALK_SECRET" -binary | base64)
  DINGTALK_SIGNED_URL="${DINGTALK_WEBHOOK}&timestamp=${TIMESTAMP}&sign=${SIGN}"
}

# 发送钉钉通知
send_dingtalk_notification() {
  if [ "$ENABLE_DINGTALK" != "true" ]; then
    return 0
  fi

  echo -e "${BLUE}正在发送钉钉通知...${NC}"
  
  # 如果设置了密钥，计算签名
  if [ -n "$DINGTALK_SECRET" ]; then
    calculate_dingtalk_sign
    WEBHOOK_URL=$DINGTALK_SIGNED_URL
  else
    WEBHOOK_URL=$DINGTALK_WEBHOOK
  fi
  
  # 构建钉钉消息
  DINGTALK_MSG='{
    "msgtype": "markdown",
    "markdown": {
      "title": "'"$TITLE"'",
      "text": "'"$CONTENT"'"
    },
    "at": {
      "isAtAll": true
    }
  }'
  
  # 发送消息
  curl -s -H "Content-Type: application/json" -X POST -d "$DINGTALK_MSG" $WEBHOOK_URL
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}钉钉通知发送成功${NC}"
  else
    echo -e "${RED}钉钉通知发送失败${NC}"
  fi
}

# 发送邮件通知
send_email_notification() {
  if [ "$ENABLE_EMAIL" != "true" ]; then
    return 0
  fi

  echo -e "${BLUE}正在发送邮件通知...${NC}"
  
  # 替换换行符为HTML换行
  EMAIL_CONTENT=$(echo -e "$CONTENT" | sed 's/\\n/<br>/g')
  
  # 构建邮件内容
  EMAIL_BODY="To: $EMAIL_RECIPIENTS
Subject: [$PROJECT_NAME] $TITLE
Content-Type: text/html; charset=UTF-8

<html>
<body>
<h2>$TITLE</h2>
<p>$EMAIL_CONTENT</p>
</body>
</html>"
  
  # 发送邮件
  echo "$EMAIL_BODY" | sendmail -t
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}邮件通知发送成功${NC}"
  else
    echo -e "${RED}邮件通知发送失败${NC}"
  fi
}

# 主函数
main() {
  if [ $# -lt 1 ]; then
    echo "使用方法: $0 [start|success|failure] \"可选的额外信息\""
    exit 1
  fi
  
  STATUS=$1
  EXTRA_INFO=$2
  
  # 获取git信息
  get_git_info
  
  # 生成通知消息
  generate_message "$STATUS" "$EXTRA_INFO"
  
  # 发送各类通知
  send_wechat_work_notification
  send_dingtalk_notification
  send_email_notification
  
  echo -e "${GREEN}通知发送完成${NC}"
}

# 运行主函数
main "$@" 