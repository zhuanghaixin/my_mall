/**
 * 分类相关API请求
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取分类树结构
 */
function getCategoryTree() {
    return request.get(api.CategoryList);
}

/**
 * 获取分类下的商品列表
 * @param {Number} categoryId - 分类ID
 * @param {Object} params - 查询参数，分页参数等
 */
function getCategoryGoods(categoryId, params = {}) {
    let url = api.CategoryGoods.replace(':id', categoryId);
    return request.get(url, params);
}

module.exports = {
    getCategoryTree,
    getCategoryGoods
}; 