// 请求封装模块
import API from '../config/api';

/**
 * 替换URL中的参数
 * @param {string} url - 原始URL，如/api/goods/:id
 * @param {Object} params - 参数对象，如{id: 1}
 * @returns {string} 替换后的URL，如/api/goods/1
 */
const replaceUrlParams = (url, params) => {
    if (!params) {
        return url;
    }
    let result = url;
    Object.keys(params).forEach(key => {
        const reg = new RegExp(`:${key}`, 'g');
        result = result.replace(reg, params[key]);
    });
    return result;
};

/**
 * 请求函数
 * @param {Object} options - 请求选项
 * @returns {Promise} Promise对象
 */
const request = (options) => {
    const { url, method = 'GET', data, urlParams, header = {}, loading = true } = options;

    const app = getApp();
    const token = app ? app.globalData.token : wx.getStorageSync('token') || '';

    // 替换URL中的参数
    const finalUrl = replaceUrlParams(url, urlParams);

    // 显示加载提示
    if (loading) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
    }

    // 合并请求头
    const headers = {
        'Content-Type': 'application/json',
        ...header
    };

    // 添加token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
        wx.request({
            url: finalUrl,
            method,
            data,
            header: headers,
            success: (res) => {
                if (loading) {
                    wx.hideLoading();
                }

                // 处理响应
                const { statusCode, data } = res;

                if (statusCode >= 200 && statusCode < 300) {
                    // 成功的请求
                    if (data.code === 200) {
                        resolve(data);
                    } else if (data.code === 401) {
                        // 未授权或token过期
                        if (app) {
                            app.clearLoginStatus();
                        }
                        wx.navigateTo({
                            url: '/pages/login/login'
                        });
                        reject(data);
                    } else {
                        // 其他业务错误
                        wx.showToast({
                            title: data.message || '请求失败',
                            icon: 'none'
                        });
                        reject(data);
                    }
                } else {
                    // HTTP错误
                    wx.showToast({
                        title: `请求错误：${statusCode}`,
                        icon: 'none'
                    });
                    reject(res);
                }
            },
            fail: (err) => {
                if (loading) {
                    wx.hideLoading();
                }

                wx.showToast({
                    title: '网络错误，请稍后再试',
                    icon: 'none'
                });
                reject(err);
            }
        });
    });
};

// GET请求
const get = (url, data, options = {}) => {
    return request({
        url,
        method: 'GET',
        data,
        ...options
    });
};

// POST请求
const post = (url, data, options = {}) => {
    return request({
        url,
        method: 'POST',
        data,
        ...options
    });
};

// PUT请求
const put = (url, data, options = {}) => {
    return request({
        url,
        method: 'PUT',
        data,
        ...options
    });
};

// DELETE请求
const del = (url, data, options = {}) => {
    return request({
        url,
        method: 'DELETE',
        data,
        ...options
    });
};

export default {
    request,
    get,
    post,
    put,
    delete: del
}; 