/**
 * 用户登录页面
 */
const userApi = require('../../../api/user');
const util = require('../../../utils/util');
const auth = require('../../../utils/auth');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        loading: false,            // 登录中状态
        redirectUrl: '',           // 登录成功后的重定向地址
        canIUseGetUserProfile: false, // 是否可以使用getUserProfile
        showPrivacyModal: false,   // 是否显示隐私协议弹窗
        loginType: 'wechat',       // 登录方式：wechat-微信登录，phone-手机号登录
        phoneNumber: '',           // 手机号
        code: '',                  // 验证码
        codeSent: false,           // 是否已发送验证码
        countdown: 60,             // 验证码倒计时
        timer: null                // 定时器
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('登录页面参数:', options);

        // 保存重定向URL
        if (options.redirect) {
            this.setData({
                redirectUrl: decodeURIComponent(options.redirect)
            });
        }

        // 检查是否支持getUserProfile
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            });
        }
    },

    /**
     * 切换登录方式
     */
    switchLoginType: function () {
        this.setData({
            loginType: this.data.loginType === 'wechat' ? 'phone' : 'wechat'
        });
    },

    /**
     * 微信一键登录
     */
    handleWechatLogin: function () {
        if (this.data.loading) return;

        // 检查隐私政策接受状态
        if (wx.getPrivacySetting) {
            wx.getPrivacySetting({
                success: res => {
                    if (res.needAuthorization) {
                        // 需要授权隐私协议
                        this.setData({
                            showPrivacyModal: true
                        });
                    } else {
                        // 已经接受隐私协议，直接获取用户信息
                        this.getUserProfileDirectly();
                    }
                },
                fail: () => {
                    // 接口调用失败，尝试直接获取用户信息
                    this.getUserProfileDirectly();
                }
            });
        } else {
            // 低版本直接获取用户信息
            this.getUserProfileDirectly();
        }
    },

    /**
     * 获取用户信息（直接调用，不在异步回调中）
     */
    getUserProfileDirectly: function () {
        this.setData({ loading: true });

        // 先获取用户信息
        if (this.data.canIUseGetUserProfile) {
            wx.getUserProfile({
                desc: '用于完善会员资料',
                success: (profileRes) => {
                    // 获取用户信息成功后，再获取登录code
                    wx.login({
                        success: (loginRes) => {
                            if (loginRes.code) {
                                // 发送登录请求
                                this.doLogin(loginRes.code, profileRes.userInfo);
                            } else {
                                console.error('登录失败，未获取到code');
                                this.setData({ loading: false });
                                util.showErrorToast('登录失败');
                            }
                        },
                        fail: (err) => {
                            console.error('wx.login调用失败:', err);
                            this.setData({ loading: false });
                            util.showErrorToast('登录失败');
                        }
                    });
                },
                fail: (err) => {
                    console.error('获取用户信息失败:', err);
                    this.setData({ loading: false });
                    util.showErrorToast('获取用户信息失败');
                }
            });
        } else {
            // 兼容低版本
            wx.getUserInfo({
                success: (infoRes) => {
                    // 获取用户信息成功后，再获取登录code
                    wx.login({
                        success: (loginRes) => {
                            if (loginRes.code) {
                                this.doLogin(loginRes.code, infoRes.userInfo);
                            } else {
                                console.error('登录失败，未获取到code');
                                this.setData({ loading: false });
                                util.showErrorToast('登录失败');
                            }
                        },
                        fail: (err) => {
                            console.error('wx.login调用失败:', err);
                            this.setData({ loading: false });
                            util.showErrorToast('登录失败');
                        }
                    });
                },
                fail: (err) => {
                    console.error('获取用户信息失败:', err);
                    this.setData({ loading: false });
                    util.showErrorToast('获取用户信息失败');
                }
            });
        }
    },

    /**
     * 确认隐私协议
     */
    onAgreePrivacy: function () {
        this.setData({
            showPrivacyModal: false
        });

        // 接受隐私协议
        if (wx.requirePrivacyAuthorize) {
            wx.requirePrivacyAuthorize({
                success: () => {
                    // 隐私授权成功，获取用户信息
                    this.getUserProfileDirectly();
                },
                fail: () => {
                    util.showToast('请先同意隐私协议');
                }
            });
        } else {
            // 低版本直接获取用户信息
            this.getUserProfileDirectly();
        }
    },

    /**
     * 拒绝隐私协议
     */
    onDeclinePrivacy: function () {
        this.setData({
            showPrivacyModal: false
        });
        util.showToast('需同意隐私协议才能使用');
    },

    /**
     * 发送登录请求到服务器
     */
    doLogin: function (code, userInfo) {
        userApi.wxLogin({
            code: code,
            nickname: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            gender: userInfo.gender
        }).then(res => {
            console.log('登录成功:', res);

            if (res.code === 200) {
                // 保存token和用户信息
                auth.setToken(res.data.token);

                // 缓存用户信息
                wx.setStorageSync('userInfo', res.data.userInfo);

                // 更新全局用户信息
                const app = getApp();
                app.globalData.userInfo = res.data.userInfo;
                app.globalData.isLogin = true;

                // 显示登录成功提示
                util.showToast('登录成功');

                // 跳转到重定向页面或首页
                setTimeout(() => {
                    this.navigateBack();
                }, 1500);
            } else {
                this.setData({ loading: false });
                util.showErrorToast(res.msg || '登录失败');
            }
        }).catch(err => {
            console.error('登录请求失败:', err);
            this.setData({ loading: false });
            util.showErrorToast('网络错误，请重试');
        });
    },

    /**
     * 获取手机号输入
     */
    onPhoneInput: function (e) {
        this.setData({
            phoneNumber: e.detail.value
        });
    },

    /**
     * 获取验证码输入
     */
    onCodeInput: function (e) {
        this.setData({
            code: e.detail.value
        });
    },

    /**
     * 发送验证码
     */
    sendCode: function () {
        if (this.data.codeSent) return;

        const phone = this.data.phoneNumber;
        if (!phone || !/^1\d{10}$/.test(phone)) {
            util.showToast('请输入正确的手机号');
            return;
        }

        this.setData({ loading: true });

        // 发送验证码请求
        userApi.sendSmsCode({
            phone: phone
        }).then(res => {
            if (res.code === 200) {
                util.showToast('验证码已发送');

                // 开始倒计时
                this.setData({
                    codeSent: true,
                    loading: false
                });

                this.startCountdown();
            } else {
                this.setData({ loading: false });
                util.showErrorToast(res.msg || '发送验证码失败');
            }
        }).catch(err => {
            console.error('发送验证码失败:', err);
            this.setData({ loading: false });
            util.showErrorToast('网络错误，请重试');
        });
    },

    /**
     * 开始倒计时
     */
    startCountdown: function () {
        if (this.data.timer) clearInterval(this.data.timer);

        let countdown = this.data.countdown;
        const timer = setInterval(() => {
            countdown--;

            if (countdown <= 0) {
                clearInterval(timer);
                this.setData({
                    codeSent: false,
                    countdown: 60,
                    timer: null
                });
            } else {
                this.setData({
                    countdown: countdown
                });
            }
        }, 1000);

        this.setData({ timer: timer });
    },

    /**
     * 手机号登录
     */
    handlePhoneLogin: function () {
        if (this.data.loading) return;

        const phone = this.data.phoneNumber;
        const code = this.data.code;

        if (!phone || !/^1\d{10}$/.test(phone)) {
            util.showToast('请输入正确的手机号');
            return;
        }

        if (!code || code.length !== 6) {
            util.showToast('请输入6位验证码');
            return;
        }

        this.setData({ loading: true });

        // 发送手机号登录请求
        userApi.phoneLogin({
            phone: phone,
            code: code
        }).then(res => {
            if (res.code === 200) {
                // 保存token和用户信息
                auth.setToken(res.data.token);

                // 缓存用户信息
                wx.setStorageSync('userInfo', res.data.userInfo);

                // 更新全局用户信息
                const app = getApp();
                app.globalData.userInfo = res.data.userInfo;
                app.globalData.isLogin = true;

                // 显示登录成功提示
                util.showToast('登录成功');

                // 跳转到重定向页面或首页
                setTimeout(() => {
                    this.navigateBack();
                }, 1500);
            } else {
                this.setData({ loading: false });
                util.showErrorToast(res.msg || '登录失败');
            }
        }).catch(err => {
            console.error('登录请求失败:', err);
            this.setData({ loading: false });
            util.showErrorToast('网络错误，请重试');
        });
    },

    /**
     * 获取手机号授权回调
     */
    getPhoneNumber: function (e) {
        console.log('getPhoneNumber回调:', e);

        // 开发环境模拟模式
        const isDev = __wxConfig.envVersion === 'develop' || __wxConfig.envVersion === 'trial';

        // 用户拒绝授权或开发工具中无法获取
        if (e.detail.errMsg !== 'getPhoneNumber:ok') {
            console.error('手机号授权失败:', e.detail.errMsg);

            // 在开发环境中模拟手机号数据
            if (isDev && e.detail.errMsg === 'getPhoneNumber:fail no permission') {
                console.log('开发环境中，使用模拟数据进行登录');
                this.mockPhoneNumberLogin();
                return;
            }

            util.showToast('未授权获取手机号');
            return;
        }

        // 检查是否有加密数据和IV
        if (!e.detail.encryptedData || !e.detail.iv) {
            console.error('获取手机号失败: 缺少加密数据', e.detail);
            util.showErrorToast('获取手机号信息失败');
            return;
        }

        this.setData({ loading: true });

        // 获取临时登录凭证code
        wx.login({
            success: (loginRes) => {
                console.log('wx.login成功:', loginRes);

                if (loginRes.code) {
                    // 打印请求参数，便于调试
                    const requestData = {
                        code: loginRes.code,
                        encryptedData: e.detail.encryptedData,
                        iv: e.detail.iv
                    };
                    console.log('准备发送phoneNumberLogin请求:', requestData);

                    // 发送手机号解密登录请求
                    userApi.phoneNumberLogin(requestData).then(res => {
                        console.log('phoneNumberLogin响应:', res);

                        if (res.code === 200) {
                            // 保存token和用户信息
                            auth.setToken(res.data.token);

                            // 缓存用户信息
                            wx.setStorageSync('userInfo', res.data.userInfo);

                            // 更新全局用户信息
                            const app = getApp();
                            app.globalData.userInfo = res.data.userInfo;
                            app.globalData.isLogin = true;

                            // 显示登录成功提示
                            util.showToast('登录成功');

                            // 跳转到重定向页面或首页
                            setTimeout(() => {
                                this.navigateBack();
                            }, 1500);
                        } else {
                            this.setData({ loading: false });
                            util.showErrorToast(res.msg || '登录失败');
                        }
                    }).catch(err => {
                        console.error('登录请求失败:', err);
                        this.setData({ loading: false });
                        // 显示更详细的错误信息
                        if (err.message) {
                            util.showErrorToast(`请求错误: ${err.message}`);
                        } else {
                            util.showErrorToast('网络错误，请重试');
                        }
                    });
                } else {
                    console.error('登录失败，未获取到code');
                    this.setData({ loading: false });
                    util.showErrorToast('登录失败');
                }
            },
            fail: (err) => {
                console.error('wx.login调用失败:', err);
                this.setData({ loading: false });
                util.showToast('登录凭证获取失败');
            }
        });
    },

    /**
     * 开发环境下模拟手机号登录
     */
    mockPhoneNumberLogin: function () {
        this.setData({ loading: true });

        // 获取临时登录凭证code
        wx.login({
            success: (loginRes) => {
                console.log('wx.login成功 (模拟模式):', loginRes);

                if (loginRes.code) {
                    // 创建模拟的手机号数据
                    const mockData = {
                        code: loginRes.code,
                        // 这里不提供真实的加密数据，后端会检测到是开发环境并使用测试账号
                        mockPhone: '13800138000', // 模拟手机号
                        isMockData: true // 标记为模拟数据
                    };
                    console.log('准备发送模拟phoneNumberLogin请求:', mockData);

                    // 发送模拟登录请求
                    userApi.phoneNumberLogin(mockData).then(res => {
                        console.log('模拟phoneNumberLogin响应:', res);

                        if (res.code === 200) {
                            // 保存token和用户信息
                            auth.setToken(res.data.token);

                            // 缓存用户信息
                            wx.setStorageSync('userInfo', res.data.userInfo);

                            // 更新全局用户信息
                            const app = getApp();
                            app.globalData.userInfo = res.data.userInfo;
                            app.globalData.isLogin = true;

                            // 显示登录成功提示
                            util.showToast('模拟登录成功');

                            // 跳转到重定向页面或首页
                            setTimeout(() => {
                                this.navigateBack();
                            }, 1500);
                        } else {
                            this.setData({ loading: false });
                            util.showErrorToast(res.msg || '模拟登录失败');
                        }
                    }).catch(err => {
                        console.error('模拟登录请求失败:', err);
                        this.setData({ loading: false });
                        util.showErrorToast('模拟登录网络错误，请检查后端服务');
                    });
                } else {
                    console.error('登录失败，未获取到code');
                    this.setData({ loading: false });
                    util.showErrorToast('获取登录凭证失败');
                }
            },
            fail: (err) => {
                console.error('wx.login调用失败:', err);
                this.setData({ loading: false });
                util.showErrorToast('登录凭证获取失败');
            }
        });
    },

    /**
     * 返回上一页或重定向
     */
    navigateBack: function () {
        const redirectUrl = this.data.redirectUrl;

        if (redirectUrl) {
            // 有重定向地址，跳转到指定页面
            wx.redirectTo({
                url: redirectUrl,
                fail: () => {
                    // 重定向失败，可能是tabbar页面，使用switchTab
                    wx.switchTab({
                        url: redirectUrl,
                        fail: () => {
                            // 最终失败，返回首页
                            wx.switchTab({
                                url: '/pages/index/index'
                            });
                        }
                    });
                }
            });
        } else {
            // 没有重定向地址，返回上一页
            wx.navigateBack({
                fail: () => {
                    // 返回失败，跳转到首页
                    wx.switchTab({
                        url: '/pages/index/index'
                    });
                }
            });
        }
    },

    /**
     * 页面卸载时清理
     */
    onUnload: function () {
        // 清除倒计时
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
    }
}); 