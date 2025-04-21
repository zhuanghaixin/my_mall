/**
 * 用户相关API请求
 */
const api = require('../config/api.js');
const request = require('./request.js');

/**
 * 微信登录
 * @param {Object} data - 登录参数，包含code等
 */
function login(data) {
    return request.post(api.UserLogin, data);
}

/**
 * 获取用户信息
 */
function getUserInfo() {
    return request.get(api.UserInfo);
}

/**
 * 绑定手机号
 * @param {Object} data - 手机号相关信息
 */
function bindPhone(data) {
    return request.post(api.BindPhone, data);
}

module.exports = {
    login,
    getUserInfo,
    bindPhone
}; 