/**
 * 首页相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 获取首页数据（包含轮播图、推荐商品、分类商品）
 */
function getHomeData() {
    return request.get(api.HomeData);
}

/**
 * 获取轮播图
 */
function getBanner() {
    return request.get(api.Banner);
}

/**
 * 获取推荐商品
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 返回数量限制
 */
function getRecommend(params = {}) {
    return request.get(api.GoodsRecommend, params);
}

/**
 * 获取首页分类及商品
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 返回分类数量限制
 * @param {number} params.goodsLimit - 每个分类下返回的商品数量限制
 */
function getCategories(params = {}) {
    return request.get(api.HomeCategories, params);
}

/**
 * 获取分类下的商品列表
 * @param {number} categoryId - 分类ID
 * @param {number} page - 页码，默认为1
 * @param {number} pageSize - 每页数量，默认为10
 * @returns {Promise} 请求Promise
 */
function getCategoryGoods(categoryId, page = 1, pageSize = 10) {
    const url = api.CategoryGoods.replace(':id', categoryId);
    return request.get(url, { page, pageSize });
}

module.exports = {
    getHomeData,
    getBanner,
    getRecommend,
    getCategories,
    getCategoryGoods
}; 