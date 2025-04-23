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
    return request.get(api.AddressList);
}

/**
 * 获取默认收货地址
 * @returns {Promise} 返回默认地址
 */
function getDefaultAddress() {
    return request.get(api.AddressDefault);
}

/**
 * 获取收货地址详情
 * @param {string} id 地址ID
 * @returns {Promise} 返回获取结果
 */
function getAddressDetail(id) {
    return request.get(`${api.AddressDetail}/${id}`);
}

/**
 * 保存地址信息（创建或更新）
 * @param {Object} data 地址信息
 */
function saveAddress(data) {
    if (data.id) {
        // 更新地址
        return request.put(api.AddressUpdate, data);
    } else {
        // 创建新地址
        return request.post(api.AddressAdd, data);
    }
}

/**
 * 删除收货地址
 * @param {string} id 地址ID
 * @returns {Promise} 返回删除结果
 */
function deleteAddress(id) {
    return request.del(api.AddressDelete.replace(':id', id));
}

/**
 * 设置默认收货地址
 * @param {string} id 地址ID
 * @returns {Promise} 返回设置结果
 */
function setDefaultAddress(id) {
    // return request.put(api.AddressDefault, { id });
    return request.put(`${api.AddressDefault}/${id}`);
}

module.exports = {
    getAddressList,
    getAddressDetail,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
}; 