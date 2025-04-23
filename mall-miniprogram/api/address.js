/**
 * 收货地址相关API请求
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取收货地址列表
 * @returns {Promise} 返回获取结果
 */
function getAddressList() {
    return request.get('/api/address/list');
}

/**
 * 获取收货地址详情
 * @param {string} id 地址ID
 * @returns {Promise} 返回获取结果
 */
function getAddressDetail(id) {
    return request.get(`/api/address/detail/${id}`);
}

/**
 * 保存地址信息（创建或更新）
 * @param {Object} data 地址信息
 */
function saveAddress(data) {
    if (data.id) {
        // 更新地址
        return request.put('/api/address/update', data);
    } else {
        // 创建新地址
        return request.post('/api/address/create', data);
    }
}

/**
 * 删除收货地址
 * @param {string} id 地址ID
 * @returns {Promise} 返回删除结果
 */
function deleteAddress(id) {
    return request.delete(`/api/address/delete/${id}`);
}

/**
 * 设置默认收货地址
 * @param {string} id 地址ID
 * @returns {Promise} 返回设置结果
 */
function setDefaultAddress(id) {
    return request.put(`/api/address/set-default/${id}`);
}

module.exports = {
    getAddressList,
    getAddressDetail,
    saveAddress,
    deleteAddress,
    setDefaultAddress
}; 