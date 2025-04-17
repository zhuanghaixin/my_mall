# 商城小程序API接口文档

## 接口规范

### 请求规范

- **基础URL**：`https://api.example.com`
- **请求方法**：
  - GET：获取资源
  - POST：创建资源
  - PUT：更新资源
  - DELETE：删除资源
- **请求头**：
  - Content-Type: application/json
  - Authorization: Bearer {token} (需要认证的接口)

### 响应规范

所有接口统一返回JSON格式，结构如下：

```json
{
  "code": 200,             // 状态码：200成功，非200失败
  "message": "操作成功",    // 提示信息
  "data": {}               // 响应数据，可能是对象或数组
}
```

### 常见状态码

- 200: 成功
- 400: 请求参数错误
- 401: 未授权（未登录或token失效）
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 一、微信小程序接口

### 1. 用户相关接口

#### 1.1 微信登录

- **接口**：`POST /api/user/wxlogin`
- **描述**：通过微信code获取用户openid并登录
- **请求参数**：
  ```json
  {
    "code": "微信临时登录凭证code"
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "user": {
        "id": 1,
        "nickname": "用户昵称",
        "avatar": "头像URL",
        "phone": "手机号"
      }
    }
  }
  ```

#### 1.2 手机号绑定

- **接口**：`POST /api/user/bindphone`
- **描述**：绑定用户手机号
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```json
  {
    "phoneCode": "微信获取手机号凭证"
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "绑定成功",
    "data": {
      "phone": "手机号"
    }
  }
  ```

### 2. 商品相关接口

#### 2.1 获取商品列表

- **接口**：`GET /api/goods/list`
- **描述**：获取商品列表，支持分页和筛选
- **请求参数**：
  ```
  page: 页码，默认1
  pageSize: 每页数量，默认10
  categoryId: 分类ID，可选
  keyword: 搜索关键词，可选
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "list": [
        {
          "id": 1,
          "name": "商品名称",
          "price": 99.00,
          "images": ["图片URL"],
          "sales": 100
        }
      ],
      "total": 100,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

#### 2.2 获取商品详情

- **接口**：`GET /api/goods/:id`
- **描述**：获取指定商品的详细信息
- **请求参数**：无
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "id": 1,
      "name": "商品名称",
      "price": 99.00,
      "originalPrice": 199.00,
      "images": ["图片URL"],
      "detail": "商品详情，可能包含HTML",
      "specs": [
        {
          "name": "颜色",
          "values": ["红色", "蓝色"]
        }
      ],
      "sku": [
        {
          "id": 1,
          "specs": ["红色"],
          "price": 99.00,
          "stock": 100
        }
      ]
    }
  }
  ```

### 3. 购物车接口

#### 3.1 添加购物车

- **接口**：`POST /api/cart`
- **描述**：添加商品到购物车
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```json
  {
    "goodsId": 1,
    "skuId": 1,
    "quantity": 2
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": 1,
      "quantity": 2
    }
  }
  ```

#### 3.2 获取购物车列表

- **接口**：`GET /api/cart/list`
- **描述**：获取用户购物车商品列表
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：无
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "list": [
        {
          "id": 1,
          "goodsId": 1,
          "skuId": 1,
          "goods": {
            "name": "商品名称",
            "image": "图片URL"
          },
          "sku": {
            "specs": ["红色"],
            "price": 99.00
          },
          "quantity": 2,
          "selected": true
        }
      ],
      "totalPrice": 198.00,
      "totalQuantity": 2
    }
  }
  ```

### 4. 订单相关接口

#### 4.1 创建订单

- **接口**：`POST /api/order`
- **描述**：创建新订单
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```json
  {
    "addressId": 1,
    "items": [
      {
        "cartId": 1
      }
    ],
    "remark": "订单备注"
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "创建成功",
    "data": {
      "orderId": "202306010001",
      "amount": 198.00
    }
  }
  ```

#### 4.2 获取订单详情

- **接口**：`GET /api/order/:id`
- **描述**：获取指定订单的详细信息
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：无
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "id": "202306010001",
      "status": "待付款",
      "createTime": "2023-06-01 12:34:56",
      "payTime": null,
      "amount": 198.00,
      "address": {
        "name": "张三",
        "phone": "13800138000",
        "address": "广东省广州市天河区体育西路123号"
      },
      "items": [
        {
          "id": 1,
          "goodsId": 1,
          "goodsName": "商品名称",
          "goodsImage": "图片URL",
          "specs": ["红色"],
          "price": 99.00,
          "quantity": 2
        }
      ]
    }
  }
  ```

### 5. 支付接口

#### 5.1 获取支付参数

- **接口**：`POST /api/pay/wxpay`
- **描述**：获取微信支付所需参数
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```json
  {
    "orderId": "202306010001"
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "timeStamp": "1622515200",
      "nonceStr": "随机字符串",
      "package": "prepay_id=wx061234567890",
      "signType": "MD5",
      "paySign": "签名"
    }
  }
  ```

## 二、管理后台接口

### 1. 管理员认证接口

#### 1.1 管理员登录

- **接口**：`POST /api/admin/login`
- **描述**：管理员账号密码登录
- **请求参数**：
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "admin": {
        "id": 1,
        "username": "admin",
        "name": "管理员"
      }
    }
  }
  ```

### 2. 商品管理接口

#### 2.1 获取商品列表

- **接口**：`GET /api/admin/goods/list`
- **描述**：获取商品列表，支持搜索和分页
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```
  page: 页码，默认1
  pageSize: 每页数量，默认10
  name: 商品名称，可选
  categoryId: 分类ID，可选
  status: 商品状态，可选
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "list": [
        {
          "id": 1,
          "name": "商品名称",
          "image": "图片URL",
          "price": 99.00,
          "categoryName": "分类名称",
          "status": "上架",
          "createTime": "2023-06-01 12:34:56"
        }
      ],
      "total": 100,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

#### 2.2 添加商品

- **接口**：`POST /api/admin/goods`
- **描述**：添加新商品
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```json
  {
    "name": "商品名称",
    "categoryId": 1,
    "price": 99.00,
    "stock": 100,
    "status": "上架",
    "images": ["图片URL"],
    "detail": "商品详情",
    "specs": [
      {
        "name": "颜色",
        "values": ["红色", "蓝色"]
      }
    ],
    "sku": [
      {
        "specs": ["红色"],
        "price": 99.00,
        "stock": 50
      },
      {
        "specs": ["蓝色"],
        "price": 99.00,
        "stock": 50
      }
    ]
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "添加成功",
    "data": {
      "id": 1
    }
  }
  ```

### 3. 订单管理接口

#### 3.1 获取订单列表

- **接口**：`GET /api/admin/order/list`
- **描述**：获取订单列表，支持搜索和分页
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```
  page: 页码，默认1
  pageSize: 每页数量，默认10
  orderId: 订单号，可选
  status: 订单状态，可选
  startTime: 开始时间，可选
  endTime: 结束时间，可选
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "list": [
        {
          "id": "202306010001",
          "user": "张三",
          "amount": 198.00,
          "status": "待发货",
          "createTime": "2023-06-01 12:34:56"
        }
      ],
      "total": 85,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

#### 3.2 订单发货

- **接口**：`PUT /api/admin/order/:id/status`
- **描述**：更新订单状态为已发货
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```json
  {
    "status": "已发货",
    "expressCompany": "快递公司",
    "expressNumber": "快递单号"
  }
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "发货成功",
    "data": null
  }
  ```

### 4. 数据统计接口

#### 4.1 获取销售统计

- **接口**：`GET /api/admin/stats/sales`
- **描述**：获取销售额统计数据
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```
  type: 统计类型，day/week/month/year
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "today": 9860,
      "week": 68500,
      "month": 296580,
      "total": 985000,
      "chart": [
        {
          "date": "2023-06-01",
          "amount": 9860
        }
      ]
    }
  }
  ```

#### 4.2 获取商品销量排行

- **接口**：`GET /api/admin/stats/goods/rank`
- **描述**：获取商品销量排行
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```
  limit: 返回数量，默认10
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": [
      {
        "id": 1,
        "name": "商品名称",
        "image": "图片URL",
        "sales": 200,
        "amount": 19800
      }
    ]
  }
  ```

## 三、文件上传接口

### 3.1 上传图片

- **接口**：`POST /api/upload/image`
- **描述**：上传图片文件
- **请求头**：`Authorization: Bearer {token}`
- **请求参数**：
  ```
  file: 图片文件（multipart/form-data）
  ```
- **响应参数**：
  ```json
  {
    "code": 200,
    "message": "上传成功",
    "data": {
      "url": "图片URL"
    }
  }
  ```

## 四、错误处理

当接口出现错误时，会返回对应的错误码和错误信息，例如：

```json
{
  "code": 400,
  "message": "参数错误：商品ID不能为空",
  "data": null
}
```

```json
{
  "code": 401,
  "message": "未登录或登录已过期",
  "data": null
}
```

```json
{
  "code": 500,
  "message": "服务器内部错误",
  "data": null
}
``` 