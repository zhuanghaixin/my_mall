/**
 * 商品相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 */
function getGoodsList(params) {
    return request.get(api.GoodsList, params);
}

/**
 * 获取商品详情
 * @param {Number} id - 商品ID
 */
function getGoodsDetail(id) {
    return request.get(api.GoodsDetail, { id });
}

/**
 * 获取热门商品
 * @param {Object} params - 查询参数
 */
function getHotGoods(params) {
    return request.get(api.GoodsHot, params);
}

/**
 * 获取推荐商品
 * @param {Object} params - 查询参数
 */
function getRecommendGoods(params) {
    return request.get(api.GoodsRecommend, params);
}

module.exports = {
    getGoodsList,
    getGoodsDetail,
    getHotGoods,
    getRecommendGoods
}; 