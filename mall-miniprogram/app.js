// app.js
App({
    onLaunch() {
        // 展示本地存储能力
        const logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

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
        hasLogin: false
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
