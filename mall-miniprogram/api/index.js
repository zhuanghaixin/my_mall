/**
 * API模块统一入口
 */
const api = require('../config/api.js');
const request = require('./request.js');
const user = require('./user.js');
const home = require('./home.js');
const goods = require('./goods.js');
const category = require('./category.js');
const cart = require('./cart.js');

// 导出所有API模块
module.exports = {
    api,
    request,
    user,
    home,
    goods,
    category,
    cart
}; 