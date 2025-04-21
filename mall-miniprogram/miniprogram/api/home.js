// 首页相关API接口
import request from './request';
import API from '../config/api';

/**
 * 获取首页轮播图
 */
const getBanner = () => {
    return request.get(API.HOME.BANNER);
};

/**
 * 获取首页数据
 */
const getHomeData = () => {
    return request.get(API.HOME.DATA);
};

export default {
    getBanner,
    getHomeData
}; 