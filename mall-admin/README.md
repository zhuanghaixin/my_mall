# 商城管理后台系统

基于 Vue 3 + TypeScript + Vite + Element Plus 的商城管理后台系统

## 技术栈

- Vue 3
- TypeScript
- Vue Router
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP请求)
- Vite (构建工具)
- SCSS (CSS预处理器)

## 开发环境准备

### 前置要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
mall-admin/
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── api/                # API请求
│   ├── assets/             # 项目资源
│   ├── components/         # 组件
│   ├── config/             # 配置
│   ├── constants/          # 常量
│   ├── hooks/              # 钩子函数
│   ├── layouts/            # 布局组件
│   ├── router/             # 路由
│   ├── stores/             # 状态管理
│   ├── utils/              # 工具函数
│   ├── views/              # 页面
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── .env                    # 环境变量
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── index.html              # HTML模板
├── tsconfig.json           # TypeScript配置
└── vite.config.ts          # Vite配置
```

## 功能模块

- 登录/登出
- 用户管理
- 商品管理
- 分类管理
- 订单管理
- 轮播图管理
- 数据统计

## 开发规范

- 使用ESLint进行代码规范检查
- 使用TypeScript类型约束
- 使用SCSS预处理器编写样式
- 组件化开发，提高代码复用性 