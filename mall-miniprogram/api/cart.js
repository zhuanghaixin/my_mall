/**
 * 购物车相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 获取购物车列表
 */
function getCartList() {
    return request.get(api.CartList);
}

/**
 * 添加购物车
 * @param {Object} data - 商品信息
 */
function addCart(data) {
    return request.post(api.CartAdd, data);
}

/**
 * 更新购物车
 * @param {Object} data - 更新的购物车信息
 */
function updateCart(data) {
    return request.put(api.CartUpdate, data);
}

/**
 * 删除购物车商品
 * @param {Object} data - 删除的商品信息
 */
function deleteCart(data) {
    return request.del(api.CartDelete, data);
}

/**
 * 清空购物车
 */
function clearCart() {
    return request.del(api.CartClear);
}

/**
 * 选择/取消选择购物车商品
 * @param {Object} data - 商品信息
 */
function checkCart(data) {
    return request.put(api.CartCheck, data);
}

module.exports = {
    getCartList,
    addCart,
    updateCart,
    deleteCart,
    clearCart,
    checkCart
}; 