// pages/about/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resourceStatus: [],
    apiBaseUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const app = getApp();
    // 获取API基础URL
    const apiBaseUrl = require('../../config/api.js').BaseUrl;
    this.setData({
      apiBaseUrl
    });

    // 测试各类静态资源
    this.checkResources();
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

  },

  // 检查资源是否可访问
  checkResources: function () {
    const resourceList = [
      { name: 'HomeIcon', url: '/assets/icons/home.png', status: '检查中...' },
      { name: 'CategoryIcon', url: '/assets/icons/category.png', status: '检查中...' },
      { name: 'CartIcon', url: '/assets/icons/cart.png', status: '检查中...' },
      { name: 'UserIcon', url: '/assets/icons/user.png', status: '检查中...' },
      { name: 'API测试', url: this.data.apiBaseUrl + '/home/banner', status: '检查中...' }
    ];

    this.setData({
      resourceStatus: resourceList
    });

    // 测试每个资源
    resourceList.forEach((resource, index) => {
      if (resource.name === 'API测试') {
        // 测试API接口
        wx.request({
          url: resource.url,
          success: () => {
            this.updateResourceStatus(index, '可访问 ✓');
          },
          fail: (error) => {
            this.updateResourceStatus(index, '不可访问 ✗: ' + error.errMsg);
          }
        });
      } else {
        // 测试图片资源
        wx.getImageInfo({
          src: resource.url,
          success: () => {
            this.updateResourceStatus(index, '可访问 ✓');
          },
          fail: (error) => {
            this.updateResourceStatus(index, '不可访问 ✗: ' + error.errMsg);
          }
        });
      }
    });
  },

  // 更新资源状态
  updateResourceStatus: function (index, status) {
    const resourceStatus = this.data.resourceStatus;
    resourceStatus[index].status = status;
    this.setData({
      resourceStatus
    });
  },

  // 重新检查
  recheck: function () {
    this.checkResources();
  }
})