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
 * 添加商品到购物车
 * @param {Object} data - 添加的商品信息
 */
function addToCart(data) {
    return request.post(api.CartAdd, data);
}

/**
 * 更新购物车商品数量
 * @param {Object} data - 更新的商品信息
 */
function updateCart(data) {
    return request.post(api.CartUpdate, data);
}

/**
 * 删除购物车商品
 * @param {Object} data - 商品ID信息
 */
function deleteCart(data) {
    return request.post(api.CartDelete, data);
}

/**
 * 清空购物车
 */
function clearCart() {
    return request.post(api.CartClear);
}

/**
 * 选择/取消选择购物车商品
 * @param {Object} data - 商品选择信息
 */
function checkCart(data) {
    return request.post(api.CartCheck, data);
}

module.exports = {
    getCartList,
    addToCart,
    updateCart,
    deleteCart,
    clearCart,
    checkCart
}; 