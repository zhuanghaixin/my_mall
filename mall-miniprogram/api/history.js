import request from '../utils/request.js';

/**
 * 获取浏览历史列表
 * @param {Object} params - 查询参数：pageNum 页码，pageSize 每页数量
 * @returns {Promise}
 */
export function getBrowseHistoryList(params) {
    return request({
        url: '/api/browse/history/list',
        method: 'GET',
        data: params
    });
}

/**
 * 删除单条浏览历史
 * @param {Number} id - 浏览记录ID
 * @returns {Promise}
 */
export function deleteBrowseHistory(id) {
    return request({
        url: `/api/browse/history/delete/${id}`,
        method: 'DELETE'
    });
}

/**
 * 清空浏览历史
 * @returns {Promise}
 */
export function clearBrowseHistory() {
    return request({
        url: '/api/browse/history/clear',
        method: 'DELETE'
    });
}

/**
 * 添加商品到购物车
 * @param {Number} productId - 商品ID
 * @param {Number} quantity - 数量
 * @returns {Promise}
 */
export function addToCart(productId, quantity) {
    return request({
        url: '/api/cart/add',
        method: 'POST',
        data: {
            productId,
            quantity
        }
    });
}

export default {
    getBrowseHistoryList,
    deleteBrowseHistory,
    clearBrowseHistory,
    addToCart
}; 