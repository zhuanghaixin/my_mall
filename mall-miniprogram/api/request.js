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
                    if (res.data.code == 200) {
                        resolve(res.data.data);
                    } else if (res.data.code == 401) {
                        // 登录失效，重新登录
                        util.showErrorToast('登录已失效');
                        setTimeout(() => {
                            wx.redirectTo({
                                url: '/pages/login/index',
                            });
                        }, 1500);
                        reject(res);
                    } else {
                        // 其他错误
                        util.showErrorToast(res.data.message);
                        reject(res);
                    }
                } else {
                    reject(res.errMsg);
                }
            },
            fail: function (err) {
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