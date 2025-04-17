// 商品状态
export const GOODS_STATUS = {
  OFF_SHELF: 0,  // 下架
  ON_SHELF: 1    // 上架
}

// 用户状态
export const USER_STATUS = {
  DISABLED: 0,  // 禁用
  NORMAL: 1     // 正常
}

// 订单状态
export const ORDER_STATUS = {
  UNPAID: 0,     // 待付款
  UNSHIPPED: 1,  // 待发货
  SHIPPED: 2,    // 待收货
  COMPLETED: 3,  // 已完成
  CANCELLED: 4   // 已取消
}

// 支付方式
export const PAY_TYPE = {
  WECHAT: 1  // 微信支付
} 