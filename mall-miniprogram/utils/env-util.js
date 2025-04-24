/**
 * 环境工具函数
 */
const { getEnv } = require('../config/env');

/**
 * 获取当前环境信息
 * @returns {Object} 当前环境信息
 */
const getCurrentEnv = () => {
    return getEnv();
};

/**
 * 显示当前环境信息（仅在开发和测试环境显示）
 */
const showEnvInfo = () => {
    const currentEnv = getCurrentEnv();

    // 仅在非生产环境显示环境信息
    if (currentEnv.envName !== 'production') {
        // 自定义底部环境标签
        wx.showToast({
            title: `当前环境: ${currentEnv.envName}`,
            icon: 'none',
            duration: 2000
        });

        // 可以添加其他自定义环境标识，如导航栏标题等
        if (currentEnv.envName === 'development') {
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#07c160'
            });
        } else if (currentEnv.envName === 'testing') {
            wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#1989fa'
            });
        }
    }
};

/**
 * 判断是否为开发环境
 * @returns {Boolean} 是否为开发环境
 */
const isDev = () => {
    return getCurrentEnv().envName === 'development';
};

/**
 * 判断是否为测试环境
 * @returns {Boolean} 是否为测试环境
 */
const isTest = () => {
    return getCurrentEnv().envName === 'testing';
};

/**
 * 判断是否为生产环境
 * @returns {Boolean} 是否为生产环境
 */
const isProd = () => {
    return getCurrentEnv().envName === 'production';
};

module.exports = {
    getCurrentEnv,
    showEnvInfo,
    isDev,
    isTest,
    isProd
}; 