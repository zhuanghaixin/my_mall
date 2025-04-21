// 分类相关API接口
import request from './request';
import API from '../config/api';

/**
 * 获取分类列表
 */
const getCategoryList = () => {
    return request.get(API.CATEGORY.LIST);
};

/**
 * 获取分类详情
 * @param {number} id - 分类ID
 */
const getCategoryDetail = (id) => {
    return request.get(API.CATEGORY.DETAIL, null, {
        urlParams: { id }
    });
};

/**
 * 获取分类商品
 * @param {number} id - 分类ID
 * @param {Object} params - 查询参数
 */
const getCategoryGoods = (id, params) => {
    return request.get(API.CATEGORY.GOODS, params, {
        urlParams: { id }
    });
};

export default {
    getCategoryList,
    getCategoryDetail,
    getCategoryGoods
}; 