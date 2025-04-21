// pages/user/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查是否已登录
    this.checkLogin();
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
    // 每次显示页面时更新登录状态
    this.checkLogin();
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

  checkLogin: function () {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        isLogin: true,
        userInfo: JSON.parse(userInfo)
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: null
      });
    }
  },

  onLogin: function () {
    // 模拟用户登录
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },

  // 模拟登录后回调
  loginCallback: function (userInfo) {
    this.setData({
      isLogin: true,
      userInfo
    });
    wx.setStorageSync('userInfo', JSON.stringify(userInfo));
  }
})