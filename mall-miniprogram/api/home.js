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

module.exports = {
    getHomeData,
    getBanner,
    getRecommend,
    getCategories
}; 