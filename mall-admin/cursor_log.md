- 会话日期和时间：2024-06-09
- 主要目的：实现并发上传功能
- 完成的主要任务：
  1. 使用Promise.all实现了并行上传多个分片
  2. 添加了并发数量控制功能
  3. 增加了上传模式切换（并发/顺序）
- 关键决策和解决方案：
  - 使用Promise.all进行批量并发请求处理
  - 通过concurrentLimit参数控制并发数量
  - 设计上传模式切换UI（开关切换并发/顺序模式）
  - 优化错误处理和重试机制以支持并发场景
  - 重构代码结构以便更好支持不同上传模式
- 使用的技术栈：
  - Vue3、TypeScript、Element Plus、Promise.all
- 修改的文件：
  - mall-admin/src/views/project/upload.vue
- 会话日期和时间：2024-06-09
- 主要目的：为大文件上传组件添加暂停与继续功能
- 完成的主要任务：
  1. 实现了上传暂停功能
  2. 添加了上传继续功能
  3. 优化了上传按钮布局，将暂停、继续和取消按钮排列在一行
- 关键决策和解决方案：
  - 使用isPaused状态变量跟踪上传暂停状态
  - 记录暂停时间来准确计算总上传时间
  - 实现了保存当前分片索引以便从暂停点继续上传
  - 在各个上传流程环节添加暂停状态检查
  - 优化进度条UI样式，暂停时显示不同状态
- 使用的技术栈：
  - Vue3、TypeScript、Element Plus、AbortController API
- 修改的文件：
  - mall-admin/src/views/project/upload.vue
- 新增文件：
  - mall-admin/src/views/project/preview.vue
  - mall-admin/src/views/project/typhoon.vue
  - mall-admin/src/views/project/i18n.vue
- 新增文件：mall-admin/大文件上传.md
- 新增文件：mall-admin/cursor_log.md

---

## 会话总结

- 会话日期和时间：2025-10-20 22:40
- 主要目的：将 MySQL-OCP-Brush-Questions-CN 刷题系统集成到 mall-admin 项目中
- 完成的主要任务：
  1. 复制了 MySQL-OCP-Brush-Questions-CN 项目的所有文件到 mall-admin/public/mysql/ 目录
  2. 创建了 Vue 组件（mysql.vue）使用 iframe 嵌入原始 HTML 页面
  3. 在路由配置中添加了 /project/mysql 路由
  4. 在项目管理菜单下自动显示"MySQL OCP 刷题"入口
- 关键决策和解决方案：
  - 采用 iframe 嵌入方案，保持原项目代码完整性，无需修改
  - 将静态文件放置在 public 目录下，确保构建后可以正常访问
  - 将刷题系统作为项目管理模块的子功能集成
  - 使用 Vue Router 的动态导入，保持代码分割
- 使用的技术栈：
  - Vue 3、TypeScript、Vue Router、iframe
- 修改的文件：
  - 新增：mall-admin/src/views/project/mysql.vue
  - 修改：mall-admin/src/router/routes.ts
  - 新增：mall-admin/public/mysql/index.html
  - 新增：mall-admin/public/mysql/questions.json
  - 新增：mall-admin/public/mysql/questions/ (122个JSON文件)

---

## 会话总结 - 部署优化

- 会话日期和时间：2025-10-20 23:00
- 主要目的：修复生产环境部署时的构建失败问题
- 完成的主要任务：
  1. 删除了重复的 public/questions.json 文件（328KB）
  2. 优化了 vite.config.ts 的构建配置
  3. 在 Dockerfile 中增加了 Node.js 内存限制（4GB）
  4. 添加了手动分包配置，优化构建性能
- 关键决策和解决方案：
  - **问题**：部署时 Vite 构建过程中 SSH 连接断开（client_loop: send disconnect: Broken pipe）
  - **原因**：构建大型项目时内存不足，导致进程被杀死
  - **解决方案**：
    1. 删除重复文件，减少构建负担
    2. 设置 NODE_OPTIONS="--max-old-space-size=4096" 增加内存限制
    3. 优化 Rollup 配置，手动分包（element-plus、vue-vendor、editor）
    4. 关闭 build.watch 减少性能开销
    5. 添加 optimizeDeps 配置，优化依赖预构建
- 使用的技术栈：
  - Vite、Rollup、Docker、Node.js
- 修改的文件：
  - 修改：mall-admin/vite.config.ts
  - 修改：mall-admin/Dockerfile
  - 删除：mall-admin/public/questions.json