// 用户相关API接口
import request from './request';
import API from '../config/api';

/**
 * 微信登录
 * @param {Object} data - 登录数据，包含code和userInfo
 */
const wxLogin = (data) => {
    return request.post(API.USER.WX_LOGIN, data);
};

/**
 * 绑定手机号
 * @param {Object} data - 手机号数据
 */
const bindPhone = (data) => {
    return request.post(API.USER.BIND_PHONE, data);
};

/**
 * 获取用户信息
 */
const getUserInfo = () => {
    return request.get(API.USER.INFO);
};

/**
 * 更新用户信息
 * @param {Object} data - 用户信息数据
 */
const updateUserInfo = (data) => {
    return request.put(API.USER.UPDATE_INFO, data);
};

export default {
    wxLogin,
    bindPhone,
    getUserInfo,
    updateUserInfo
}; 