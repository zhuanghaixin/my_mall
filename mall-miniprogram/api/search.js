/**
 * 搜索相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 */
function searchGoods(params) {
    return request.get(api.Search, params);
}

/**
 * 获取热门搜索词
 */
function getHotSearch() {
    return request.get(api.SearchHot);
}

/**
 * 获取用户搜索历史
 */
function getSearchHistory() {
    return request.get(api.SearchHistory);
}

/**
 * 清除用户搜索历史
 */
function clearSearchHistory() {
    return request.post(api.SearchClearHistory);
}

module.exports = {
    searchGoods,
    getHotSearch,
    getSearchHistory,
    clearSearchHistory
}; 