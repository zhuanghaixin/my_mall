/**
 * 订单相关API请求
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.status - 订单状态
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise} 返回获取结果
 */
function getOrderList(params) {
    return request.get(api.OrderList, params);
}

/**
 * 获取订单详情
 * @param {number} orderId - 订单ID
 * @returns {Promise} 返回获取结果
 */
function getOrderDetail(orderId) {
    return request.get(`${api.OrderDetail}/${orderId}`);
}

/**
 * 创建订单
 * @param {Object} data - 订单信息
 * @returns {Promise} 返回创建结果
 */
function createOrder(data) {
    return request.post(api.OrderCreate, data);
}

/**
 * 取消订单
 * @param {number} orderId - 订单ID
 * @returns {Promise} 返回取消结果
 */
function cancelOrder(orderId) {
    return request.put(`${api.OrderCancel}/${orderId}/cancel`);
}

/**
 * 确认收货
 * @param {number} orderId - 订单ID
 * @returns {Promise} 返回确认结果
 */
function confirmOrder(orderId) {
    return request.put(`${api.OrderConfirm}/${orderId}/confirm`);
}

/**
 * 删除订单
 * @param {number} orderId - 订单ID
 * @returns {Promise} 返回删除结果
 */
function deleteOrder(orderId) {
    return request.delete(`${api.OrderDelete}/${orderId}`);
}

/**
 * 获取订单数量统计
 * @returns {Promise} 返回统计结果，包含各状态的订单数量
 */
function getOrderCounts() {
    return request.get(api.OrderCounts);
}

module.exports = {
    getOrderList,
    getOrderDetail,
    createOrder,
    cancelOrder,
    confirmOrder,
    deleteOrder,
    getOrderCounts
}; 