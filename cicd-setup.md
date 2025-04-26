# CI/CD 自动化部署系统使用说明

本项目使用 GitHub Actions 实现了代码推送后自动部署到阿里云服务器的功能，无需手动操作。

## 系统架构

1. 开发者提交代码到 GitHub 仓库
2. GitHub Actions 检测到代码推送，触发自动部署工作流
3. 工作流通过 SSH 连接到服务器
4. 工作流在服务器上拉取最新代码并执行部署脚本
5. 部署结果通过钉钉/企业微信/邮件通知开发团队

## 前置条件

1. 已完成 SSH 密钥配置（参见 `ssh-setup-guide.md`）
2. 服务器已开启 SSH 服务并允许密钥登录
3. GitHub 仓库中已添加 SSH 私钥作为 Secret
4. 部署脚本 `deploy-to-prod.sh` 已经配置好并测试通过

## 使用方法

### 正常开发流程

1. 在本地开发并测试功能
2. 提交代码到 GitHub 仓库的 main 或 master 分支
   ```bash
   git add .
   git commit -m "功能描述"
   git push origin main
   ```
3. 自动部署流程开始，无需手动操作
4. 部署状态通知将发送到配置的通知渠道

### 通知配置

编辑 `deployment-notification.sh` 文件，配置以下选项：

1. 钉钉通知：
   - 将 `ENABLE_DINGTALK` 设置为 `true`
   - 填写钉钉机器人的 Webhook 地址和安全设置（如需要）

2. 企业微信通知：
   - 将 `ENABLE_WECHAT_WORK` 设置为 `true`
   - 填写企业微信机器人的 Webhook 地址

3. 邮件通知：
   - 将 `ENABLE_EMAIL` 设置为 `true`
   - 设置收件人列表

### 查看部署状态

1. 在 GitHub 仓库页面点击 "Actions" 标签页
2. 查看最新的工作流运行状态和日志
3. 通过配置的通知渠道接收部署状态通知

## 系统维护

### 更新部署流程

如需修改部署流程，编辑以下文件：

- `.github/workflows/deploy.yml`: 修改 GitHub Actions 工作流配置
- `deployment-notification.sh`: 修改通知配置
- `deploy-to-prod.sh`: 修改服务器上的部署脚本

### 故障排查

1. 部署失败：
   - 检查 GitHub Actions 日志
   - 确认 SSH 密钥配置正确
   - 检查服务器上的部署脚本权限
   - 确认服务器网络和防火墙设置

2. 通知失败：
   - 检查 `deployment-notification.sh` 中的配置
   - 确认对应平台的 Webhook 地址正确
   - 检查网络连接是否正常

## 安全建议

1. 定期轮换 SSH 密钥
2. 使用最小权限原则配置部署账户
3. 不要在脚本中硬编码敏感信息
4. 保持 GitHub Actions 工作流定义文件的安全 