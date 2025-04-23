// pages/user/setting/index.js
import { showToast, showModal } from '../../../utils/util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    notificationEnabled: true,
    cacheSize: '0KB'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getStorageInfo();
  },

  /**
   * 获取缓存大小
   */
  getStorageInfo: function () {
    wx.getStorageInfo({
      success: (res) => {
        // 将字节转换为合适的单位
        const sizeInKB = res.currentSize;
        let size = '';

        if (sizeInKB < 1024) {
          size = sizeInKB + 'KB';
        } else {
          size = (sizeInKB / 1024).toFixed(2) + 'MB';
        }

        this.setData({
          cacheSize: size
        });
      }
    });
  },

  /**
   * 页面导航
   */
  handleNavigate: function (e) {
    const { path } = e.currentTarget.dataset;
    wx.navigateTo({
      url: path
    });
  },

  /**
   * 切换消息通知设置
   */
  handleNotificationChange: function (e) {
    const value = e.detail.value;
    this.setData({
      notificationEnabled: value
    });

    // 保存设置
    wx.setStorageSync('notificationEnabled', value);

    showToast(value ? '已开启消息通知' : '已关闭消息通知');
  },

  /**
   * 清除缓存
   */
  handleClearCache: function () {
    showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({
            cacheSize: '0KB'
          });
          showToast('缓存已清除');
        }
      }
    });
  },

  /**
   * 退出登录
   */
  handleLogout: function () {
    showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户登录信息
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');

          // 跳转到登录页
          wx.navigateTo({
            url: '/pages/user/login/index'
          });
        }
      }
    });
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

  }
})