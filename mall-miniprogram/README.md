# 商城小程序

## 项目介绍

本项目是一个电商微信小程序前端项目，包含首页、分类、购物车、用户中心等功能。

## 技术栈

- 微信小程序原生开发
- Vant Weapp 组件库
- Promise 封装异步请求

## 项目结构

```
mall-miniprogram/
├── miniprogram/                 # 小程序源码
│   ├── api/                     # API接口
│   ├── assets/                  # 静态资源
│   │   ├── icons/               # 图标
│   │   ├── images/              # 图片
│   │   └── styles/              # 样式
│   ├── components/              # 自定义组件
│   ├── config/                  # 配置文件
│   ├── constants/               # 常量
│   ├── pages/                   # 页面
│   │   ├── index/               # 首页
│   │   ├── category/            # 分类页
│   │   ├── goods-list/          # 商品列表页
│   │   ├── goods-detail/        # 商品详情页
│   │   ├── cart/                # 购物车页
│   │   ├── order-confirm/       # 订单确认页
│   │   ├── payment/             # 支付页
│   │   ├── order-list/          # 订单列表页
│   │   ├── order-detail/        # 订单详情页
│   │   ├── user/                # 用户中心页
│   │   ├── login/               # 登录页
│   │   ├── address/             # 地址管理页
│   │   ├── address-edit/        # 地址编辑页
│   │   └── search/              # 搜索页
│   ├── utils/                   # 工具类
│   ├── app.js                   # 小程序入口JS
│   ├── app.json                 # 小程序配置
│   └── app.wxss                 # 小程序全局样式
├── package.json                 # 项目依赖
└── project.config.json          # 项目配置
```

## 安装依赖

```bash
npm install
```

## 开发说明

1. 在微信开发者工具中导入项目
2. 构建 npm
3. 开始开发

## 接口说明

接口前缀：`http://localhost:8080/`

详细接口说明请参考项目中的 `api/` 目录。 