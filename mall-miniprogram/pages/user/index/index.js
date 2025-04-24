// pages/user/index/index.js
const app = getApp();
const userApi = require('../../../api/user');
const orderApi = require('../../../api/order');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    orderCount: {
      unpaid: 0,
      unshipped: 0,
      unreceived: 0
    },
    isLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      });
    }

    this.checkLoginStatus();
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
   * 检查登录状态并获取用户信息
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token');

    if (token) {
      // 先从本地缓存中获取用户信息，避免每次都请求接口
      const cachedUserInfo = wx.getStorageSync('userInfo');

      if (cachedUserInfo) {
        this.setData({
          isLogin: true,
          userInfo: cachedUserInfo
        });
      }

      // 然后再请求最新的用户信息
      this.getUserInfo();
      this.getOrderCount();
    } else {
      this.setData({
        isLogin: false,
        userInfo: null
      });
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    wx.showLoading({
      title: '加载中',
    });

    userApi.getUserInfo()
      .then(res => {
        if (res.code === 200 && res.data) {
          // 保存到本地存储
          wx.setStorageSync('userInfo', res.data);

          this.setData({
            userInfo: res.data
          });
        }
      })
      .catch(err => {
        console.error('获取用户信息失败', err);
        // 如果获取用户信息失败，可能是token过期
        if (err.statusCode === 401) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          this.setData({
            isLogin: false,
            userInfo: null
          });
        }
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 获取订单数量统计
   */
  getOrderCount() {
    orderApi.getOrderCounts()
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            orderCount: res.data
          });
        }
      })
      .catch(err => {
        console.error('获取订单统计失败', err);
      });
  },

  /**
   * 去登录页
   */
  goLogin() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/user/login/index',
      });
    }
  },

  /**
   * 去订单列表
   */
  goOrderList(e) {
    const type = e.currentTarget.dataset.type;
    if (!this.data.isLogin) {
      this.goLogin();
      return;
    }

    wx.navigateTo({
      url: `/pages/order/list/index?type=${type}`,
    });
  },

  /**
   * 去收货地址列表
   */
  goAddressList() {
    if (!this.data.isLogin) {
      this.goLogin();
      return;
    }

    wx.navigateTo({
      url: '/pages/address/list/index',
    });
  },

  /**
   * 去收藏列表
   */
  goFavorites() {
    if (!this.data.isLogin) {
      this.goLogin();
      return;
    }

    wx.navigateTo({
      url: '/pages/user/favorite/index',
    });
  },

  /**
   * 去设置页面
   */
  goSettings() {
    wx.navigateTo({
      url: '/pages/user/setting/index',
    });
  },

  /**
   * 联系客服
   */
  contactService() {
    wx.navigateTo({
      url: '/pages/user/service/index',
    });
  },

  /**
   * 资源测试页面
   */
  goTest() {
    wx.navigateTo({
      url: '/pages/test/index',
    });
  },

  /**
   * 处理退出登录
   */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的token和用户信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');

          // 更新全局状态
          const app = getApp();
          if (app.globalData) {
            app.globalData.userInfo = null;
            app.globalData.isLogin = false;
            app.globalData.token = '';
          }

          // 更新页面状态
          this.setData({
            isLogin: false,
            userInfo: null,
            orderCount: {
              unpaid: 0,
              unshipped: 0,
              unreceived: 0
            }
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    if (this.data.isLogin) {
      Promise.all([
        this.getUserInfo(),
        this.getOrderCount()
      ]).finally(() => {
        wx.stopPullDownRefresh();
      });
    } else {
      wx.stopPullDownRefresh();
    }
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

  }
})