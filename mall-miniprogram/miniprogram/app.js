// app.js
App({
    globalData: {
        userInfo: null,
        token: '',
        isLogin: false
    },
    onLaunch() {
        // 获取本地存储的token
        const token = wx.getStorageSync('token') || '';
        if (token) {
            this.globalData.token = token;
            this.globalData.isLogin = true;
            // 获取用户信息
            this.getUserInfo();
        }
    },

    // 获取用户信息
    getUserInfo() {
        if (!this.globalData.token) return;

        wx.request({
            url: 'http://localhost:8080/api/user/info',
            method: 'GET',
            header: {
                'Authorization': `Bearer ${this.globalData.token}`
            },
            success: (res) => {
                if (res.data.code === 200) {
                    this.globalData.userInfo = res.data.data;
                } else if (res.data.code === 401) {
                    // token失效，清除登录状态
                    this.clearLoginStatus();
                }
            },
            fail: () => {
                wx.showToast({
                    title: '获取用户信息失败',
                    icon: 'none'
                });
            }
        });
    },

    // 清除登录状态
    clearLoginStatus() {
        this.globalData.token = '';
        this.globalData.userInfo = null;
        this.globalData.isLogin = false;
        wx.removeStorageSync('token');
    },

    // 检查登录状态
    checkLogin() {
        if (!this.globalData.isLogin) {
            wx.navigateTo({
                url: '/pages/login/login'
            });
            return false;
        }
        return true;
    }
}) 