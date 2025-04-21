/**
 * 首页相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 获取轮播图
 */
function getBanner() {
    return request.get(api.Banner);
}

/**
 * 获取首页数据
 */
function getHomeData() {
    return request.get(api.HomeData);
}

/**
 * 获取推荐商品
 * @param {Object} params - 查询参数
 */
function getRecommend(params = {}) {
    return request.get(api.GoodsRecommend, params);
}

/**
 * 获取热门商品
 * @param {Object} params - 查询参数
 */
function getHotGoods(params = {}) {
    return request.get(api.GoodsHot, params);
}

module.exports = {
    getBanner,
    getHomeData,
    getRecommend,
    getHotGoods
}; 