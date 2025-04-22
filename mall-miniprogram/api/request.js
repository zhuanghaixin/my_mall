/**
 * 封装网络请求
 */
const app = getApp();
const util = require('../utils/util.js');

/**
 * Promise封装wx.request
 */
function request(url, data = {}, method = "GET") {
    return new Promise(function (resolve, reject) {
        wx.request({
            url: url,
            data: data,
            method: method,
            header: {
                'Content-Type': 'application/json',
                'Authorization': wx.getStorageSync('token')
            },
            success: function (res) {
                if (res.statusCode == 200) {
                    // 直接返回完整的响应对象，让调用者处理code码
                    resolve(res.data);
                } else {
                    // 处理HTTP错误
                    const errorMsg = res.errMsg || '服务器错误';
                    util.showErrorToast(errorMsg);
                    reject(errorMsg);
                }
            },
            fail: function (err) {
                // 处理请求失败
                const errorMsg = err.errMsg || '网络错误';
                util.showErrorToast(errorMsg);
                reject(err);
            }
        })
    });
}

/**
 * GET请求
 */
function get(url, data = {}) {
    return request(url, data, 'GET');
}

/**
 * POST请求
 */
function post(url, data = {}) {
    return request(url, data, 'POST');
}

/**
 * PUT请求
 */
function put(url, data = {}) {
    return request(url, data, 'PUT');
}

/**
 * DELETE请求
 */
function del(url, data = {}) {
    return request(url, data, 'DELETE');
}

module.exports = {
    request,
    get,
    post,
    put,
    del
}; 