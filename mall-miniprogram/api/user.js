/**
 * 用户相关API请求
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 微信登录
 * @param {Object} data - 包含临时登录凭证的数据对象
 * @param {string} data.code - 微信临时登录凭证code
 * @returns {Promise} 返回登录结果
 */
function wxLogin(data) {
    return request.post(api.UserLogin, data);
}

/**
 * 手机号+验证码登录
 * @param {Object} data - 包含手机号和验证码的数据对象
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @returns {Promise} 返回登录结果
 */
function phoneLogin(data) {
    return request.post(api.PhoneLogin, data);
}

/**
 * 微信手机号一键登录
 * @param {Object} data - 微信手机号解密相关数据
 * @param {string} data.encryptedData - 加密数据
 * @param {string} data.iv - 加密算法的初始向量
 * @param {string} data.code - 微信临时登录凭证
 * @returns {Promise} 返回登录结果
 */
function phoneNumberLogin(data) {
    console.log('API调用 - phoneNumberLogin:', api.PhoneNumberLogin, data);
    // 使用测试服务器URL
    const url = 'http://127.0.0.1:8080/api/user/phonenumberlogin';
    // 先尝试使用配置的URL
    return request.post(api.PhoneNumberLogin, data)
        .catch(error => {
            console.warn('原始API调用失败，尝试使用固定地址:', url);
            // 如果失败，尝试使用固定的URL
            return request.post(url, data);
        });
}

/**
 * 发送短信验证码
 * @param {Object} data - 包含手机号的数据对象
 * @param {string} data.phone - 手机号
 * @returns {Promise} 返回发送结果
 */
function sendSmsCode(data) {
    return request.post(api.SendSmsCode, data);
}

/**
 * 获取用户信息
 * @returns {Promise} 返回用户信息
 */
function getUserInfo() {
    return request.get(api.UserInfo);
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 * @returns {Promise} 返回更新结果
 */
function updateUserInfo(data) {
    return request.post(api.UserInfo, data);
}

/**
 * 绑定手机号
 * @param {Object} data - 包含手机号和验证码的数据对象
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 * @returns {Promise} 返回绑定结果
 */
function bindPhone(data) {
    return request.post(api.BindPhone, data);
}

/**
 * 检查登录状态
 * @returns {Promise} 返回登录状态
 */
function checkLogin() {
    return request.get(api.CheckLogin);
}

module.exports = {
    wxLogin,
    phoneLogin,
    phoneNumberLogin,
    sendSmsCode,
    getUserInfo,
    updateUserInfo,
    bindPhone,
    checkLogin
}; 