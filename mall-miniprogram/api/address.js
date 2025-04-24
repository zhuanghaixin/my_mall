/**
 * 地址相关API服务
 */
const api = require('../config/api.js');
const request = require('../utils/request.js');

/**
 * 获取地址列表
 * @returns {Promise} 获取地址列表的Promise
 */
function getAddressList() {
    return request.get(api.AddressList);
}

/**
 * 获取默认地址
 * @returns {Promise} 获取默认地址的Promise
 */
function getDefaultAddress() {
    return request.get(api.AddressDefaultGet);
}

/**
 * 获取地址详情
 * @param {number} id - 地址ID
 * @returns {Promise} 获取地址详情的Promise
 */
function getAddressDetail(id) {
    return request.get(`${api.AddressDetail}/${id}`);
}

/**
 * 保存地址
 * @param {Object} data - 地址数据
 * @returns {Promise} 保存地址的Promise
 */
function saveAddress(data) {
    if (data.id) {
        // 更新地址
        return request.put(api.AddressUpdate, data);
    } else {
        // 新增地址
        return request.post(api.AddressAdd, data);
    }
}

/**
 * 删除地址
 * @param {number} id - 地址ID
 * @returns {Promise} 删除地址的Promise
 */
function deleteAddress(id) {
    return request.del(`${api.AddressDelete}/${id}`);
}

/**
 * 设置默认地址
 * @param {number} id - 地址ID
 * @returns {Promise} 设置默认地址的Promise
 */
function setDefaultAddress(id) {
    return request.put(`${api.AddressDefault}/${id}`);
}

module.exports = {
    getAddressList,
    getDefaultAddress,
    getAddressDetail,
    saveAddress,
    deleteAddress,
    setDefaultAddress
}; 