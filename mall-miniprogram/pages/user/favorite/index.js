// pages/user/favorite/index.js
const favoriteApi = require('../../../api/favorite.js');
const cartApi = require('../../../api/cart.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    favoriteList: [],
    page: 1,
    limit: 10,
    hasMore: true,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 可以添加必要的初始化逻辑
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
    this.resetData();
    this.fetchFavoriteList();
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
    this.resetData();
    this.fetchFavoriteList().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore) {
      this.fetchFavoriteList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 重置数据
   */
  resetData() {
    this.setData({
      favoriteList: [],
      page: 1,
      hasMore: true,
      isLoading: false
    });
  },

  /**
   * 获取收藏列表
   */
  fetchFavoriteList() {
    if (!this.data.hasMore || this.data.isLoading) return Promise.resolve();

    this.setData({ isLoading: true });

    wx.showLoading({
      title: '加载中',
    });

    return favoriteApi.getFavoriteList({
      page: this.data.page,
      limit: this.data.limit
    }).then(res => {
      wx.hideLoading();

      const newList = this.data.page === 1 ? res.list : this.data.favoriteList.concat(res.list);
      const hasMore = newList.length < res.total;

      this.setData({
        favoriteList: newList,
        hasMore: hasMore,
        page: this.data.page + 1,
        isLoading: false
      });
    }).catch(err => {
      wx.hideLoading();
      this.setData({ isLoading: false });

      wx.showToast({
        title: '获取收藏列表失败',
        icon: 'none'
      });

      console.error('获取收藏列表失败', err);
    });
  },

  /**
   * 取消收藏
   */
  removeFavorite(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要取消收藏该商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          favoriteApi.removeFavorite(id).then(() => {
            wx.hideLoading();

            // 从列表中移除该项
            const newList = this.data.favoriteList.filter(item => item.id !== id);
            this.setData({
              favoriteList: newList
            });

            wx.showToast({
              title: '已取消收藏',
              icon: 'success'
            });
          }).catch(err => {
            wx.hideLoading();

            wx.showToast({
              title: '操作失败',
              icon: 'none'
            });

            console.error('取消收藏失败', err);
          });
        }
      }
    });
  },

  /**
   * 加入购物车
   */
  addToCart(e) {
    const goodsId = e.currentTarget.dataset.id;

    wx.showLoading({
      title: '处理中',
    });

    cartApi.addToCart({
      goods_id: goodsId,
      quantity: 1
    }).then(() => {
      wx.hideLoading();

      wx.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
    }).catch(err => {
      wx.hideLoading();

      wx.showToast({
        title: '加入购物车失败',
        icon: 'none'
      });

      console.error('加入购物车失败', err);
    });
  },

  /**
   * 跳转到商品详情
   */
  goGoodsDetail(e) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/detail/index?id=${goodsId}`
    });
  },

  /**
   * 去逛逛
   */
  goShopping() {
    wx.switchTab({
      url: '/pages/category/index'
    });
  }
})