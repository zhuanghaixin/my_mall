/**
 * 认证相关工具函数
 */

// Token在Storage中的key
const TOKEN_KEY = 'userToken';

/**
 * 设置登录Token
 * @param {string} token - 用户登录token
 */
function setToken(token) {
    wx.setStorageSync(TOKEN_KEY, token);
}

/**
 * 获取登录Token
 * @returns {string} 用户登录token
 */
function getToken() {
    return wx.getStorageSync(TOKEN_KEY) || '';
}

/**
 * 移除登录Token
 */
function removeToken() {
    wx.removeStorageSync(TOKEN_KEY);
}

/**
 * 检查是否登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
    return !!getToken();
}

/**
 * 检查登录状态并处理
 * @param {string} redirectUrl - 登录后重定向地址
 * @returns {boolean} 是否已登录
 */
function checkLogin(redirectUrl) {
    if (isLoggedIn()) {
        return true;
    }

    // 用户未登录，跳转登录页面
    navigateToLogin(redirectUrl);
    return false;
}

/**
 * 跳转到登录页面
 * @param {string} redirectUrl - 登录后重定向地址
 */
function navigateToLogin(redirectUrl) {
    let url = '/pages/user/login/index';

    if (redirectUrl) {
        url += `?redirect=${encodeURIComponent(redirectUrl)}`;
    }

    wx.navigateTo({
        url: url
    });
}

/**
 * 清除登录信息
 */
function clearLoginInfo() {
    // 清除token
    removeToken();

    // 清除用户信息
    wx.removeStorageSync('userInfo');

    // 更新全局数据
    const app = getApp();
    app.globalData.userInfo = null;
    app.globalData.isLogin = false;
}

module.exports = {
    setToken,
    getToken,
    removeToken,
    isLoggedIn,
    checkLogin,
    navigateToLogin,
    clearLoginInfo
}; 