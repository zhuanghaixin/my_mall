// 商品相关API接口
import request from './request';
import API from '../config/api';

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 */
const getGoodsList = (params) => {
    return request.get(API.GOODS.LIST, params);
};

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 */
const getGoodsDetail = (id) => {
    return request.get(API.GOODS.DETAIL, null, {
        urlParams: { id }
    });
};

/**
 * 获取推荐商品
 * @param {Object} params - 查询参数
 */
const getRecommendGoods = (params) => {
    return request.get(API.GOODS.RECOMMEND, params);
};

/**
 * 获取热销商品
 * @param {Object} params - 查询参数
 */
const getHotGoods = (params) => {
    return request.get(API.GOODS.HOT, params);
};

export default {
    getGoodsList,
    getGoodsDetail,
    getRecommendGoods,
    getHotGoods
}; 