// favorite.js
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取收藏列表
 * @param {Object} params 查询参数 {page, limit}
 */
function getFavoriteList(params) {
    return request.get(api.FavoriteList, params);
}

/**
 * 添加收藏
 * @param {Number} goodsId 商品ID
 */
function addFavorite(goodsId) {
    return request.post(api.FavoriteAdd, {
        goods_id: goodsId
    });
}

/**
 * 取消收藏
 * @param {Number} id 收藏ID
 */
function removeFavorite(id) {
    return request.del(api.FavoriteDelete.replace(':id', id));
}

/**
 * 检查商品是否已收藏
 * @param {Number} goodsId 商品ID
 */
function checkIsFavorite(goodsId) {
    return request.get(api.FavoriteCheck, {
        goods_id: goodsId
    });
}

module.exports = {
    getFavoriteList,
    addFavorite,
    removeFavorite,
    checkIsFavorite
};
