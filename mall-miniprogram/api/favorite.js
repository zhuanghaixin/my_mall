// favorite.js
const request = require('./request.js');

/**
 * 获取收藏列表
 * @param {Object} params 查询参数 {page, limit}
 */
function getFavoriteList(params) {
    return request.get('/api/favorites/list', params);
}

/**
 * 添加收藏
 * @param {Number} goodsId 商品ID
 */
function addFavorite(goodsId) {
    return request.post('/api/favorites/add', {
        goods_id: goodsId
    });
}

/**
 * 取消收藏
 * @param {Number} id 收藏ID
 */
function removeFavorite(id) {
    return request.delete(`/api/favorites/delete/${id}`);
}

/**
 * 检查商品是否已收藏
 * @param {Number} goodsId 商品ID
 */
function checkIsFavorite(goodsId) {
    return request.get('/api/favorites/check', {
        goods_id: goodsId
    });
}

module.exports = {
    getFavoriteList,
    addFavorite,
    removeFavorite,
    checkIsFavorite
};
