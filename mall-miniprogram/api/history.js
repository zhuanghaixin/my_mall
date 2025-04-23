const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取浏览历史列表
 * @param {Object} params - 查询参数：pageNum 页码，pageSize 每页数量
 * @returns {Promise}
 */
function getBrowseHistoryList(params) {
    return request.get(api.HistoryList, params);
}

/**
 * 删除单条浏览历史
 * @param {Number} id - 浏览记录ID
 * @returns {Promise}
 */
function deleteHistory(id) {
    return request.del(api.HistoryDelete.replace(':id', id));
}

/**
 * 清空浏览历史
 * @returns {Promise}
 */
function clearBrowseHistory() {
    return request.del(api.HistoryClear);
}

/**
 * 添加商品到购物车
 * @param {Number} productId - 商品ID
 * @param {Number} quantity - 数量
 * @returns {Promise}
 */
function addToCart(productId, quantity) {
    return request.post(api.CartAdd, {
        goodsId: productId,
        number: quantity
    });
}

module.exports = {
    getBrowseHistoryList,
    deleteHistory,
    clearBrowseHistory,
    addToCart
}; 