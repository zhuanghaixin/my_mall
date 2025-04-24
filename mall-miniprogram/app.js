// app.js
// 引入环境工具函数
const envUtil = require('./utils/env-util');

App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 初始化环境设置
        this.initEnvironment();

        // 检查登录状态
        this.checkLoginStatus()
    },

    onShow() {
        // 小程序启动或从后台进入前台时触发
    },

    // 全局数据
    globalData: {
        userInfo: null,
        token: '',
        hasLogin: false,
        env: envUtil.getCurrentEnv() // 保存当前环境信息
    },

    // 初始化环境设置
    initEnvironment() {
        // 获取当前环境
        const currentEnv = envUtil.getCurrentEnv();
        this.globalData.env = currentEnv;

        // 在开发和测试环境显示环境信息
        envUtil.showEnvInfo();

        console.log('当前环境:', currentEnv.envName);
    },

    // 检查登录状态
    checkLoginStatus() {
        const token = wx.getStorageSync('token')
        if (token) {
            this.globalData.token = token
            this.globalData.hasLogin = true
        } else {
            this.globalData.hasLogin = false
        }
    }
})
