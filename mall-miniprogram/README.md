# 商城小程序

## 项目介绍
这是一个微信小程序商城项目，基于原生小程序框架开发，使用了Vant Weapp组件库。

## 功能模块
- 首页：轮播图、推荐商品、分类商品
- 分类：商品分类展示
- 购物车：商品加入购物车，结算等
- 我的：个人中心，订单管理等

## 技术栈
- 微信小程序原生框架
- Vant Weapp组件库
- Promise封装的网络请求

## 开发环境准备
1. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 克隆项目到本地
3. 使用微信开发者工具打开项目目录

## 安装依赖
```bash
# 进入项目目录
cd mall-miniprogram

# 安装依赖
npm install

# 构建npm
## 在微信开发者工具中点击 "工具" -> "构建npm"
```

## 项目结构
```
mall-miniprogram/            # 项目根目录
├── app.js                   # 小程序入口文件
├── app.json                 # 小程序全局配置
├── app.wxss                 # 小程序全局样式
├── project.config.json      # 项目配置文件
├── sitemap.json             # 站点地图配置
├── api/                     # API接口模块
├── components/              # 自定义组件
├── pages/                   # 小程序页面
├── utils/                   # 工具函数
├── config/                  # 配置文件
├── assets/                  # 静态资源
│   ├── images/              # 图片资源
│   └── icons/               # 图标资源
├── styles/                  # 全局样式
├── package.json             # 项目依赖配置
└── README.md                # 项目说明文档
```

## 开发指南
1. 页面开发
   - 在pages目录下创建对应的页面目录
   - 每个页面包含.js、.wxml、.wxss、.json四个文件
   - 在app.json中注册新页面路径

2. API请求
   - 使用api目录下的模块进行API调用
   - 所有API路径配置在config/api.js中
   - 网络请求封装在api/request.js中

3. 组件使用
   - Vant组件使用方法参考[Vant Weapp官方文档](https://youzan.github.io/vant-weapp)
   - 自定义组件放在components目录下

## 后端API
后端API服务地址：http://localhost:8080/api

## 注意事项
1. 开发前请确保安装了最新版本的微信开发者工具
2. 使用真机预览测试功能
3. 小程序上线前需要完成微信认证

## 常见问题
1. npm构建失败
   - 检查package.json中的依赖是否正确
   - 删除node_modules目录后重新安装依赖

2. 组件找不到
   - 检查是否正确安装并构建npm
   - 检查页面的json文件中是否正确引入了组件 