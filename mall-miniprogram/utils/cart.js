/**
 * 购物车相关工具函数
 */
const cartApi = require('../api/cart.js');
const auth = require('./auth.js');
const util = require('./util.js');

/**
 * 添加商品到购物车，自动处理登录状态
 * @param {Object} data - 添加的商品信息
 * @param {string} data.goodsId - 商品ID
 * @param {number} data.number - 商品数量
 * @param {Array} [data.productIds] - 商品规格ID列表（可选）
 * @returns {Promise} Promise对象
 */
function addToCart(data) {
    return new Promise((resolve, reject) => {
        // 检查是否已登录
        if (!auth.isLoggedIn()) {
            // 获取当前页面路径作为登录后的重定向目标
            const currentPage = util.getCurrentPageUrl();

            // 提示用户
            wx.showModal({
                title: '提示',
                content: '请先登录后再添加商品到购物车',
                confirmText: '去登录',
                cancelText: '取消',
                success: function (res) {
                    if (res.confirm) {
                        // 用户点击确定，跳转到登录页
                        auth.navigateToLogin(currentPage);
                    }
                }
            });

            // 返回未登录错误
            reject(new Error('用户未登录'));
            return;
        }

        // 已登录，调用添加购物车API
        cartApi.addToCart(data)
            .then(res => {
                // 添加成功
                if (res.code === 200) {
                    // 显示成功提示
                    util.showSuccessToast('添加成功');
                    resolve(res);
                } else {
                    // 添加失败
                    util.showErrorToast(res.msg || '添加失败');
                    reject(new Error(res.msg || '添加失败'));
                }
            })
            .catch(err => {
                // 请求失败
                util.showErrorToast('网络错误，请重试');
                reject(err);
            });
    });
}

/**
 * 从购物车删除商品，自动处理登录状态
 * @param {Object} data - 删除的商品信息
 * @returns {Promise} Promise对象
 */
function deleteFromCart(data) {
    return new Promise((resolve, reject) => {
        // 检查是否已登录
        if (!auth.isLoggedIn()) {
            // 跳转到登录页
            auth.navigateToLogin();
            // 返回未登录错误
            reject(new Error('用户未登录'));
            return;
        }

        // 已登录，调用删除购物车API
        cartApi.deleteCart(data)
            .then(res => {
                if (res.code === 200) {
                    util.showToast('删除成功');
                    resolve(res);
                } else {
                    util.showErrorToast(res.msg || '删除失败');
                    reject(new Error(res.msg || '删除失败'));
                }
            })
            .catch(err => {
                util.showErrorToast('网络错误，请重试');
                reject(err);
            });
    });
}

/**
 * 更新购物车商品数量，自动处理登录状态
 * @param {Object} data - 更新的商品信息
 * @returns {Promise} Promise对象
 */
function updateCartItem(data) {
    return new Promise((resolve, reject) => {
        // 检查是否已登录
        if (!auth.isLoggedIn()) {
            // 跳转到登录页
            auth.navigateToLogin();
            // 返回未登录错误
            reject(new Error('用户未登录'));
            return;
        }

        // 已登录，调用更新购物车API
        cartApi.updateCart(data)
            .then(res => {
                if (res.code === 200) {
                    resolve(res);
                } else {
                    util.showErrorToast(res.msg || '更新失败');
                    reject(new Error(res.msg || '更新失败'));
                }
            })
            .catch(err => {
                util.showErrorToast('网络错误，请重试');
                reject(err);
            });
    });
}

module.exports = {
    addToCart,
    deleteFromCart,
    updateCartItem
}; 