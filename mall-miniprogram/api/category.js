/**
 * 分类相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 获取分类列表
 */
function getCategoryList() {
    return request.get(api.CategoryList);
}

/**
 * 获取分类商品
 * @param {Object} params - 查询参数，包含分类ID
 */
function getCategoryGoods(params) {
    return request.get(api.CategoryGoods, params);
}

module.exports = {
    getCategoryList,
    getCategoryGoods
}; 