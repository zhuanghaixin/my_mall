// pages/user/index.js
// 引入用户API服务
const userApi = require('../../api/user');
const orderApi = require('../../api/order');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    orderCounts: {
      unpaid: 0,
      unshipped: 0,
      delivered: 0,
      completed: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkLoginStatus();
    if (app.globalData.token) {
      this.fetchOrderCounts();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      app.globalData.token = token;
      this.fetchUserInfo();
    } else {
      this.setData({
        userInfo: {},
        hasUserInfo: false
      });
    }
  },

  // 获取用户信息
  fetchUserInfo() {
    wx.showLoading({
      title: '加载中',
    });

    userApi.getUserInfo()
      .then(res => {
        if (res.code === 200) {
          this.setData({
            userInfo: res.data,
            hasUserInfo: true
          });
          app.globalData.userInfo = res.data;
        } else {
          wx.showToast({
            title: res.message || '获取用户信息失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取用户信息失败', err);
        // 可能是token失效
        this.handleLogout();
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  // 获取订单数量统计
  fetchOrderCounts() {
    orderApi.getOrderCounts()
      .then(res => {
        if (res.code === 200) {
          this.setData({
            orderCounts: {
              unpaid: res.data.unpaid || 0,
              unshipped: res.data.unshipped || 0,
              delivered: res.data.delivered || 0,
              completed: res.data.completed || 0
            }
          });
        }
      })
      .catch(err => {
        console.error('获取订单统计失败', err);
      });
  },

  // 去登录页
  goLogin() {
    wx.navigateTo({
      url: '/pages/user/login/index'
    });
  },

  // 登出处理
  handleLogout() {
    wx.removeStorageSync('token');
    app.globalData.token = '';
    app.globalData.userInfo = null;
    this.setData({
      userInfo: {},
      hasUserInfo: false
    });
  },

  // 我的订单列表
  goOrderList(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/order/list/index?status=${type}`
    });
  },

  // 查看全部订单
  goAllOrders() {
    wx.navigateTo({
      url: '/pages/order/list/index'
    });
  },

  // 收货地址管理
  goAddress() {
    wx.navigateTo({
      url: '/pages/address/list/index'
    });
  },

  // 优惠券
  goCoupon() {
    wx.navigateTo({
      url: '/pages/coupon/index'
    });
  },

  // 设置
  goSetting() {
    wx.navigateTo({
      url: '/pages/user/setting/index'
    });
  },

  // 收藏夹
  goFavorite() {
    wx.navigateTo({
      url: '/pages/user/favorite/index'
    });
  },

  // 浏览历史
  goHistory() {
    wx.navigateTo({
      url: '/pages/user/history/index'
    });
  },

  // 关于我们
  goAbout() {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  }
})