# 后端API服务项目目录结构

```
mall-api/                  # 项目根目录
├── src/                   # 源代码目录
│   ├── index.js           # 应用入口文件
│   ├── app.js             # Express应用配置
│   ├── config/            # 配置文件
│   │   ├── index.js       # 主配置文件
│   │   ├── database.js    # 数据库配置
│   │   └── jwt.js         # JWT认证配置
│   ├── controllers/       # 控制器文件
│   │   ├── user.js        # 用户相关控制器
│   │   ├── goods.js       # 商品相关控制器
│   │   ├── category.js    # 分类相关控制器
│   │   ├── order.js       # 订单相关控制器
│   │   ├── cart.js        # 购物车相关控制器
│   │   ├── address.js     # 地址相关控制器
│   │   ├── banner.js      # 轮播图相关控制器
│   │   ├── search.js      # 搜索相关控制器
│   │   ├── upload.js      # 上传相关控制器
│   │   ├── pay.js         # 支付相关控制器
│   │   ├── admin.js       # 管理员相关控制器
│   │   └── stats.js       # 统计相关控制器
│   ├── models/            # 数据模型
│   │   ├── user.js        # 用户模型
│   │   ├── goods.js       # 商品模型
│   │   ├── category.js    # 分类模型
│   │   ├── order.js       # 订单模型
│   │   ├── orderGoods.js  # 订单商品模型
│   │   ├── cart.js        # 购物车模型
│   │   ├── address.js     # 地址模型
│   │   ├── banner.js      # 轮播图模型
│   │   └── admin.js       # 管理员模型
│   ├── routes/            # 路由文件
│   │   ├── index.js       # 路由入口
│   │   ├── api/           # API路由
│   │   │   ├── user.js    # 用户路由
│   │   │   ├── goods.js   # 商品路由
│   │   │   ├── category.js # 分类路由
│   │   │   ├── order.js   # 订单路由
│   │   │   ├── cart.js    # 购物车路由
│   │   │   ├── address.js # 地址路由
│   │   │   ├── upload.js  # 上传路由
│   │   │   ├── search.js  # 搜索路由
│   │   │   ├── pay.js     # 支付路由
│   │   │   └── home.js    # 首页路由
│   │   └── admin/         # 管理后台路由
│   │       ├── user.js    # 用户管理路由
│   │       ├── goods.js   # 商品管理路由
│   │       ├── category.js # 分类管理路由
│   │       ├── order.js   # 订单管理路由
│   │       ├── banner.js  # 轮播图管理路由
│   │       ├── stats.js   # 统计相关路由
│   │       └── settings.js # 设置相关路由
│   ├── middlewares/       # 中间件
│   │   ├── auth.js        # 认证中间件
│   │   ├── errorHandler.js # 错误处理中间件
│   │   ├── validator.js   # 请求验证中间件
│   │   └── upload.js      # 文件上传中间件
│   ├── services/          # 业务服务层
│   │   ├── user.js        # 用户相关服务
│   │   ├── goods.js       # 商品相关服务
│   │   ├── category.js    # 分类相关服务
│   │   ├── order.js       # 订单相关服务
│   │   ├── cart.js        # 购物车相关服务
│   │   ├── address.js     # 地址相关服务
│   │   ├── banner.js      # 轮播图相关服务
│   │   ├── search.js      # 搜索相关服务
│   │   ├── stats.js       # 数据统计服务
│   │   └── pay.js         # 支付相关服务
│   ├── utils/             # 工具函数
│   │   ├── logger.js      # 日志工具
│   │   ├── jwt.js         # JWT工具
│   │   ├── response.js    # 响应格式工具
│   │   ├── validator.js   # 数据验证工具
│   │   └── helper.js      # 通用辅助函数
│   ├── constants/         # 常量定义
│   │   ├── index.js       # 常量入口
│   │   ├── error.js       # 错误码常量
│   │   └── status.js      # 状态常量
│   └── db/                # 数据库相关
│       ├── index.js       # 数据库连接
│       └── migrations/    # 数据库迁移文件
├── public/                # 静态资源目录
│   └── uploads/           # 上传文件目录
├── logs/                  # 日志目录
├── tests/                 # 测试目录
│   ├── unit/              # 单元测试
│   │   ├── controllers/   # 控制器测试
│   │   └── services/      # 服务测试
│   └── integration/       # 集成测试
├── .env                   # 环境变量
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── package.json           # 项目依赖
├── nodemon.json           # Nodemon配置
└── README.md              # 项目说明
```

## 目录说明

1. **src/**：源码主目录
   - **index.js**：应用入口文件
   - **app.js**：Express应用配置

2. **config/**：配置文件
   - 数据库、JWT等配置信息

3. **controllers/**：控制器层
   - 处理HTTP请求和响应
   - 调用服务层完成业务逻辑

4. **models/**：数据模型层
   - 定义数据库模型结构
   - 与数据库表对应

5. **routes/**：路由层
   - 定义API路由路径
   - 区分前端和管理后台API

6. **middlewares/**：中间件层
   - 认证、错误处理等中间件
   - 请求预处理和后处理

7. **services/**：服务层
   - 封装业务逻辑
   - 控制器调用服务层完成功能

8. **utils/**：工具函数
   - 提供各种工具方法

9. **constants/**：常量定义
   - 错误码、状态等常量

10. **db/**：数据库相关
    - 数据库连接和迁移

11. **public/**：静态资源
    - 存放上传的文件等

12. **logs/**：日志目录
    - 存放应用运行日志

13. **tests/**：测试目录
    - 单元测试和集成测试 