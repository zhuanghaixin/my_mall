# 商城小程序API接口文档

## 目录

- [通用说明](#通用说明)
  - [接口规范](#接口规范)
  - [认证方式](#认证方式)
  - [响应格式](#响应格式)
  - [状态码说明](#状态码说明)
  - [分页参数](#分页参数)
- [数据模型](#数据模型)
- [API接口](#api接口)
  - [A. 小程序端API](#a-小程序端api)
  - [B. 管理端API](#b-管理端api)
  - [C. 公共API](#c-公共api)

## 通用说明

### 接口规范

- 所有API请求采用RESTful风格设计
- Base URL: `http://api.example.com`（生产环境地址）
- 开发环境: `http://dev-api.example.com`
- 测试环境: `http://test-api.example.com`

### 认证方式

- 小程序端：微信登录后获取token，后续请求通过token认证
- 管理后台：用户名密码登录后获取token，后续请求通过token认证
- token有效期为7天，过期需重新登录获取
- token在请求头中通过Authorization字段传递：`Authorization: Bearer {token}`

### 响应格式

所有API响应统一采用JSON格式，结构如下：

```json
{
  "code": 200,      // 状态码：200成功，非200失败
  "message": "操作成功", // 提示信息
  "data": {}        // 响应数据，可能是对象或数组
}
```

### 状态码说明

- 200: 成功
- 400: 请求参数错误
- 401: 未授权（未登录或token失效）
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

### 分页参数

支持分页的接口，请求参数统一包含：

- `page`: 当前页码，默认1
- `pageSize`: 每页条数，默认10

响应数据结构：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [],     // 数据列表
    "total": 100,   // 总条数
    "page": 1,      // 当前页码
    "pageSize": 10, // 每页条数
    "totalPages": 10 // 总页数
  }
}
```

## 数据模型

### 用户(users)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 用户ID，主键 |
| openid | string | 微信openid |
| nickname | string | 用户昵称 |
| avatar | string | 用户头像URL |
| phone | string | 手机号 |
| gender | int | 性别：0未知，1男，2女 |
| status | int | 状态：0禁用，1正常 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 商品(goods)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 商品ID，主键 |
| category_id | int | 分类ID |
| name | string | 商品名称 |
| price | decimal | 商品价格 |
| original_price | decimal | 原价 |
| stock | int | 库存 |
| sales | int | 销量 |
| main_image | string | 主图URL |
| images | text | 商品图片，多个图片用逗号分隔 |
| description | text | 商品描述 |
| detail | text | 商品详情 |
| status | int | 状态：0下架，1上架 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 商品分类(categories)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 分类ID，主键 |
| parent_id | int | 父分类ID，0表示一级分类 |
| name | string | 分类名称 |
| icon | string | 分类图标URL |
| sort | int | 排序值，值越小越靠前 |
| status | int | 状态：0禁用，1正常 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 订单(orders)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 订单ID，主键 |
| order_no | string | 订单编号，唯一 |
| user_id | int | 用户ID |
| total_amount | decimal | 订单总金额 |
| pay_amount | decimal | 实付金额 |
| freight_amount | decimal | 运费 |
| pay_type | int | 支付方式：1微信支付 |
| status | int | 订单状态：0待付款，1待发货，2待收货，3已完成，4已取消 |
| address_id | int | 收货地址ID |
| remark | string | 订单备注 |
| pay_time | datetime | 支付时间 |
| delivery_time | datetime | 发货时间 |
| receive_time | datetime | 收货时间 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 订单商品(order_goods)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 订单商品ID，主键 |
| order_id | int | 订单ID |
| goods_id | int | 商品ID |
| goods_name | string | 商品名称 |
| goods_image | string | 商品图片URL |
| price | decimal | 商品价格 |
| quantity | int | 购买数量 |
| create_time | datetime | 创建时间 |

### 收货地址(addresses)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 地址ID，主键 |
| user_id | int | 用户ID |
| name | string | 收货人姓名 |
| phone | string | 手机号 |
| province | string | 省份 |
| city | string | 城市 |
| district | string | 区县 |
| detail | string | 详细地址 |
| is_default | int | 是否默认：0否，1是 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 购物车(carts)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 购物车ID，主键 |
| user_id | int | 用户ID |
| goods_id | int | 商品ID |
| quantity | int | 商品数量 |
| selected | int | 是否选中：0否，1是 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 轮播图(banners)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 轮播图ID，主键 |
| image | string | 图片地址URL |
| url | string | 跳转链接 |
| sort | int | 排序值，值越小越靠前 |
| status | int | 状态：0禁用，1启用 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### 管理员(admins)

| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| id | int | 管理员ID，主键 |
| username | string | 用户名 |
| password | string | 密码（MD5加密存储） |
| nickname | string | 昵称 |
| avatar | string | 头像URL |
| status | int | 状态：0禁用，1正常 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

## API接口

### A. 小程序端API

#### A1. 用户模块

##### 微信登录

- **接口说明**：通过微信code获取用户openid并登录
- **请求方法**：POST
- **请求路径**：`/api/user/wxlogin`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| code | string | 是 | 微信登录code |

- **响应示例**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "nickname": "用户昵称",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "13800138000"
    }
  }
}
```

##### 手机号绑定

- **接口说明**：绑定用户手机号
- **请求方法**：POST
- **请求路径**：`/api/user/bindphone`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| encryptedData | string | 是 | 包括敏感数据在内的完整用户信息的加密数据 |
| iv | string | 是 | 加密算法的初始向量 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "绑定成功",
  "data": {
    "phone": "13800138000"
  }
}
```

##### 获取用户信息

- **接口说明**：获取当前登录用户信息
- **请求方法**：GET
- **请求路径**：`/api/user/info`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "nickname": "用户昵称",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "gender": 1
  }
}
```

##### 更新用户信息

- **接口说明**：更新用户基本信息
- **请求方法**：PUT
- **请求路径**：`/api/user/info`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| nickname | string | 否 | 用户昵称 |
| avatar | string | 否 | 用户头像URL |
| gender | int | 否 | 性别：0未知，1男，2女 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

#### A2. 收货地址

##### 获取地址列表

- **接口说明**：获取用户的收货地址列表
- **请求方法**：GET
- **请求路径**：`/api/address/list`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园1号楼",
      "is_default": 1
    }
  ]
}
```

##### 添加收货地址

- **接口说明**：添加新的收货地址
- **请求方法**：POST
- **请求路径**：`/api/address/add`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| name | string | 是 | 收货人姓名 |
| phone | string | 是 | 手机号 |
| province | string | 是 | 省份 |
| city | string | 是 | 城市 |
| district | string | 是 | 区县 |
| detail | string | 是 | 详细地址 |
| is_default | int | 否 | 是否默认：0否，1是 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 1
  }
}
```

##### 更新收货地址

- **接口说明**：更新指定的收货地址
- **请求方法**：PUT
- **请求路径**：`/api/address/update/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 地址ID（路径参数） |
| name | string | 否 | 收货人姓名 |
| phone | string | 否 | 手机号 |
| province | string | 否 | 省份 |
| city | string | 否 | 城市 |
| district | string | 否 | 区县 |
| detail | string | 否 | 详细地址 |
| is_default | int | 否 | 是否默认：0否，1是 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

##### 删除收货地址

- **接口说明**：删除指定的收货地址
- **请求方法**：DELETE
- **请求路径**：`/api/address/delete/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 地址ID（路径参数） |

- **响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

##### 设置默认地址

- **接口说明**：设置指定地址为默认地址
- **请求方法**：PUT
- **请求路径**：`/api/address/default/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 地址ID（路径参数） |

- **响应示例**：

```json
{
  "code": 200,
  "message": "设置成功",
  "data": null
}
```

##### 获取默认地址

- **接口说明**：获取用户的默认收货地址
- **请求方法**：GET
- **请求路径**：`/api/address/default`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园1号楼",
    "is_default": 1
  }
}
```

##### 获取地址详情

- **接口说明**：获取指定地址的详细信息
- **请求方法**：GET
- **请求路径**：`/api/address/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 地址ID（路径参数） |

- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园1号楼",
    "is_default": 1
  }
}
```

#### A3. 购物车

##### 获取购物车列表

- **接口说明**：获取用户购物车商品列表
- **请求方法**：GET
- **请求路径**：`/api/cart/list`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "goods_id": 101,
        "name": "商品名称",
        "image": "https://example.com/goods.jpg",
        "price": 99.00,
        "quantity": 2,
        "selected": 1,
        "stock": 100
      }
    ],
    "total_price": 198.00
  }
}
```

##### 添加购物车

- **接口说明**：添加商品到购物车
- **请求方法**：POST
- **请求路径**：`/api/cart`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| goods_id | int | 是 | 商品ID |
| quantity | int | 是 | 商品数量 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 1
  }
}
```

##### 更新购物车商品

- **接口说明**：更新购物车中商品的数量
- **请求方法**：PUT
- **请求路径**：`/api/cart/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 购物车ID（路径参数） |
| quantity | int | 是 | 商品数量 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

##### 删除购物车商品

- **接口说明**：从购物车中删除指定商品
- **请求方法**：DELETE
- **请求路径**：`/api/cart/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 购物车ID（路径参数） |

- **响应示例**：

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

##### 清空购物车

- **接口说明**：清空用户购物车
- **请求方法**：DELETE
- **请求路径**：`/api/cart/clear`
- **请求参数**：无
- **响应示例**：

```json
{
  "code": 200,
  "message": "清空成功",
  "data": null
}
```

##### 选择/取消选择商品

- **接口说明**：选择或取消选择购物车中的商品
- **请求方法**：PUT
- **请求路径**：`/api/cart/:id/select`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 购物车ID（路径参数） |
| selected | int | 是 | 是否选中：0否，1是 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

##### 全选/取消全选

- **接口说明**：全选或取消全选购物车中的商品
- **请求方法**：PUT
- **请求路径**：`/api/cart/selectall`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| selected | int | 是 | 是否全选：0否，1是 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": null
}
```

#### A4. 订单与支付

##### 创建订单

- **接口说明**：创建新订单
- **请求方法**：POST
- **请求路径**：`/api/order`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| address_id | int | 是 | 收货地址ID |
| remark | string | 否 | 订单备注 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "order_id": 1,
    "order_no": "2023052012345678"
  }
}
```

##### 获取订单列表

- **接口说明**：获取用户订单列表，支持状态筛选
- **请求方法**：GET
- **请求路径**：`/api/order/list`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| status | int | 否 | 订单状态：0待付款，1待发货，2待收货，3已完成，4已取消 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "order_no": "2023052012345678",
        "total_amount": 99.00,
        "status": 0,
        "create_time": "2023-05-20 12:34:56",
        "goods_list": [
          {
            "goods_id": 101,
            "goods_name": "商品名称",
            "goods_image": "https://example.com/goods.jpg",
            "price": 99.00,
            "quantity": 1
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

##### 获取订单详情

- **接口说明**：获取指定订单的详细信息
- **请求方法**：GET
- **请求路径**：`/api/order/:id`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| id | int | 是 | 订单ID（路径参数） |

- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "order_no": "2023052012345678",
    "total_amount": 99.00,
    "pay_amount": 99.00,
    "freight_amount": 0.00,
    "status": 0,
    "create_time": "2023-05-20 12:34:56",
    "address": {
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "detail": "科技园1号楼"
    },
    "goods_list": [
      {
        "goods_id": 101,
        "goods_name": "商品名称",
        "goods_image": "https://example.com/goods.jpg",
        "price": 99.00,
        "quantity": 1
      }
    ]
  }
}
```

### B. 管理端API

#### B1. 管理员账户

##### 管理员登录

- **接口说明**：管理员账号密码登录
- **请求方法**：POST
- **请求路径**：`/api/admin/login`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
      "id": 1,
      "username": "admin",
      "nickname": "超级管理员",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

#### B2. 商品管理

##### 获取商品列表

- **接口说明**：获取商品列表，支持搜索和分页
- **请求方法**：GET
- **请求路径**：`/api/admin/goods/list`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| keyword | string | 否 | 搜索关键词，商品名称 |
| category_id | int | 否 | 分类ID |
| status | int | 否 | 商品状态：0下架，1上架 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "商品名称",
        "main_image": "https://example.com/goods.jpg",
        "price": 99.00,
        "original_price": 199.00,
        "stock": 100,
        "sales": 50,
        "status": 1,
        "category_name": "分类名称",
        "create_time": "2023-05-20 12:34:56"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### C. 公共API

#### C1. 商品与分类查询

##### 获取商品列表

- **接口说明**：获取商品列表，支持分页和筛选
- **请求方法**：GET
- **请求路径**：`/api/goods/list`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| keyword | string | 否 | 搜索关键词 |
| category_id | int | 否 | 分类ID |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "商品名称",
        "main_image": "https://example.com/goods.jpg",
        "price": 99.00,
        "original_price": 199.00,
        "sales": 50
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

#### C2. 文件上传

##### 上传图片

- **接口说明**：上传图片文件
- **请求方法**：POST
- **请求路径**：`/api/upload/image`
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| file | file | 是 | 要上传的图片文件 |

- **响应示例**：

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/image.jpg"
  }
}
```
