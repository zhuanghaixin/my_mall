// app.js
// 引入环境工具函数
const envUtil = require('./utils/env-util');
const { setEnv, getEnv } = require('./config/env');

App({
    onLaunch(options) {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 处理启动参数中的环境变量
        this.handleLaunchEnvironment(options);

        // 初始化环境设置
        this.initEnvironment();

        // 检查登录状态
        this.checkLoginStatus()
    },

    // 处理启动参数中的环境变量
    handleLaunchEnvironment(options) {
        console.log('App启动参数:', options);

        if (options && options.query && options.query.environment) {
            const envFromLaunch = options.query.environment;
            console.log('从启动参数获取环境:', envFromLaunch);

            // 设置环境
            if (setEnv(envFromLaunch)) {
                console.log('成功从启动参数设置环境:', envFromLaunch);
            }
        } else {
            // 如果使用条件编译，需要检查编译条件
            // 微信开发者工具在使用条件编译时，会在编译阶段传入编译条件中的参数
            const envFromScene = this.getEnvFromScene(options);
            if (envFromScene) {
                if (setEnv(envFromScene)) {
                    console.log('成功从场景值设置环境:', envFromScene);
                }
            }
        }
    },

    // 根据场景值判断环境
    getEnvFromScene(options) {
        // 这里可以根据不同场景值返回不同环境
        // 在真实场景中，您可能需要更复杂的逻辑
        if (options && options.scene) {
            // 示例：场景值1001对应开发环境
            switch (options.scene) {
                case 1001: return 'development';
                case 1002: return 'testing';
                case 1003: return 'production';
                default: return null;
            }
        }
        return null;
    },

    onShow() {
        // 小程序启动或从后台进入前台时触发
    },

    // 全局数据
    globalData: {
        userInfo: null,
        token: '',
        hasLogin: false,
        env: getEnv() // 保存当前环境信息
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
