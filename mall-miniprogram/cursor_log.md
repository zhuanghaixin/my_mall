# 商城小程序开发日志

## 2023-07-31 创建商城小程序前端项目

### 会话的主要目的
根据项目需求和架构设计文档，创建微信小程序商城前端项目的基本文件结构。

### 完成的主要任务
1. 创建微信小程序项目的基础目录结构
2. 实现小程序全局配置文件（app.js、app.json、app.wxss）
3. 搭建API请求封装模块
4. 创建首页页面并实现布局
5. 添加底部导航图标

### 关键决策和解决方案
1. 使用Vant Weapp作为UI组件库
2. 采用Promise封装微信请求API
3. 实现首页布局包括搜索栏、轮播图、推荐商品和分类商品
4. 根据首页.md文档实现界面设计

### 使用的技术栈
- 微信小程序原生开发框架
- Vant Weapp UI组件库
- Promise异步请求处理
- SVG图标

### 修改了哪些文件
1. 创建小程序基础配置文件
   - mall-miniprogram/miniprogram/app.js
   - mall-miniprogram/miniprogram/app.json
   - mall-miniprogram/miniprogram/app.wxss
   - mall-miniprogram/miniprogram/project.config.json
   - mall-miniprogram/miniprogram/sitemap.json

2. 创建API相关文件
   - mall-miniprogram/miniprogram/config/api.js
   - mall-miniprogram/miniprogram/api/request.js
   - mall-miniprogram/miniprogram/api/user.js
   - mall-miniprogram/miniprogram/api/home.js
   - mall-miniprogram/miniprogram/api/goods.js
   - mall-miniprogram/miniprogram/api/category.js
   - mall-miniprogram/miniprogram/api/cart.js
   - mall-miniprogram/miniprogram/api/index.js

3. 创建首页页面文件
   - mall-miniprogram/miniprogram/pages/index/index.js
   - mall-miniprogram/miniprogram/pages/index/index.wxml
   - mall-miniprogram/miniprogram/pages/index/index.wxss
   - mall-miniprogram/miniprogram/pages/index/index.json

4. 创建工具函数和图标文件
   - mall-miniprogram/miniprogram/utils/util.js
   - mall-miniprogram/miniprogram/assets/icons/*.svg

5. 项目配置和说明文件
   - mall-miniprogram/package.json
   - mall-miniprogram/README.md 