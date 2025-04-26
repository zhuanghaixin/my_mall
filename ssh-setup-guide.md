# SSH密钥设置指南

## 1. 在本地生成SSH密钥对

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com" -f github-action-deploy
```

这会生成:
- `github-action-deploy`（私钥）
- `github-action-deploy.pub`（公钥）

## 2. 将公钥添加到服务器

```bash
# 复制公钥内容
cat github-action-deploy.pub

# 登录服务器
ssh root@47.107.32.143

# 在服务器上
mkdir -p ~/.ssh
echo "复制的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## 3. 将私钥添加到GitHub仓库

1. 打开GitHub仓库页面
2. 点击 `Settings` -> `Secrets and variables` -> `Actions`
3. 点击 `New repository secret`
4. 名称输入: `SSH_PRIVATE_KEY`
5. 值: 复制整个私钥文件内容（包括开头和结尾行）
   ```bash
   cat github-action-deploy
   ```
6. 点击 `Add secret` 保存

## 4. 测试部署

1. 提交并推送一个小改动到main或master分支
2. 在GitHub仓库页面查看 `Actions` 选项卡，检查工作流是否触发并成功执行 