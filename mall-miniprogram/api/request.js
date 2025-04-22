// /**
//  * 封装网络请求工具
//  */
// const util = require('../utils/util.js');
// const auth = require('../utils/auth.js');

// /**
//  * 统一请求处理
//  * @param {string} url - 请求地址
//  * @param {Object} data - 请求参数
//  * @param {string} method - 请求方法
//  * @param {boolean} needToken - 是否需要携带token
//  * @returns {Promise} 返回Promise对象
//  */
// function request(url, data = {}, method = 'GET', needToken = true) {
//     return new Promise((resolve, reject) => {
//         // 显示加载提示
//         util.showLoading();

//         // 构建请求头
//         const header = {
//             'Content-Type': 'application/json'
//         };

//         // 如果需要token，添加到请求头
//         if (needToken) {
//             const token = auth.getToken();
//             if (token) {
//                 header.Authorization = `Bearer ${token}`;
//             }
//         }

//         // 发起请求
//         wx.request({
//             url: url,
//             data: data,
//             method: method,
//             header: header,
//             success: function (res) {
//                 // 隐藏加载提示
//                 util.hideLoading();

//                 // 登录过期处理
//                 if (res.statusCode === 401) {
//                     // 清除登录信息
//                     auth.clearLoginInfo();

//                     // 跳转到登录页
//                     const currentPage = util.getCurrentPageUrl();
//                     auth.navigateToLogin(currentPage);

//                     reject(new Error('登录已过期，请重新登录'));
//                     return;
//                 }

//                 // 正常返回数据
//                 resolve(res.data);
//             },
//             fail: function (err) {
//                 // 隐藏加载提示
//                 util.hideLoading();

//                 // 网络错误提示
//                 util.showErrorToast('网络请求失败');
//                 reject(err);
//             }
//         });
//     });
// }

// /**
//  * GET请求
//  * @param {string} url - 请求地址
//  * @param {Object} data - 请求参数
//  * @param {boolean} needToken - 是否需要携带token
//  * @returns {Promise} 返回Promise对象
//  */
// function get(url, data = {}, needToken = true) {
//     return request(url, data, 'GET', needToken);
// }

// /**
//  * POST请求
//  * @param {string} url - 请求地址
//  * @param {Object} data - 请求参数
//  * @param {boolean} needToken - 是否需要携带token
//  * @returns {Promise} 返回Promise对象
//  */
// function post(url, data = {}, needToken = true) {
//     return request(url, data, 'POST', needToken);
// }

// /**
//  * PUT请求
//  * @param {string} url - 请求地址
//  * @param {Object} data - 请求参数
//  * @param {boolean} needToken - 是否需要携带token
//  * @returns {Promise} 返回Promise对象
//  */
// function put(url, data = {}, needToken = true) {
//     return request(url, data, 'PUT', needToken);
// }

// /**
//  * DELETE请求
//  * @param {string} url - 请求地址
//  * @param {Object} data - 请求参数
//  * @param {boolean} needToken - 是否需要携带token
//  * @returns {Promise} 返回Promise对象
//  */
// function del(url, data = {}, needToken = true) {
//     return request(url, data, 'DELETE', needToken);
// }

// module.exports = {
//     request,
//     get,
//     post,
//     put,
//     del
// };