/**
 * API模块统一入口
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');
// const localRequest = require('./request.js');  // 添加本地的request模块引用
const user = require('./user.js');
const home = require('./home.js');
const goods = require('./goods.js');
const category = require('./category.js');
const cart = require('./cart.js');

// 导出所有API模块
module.exports = {
    api,
    request,
    // localRequest,  // 导出本地request模块
    user,
    home,
    goods,
    category,
    cart
}; 