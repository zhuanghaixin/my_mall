// 购物车相关API接口
import request from './request';
import API from '../config/api';

/**
 * 获取购物车列表
 */
const getCartList = () => {
    return request.get(API.CART.LIST);
};

/**
 * 添加商品到购物车
 * @param {Object} data - 购物车数据
 */
const addToCart = (data) => {
    return request.post(API.CART.ADD, data);
};

/**
 * 更新购物车商品
 * @param {number} id - 购物车项ID
 * @param {Object} data - 更新数据
 */
const updateCartItem = (id, data) => {
    return request.put(API.CART.UPDATE, data, {
        urlParams: { id }
    });
};

/**
 * 删除购物车商品
 * @param {number} id - 购物车项ID
 */
const deleteCartItem = (id) => {
    return request.delete(API.CART.DELETE, null, {
        urlParams: { id }
    });
};

/**
 * 清空购物车
 */
const clearCart = () => {
    return request.delete(API.CART.CLEAR);
};

/**
 * 选择/取消选择商品
 * @param {number} id - 购物车项ID
 * @param {Object} data - 选择数据
 */
const selectCartItem = (id, data) => {
    return request.put(API.CART.SELECT, data, {
        urlParams: { id }
    });
};

/**
 * 全选/取消全选
 * @param {Object} data - 全选数据
 */
const selectAllCartItems = (data) => {
    return request.put(API.CART.SELECT_ALL, data);
};

export default {
    getCartList,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart,
    selectCartItem,
    selectAllCartItems
}; 