/**
 * 支付相关API服务
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取微信支付参数
 * @param {Object} data - 支付参数，包含order_no
 * @returns {Promise} 获取微信支付参数的Promise
 */
function getWxPayParams(data) {
    return request.post(api.PayWxpay, data);
}

/**
 * 模拟支付
 * @param {Object} data - 支付参数，包含order_no和status
 * @returns {Promise} 模拟支付的Promise
 */
function mockPay(data) {
    return request.post(api.PayMock, data);
}

/**
 * 查询支付状态
 * @param {number} orderId - 订单ID
 * @returns {Promise} 查询支付状态的Promise
 */
function getPayStatus(orderId) {
    return request.get(`${api.PayStatus}/${orderId}`);
}

module.exports = {
    getWxPayParams,
    mockPay,
    getPayStatus
}; 