import request from './request';

// 订单状态：0待付款，1待发货，2待收货，3已完成，4已取消
export enum OrderStatus {
  PendingPayment = 0,
  PendingDelivery = 1,
  PendingReceipt = 2,
  Completed = 3,
  Cancelled = 4
}

// 订单商品接口
export interface OrderGoods {
  id: number;
  order_id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  price: number | string;
  quantity: number;
  goods?: {
    id: number;
    name: string;
    main_image: string;
    price: number | string;
  };
}

// 订单接口
export interface Order {
  id: number;
  order_no: string;
  user_id: number;
  total_amount: number | string;
  pay_amount: number | string;
  freight_amount: number | string;
  pay_type: number;
  status: OrderStatus;
  address_id: number;
  remark: string;
  delivery_company: string | null;
  delivery_number: string | null;
  pay_time: string | null;
  delivery_time: string | null;
  receive_time: string | null;
  create_time: string;
  update_time: string;
  user?: {
    id: number;
    nickname: string;
    phone: string;
    avatar: string;
  };
  orderGoods?: OrderGoods[];
}

// 订单列表查询参数
export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  order_no?: string;
  user_id?: number;
  start_time?: string;
  end_time?: string;
}

// 订单统计信息
export interface OrderStats {
  status_counts: {
    pending_payment: number;
    pending_delivery: number;
    pending_receipt: number;
    completed: number;
    cancelled: number;
  };
  today_order_count: number;
  today_sales: number;
  total_sales: number;
}

// 订单列表响应
export interface OrderListResponse {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取订单列表
 */
export function getOrderList(params?: OrderListParams) {
  return request({
    url: '/admin/order/list',
    method: 'get',
    params
  });
}

/**
 * 获取订单详情
 * @param id 订单ID
 */
export function getOrderDetail(id: number) {
  return request({
    url: `/admin/order/${id}`,
    method: 'get'
  });
}

/**
 * 获取订单统计信息
 */
export function getOrderStats() {
  return request({
    url: '/admin/order/stats',
    method: 'get'
  });
}

/**
 * 更新订单状态
 * @param id 订单ID
 * @param status 订单状态
 * @param deliveryInfo 发货信息（发货时需要）
 */
export function updateOrderStatus(
  id: number, 
  status: OrderStatus, 
  deliveryInfo?: { 
    delivery_company: string; 
    delivery_number: string; 
  }
) {
  return request({
    url: `/admin/order/${id}/status`,
    method: 'put',
    data: { 
      status,
      ...deliveryInfo
    }
  });
}

/**
 * 删除订单
 * @param id 订单ID
 */
export function deleteOrder(id: number) {
  return request({
    url: `/admin/order/${id}`,
    method: 'delete'
  });
} 