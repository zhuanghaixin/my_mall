// pages/cart/index.js
const app = getApp();
const cartApi = require('../../api/cart');
const util = require('../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartList: [],
    totalPrice: 0,
    totalCount: 0,
    checkedTotalPrice: 0,
    checkedTotalCount: 0,
    checkedAll: true,
    isLogin: false,
    isEdit: false,
    loadingStatus: false
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    if (this.data.isLogin) {
      this.getCartList();
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

  },

  /**
   * 去登录
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/user/login/index?redirect=' + encodeURIComponent('/pages/cart/index')
    });
  },

  /**
   * 检查登录状态并更新数据
   */
  checkLoginStatus() {
    // 每次显示页面时检查登录状态并更新购物车数据
    const token = wx.getStorageSync('token');
    const hasLogin = !!token;

    this.setData({
      isLogin: hasLogin
    });

    if (hasLogin) {
      // 确保全局变量中的登录状态正确
      if (!app.globalData.hasLogin) {
        app.globalData.token = token;
        app.globalData.hasLogin = true;
      }
      this.getCartList();
    }
  },

  /**
   * 处理授权错误
   */
  handleAuthError() {
    // 清除本地登录状态
    wx.removeStorageSync('token');
    app.globalData.hasLogin = false;
    app.globalData.token = '';

    this.setData({
      isLogin: false,
      loadingStatus: false
    });

    wx.showModal({
      title: '提示',
      content: '登录已过期，请重新登录',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          this.goToLogin();
        }
      }
    });
  },

  /**
   * 获取购物车列表
   */
  getCartList: function () {
    this.setData({ loadingStatus: true });

    cartApi.getCartList()
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            cartList: res.data.cartList || [],
            totalPrice: res.data.totalPrice || 0,
            totalCount: res.data.totalCount || 0,
            checkedTotalPrice: res.data.checkedTotalPrice || 0,
            checkedTotalCount: res.data.checkedTotalCount || 0,
            checkedAll: res.data.cartList && res.data.cartList.length > 0 && !res.data.cartList.some(item => !item.selected)
          });
        } else {
          // 如果是未登录错误，更新登录状态并引导用户登录
          if (res.code === 401) {
            this.handleAuthError();
          } else {
            util.showToast(res.message || '获取购物车列表失败');
            this.setData({ loadingStatus: false });
          }
        }
      })
      .catch(err => {
        console.error('获取购物车列表失败:', err);
        // 如果是网络错误，可能是服务器问题，给用户友好提示
        util.showToast('获取购物车数据失败，请稍后再试');
        this.setData({ loadingStatus: false });
      })
      .finally(() => {
        wx.stopPullDownRefresh();
      });
  },

  /**
   * 切换商品选中状态
   */
  onToggleItem: function (e) {
    if (!this.data.isLogin) {
      this.handleAuthError();
      return;
    }

    const { id, selected } = e.currentTarget.dataset;

    cartApi.updateCart({
      id: id,
      selected: !selected
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          cartList: res.data.cartList || [],
          totalPrice: res.data.totalPrice || 0,
          totalCount: res.data.totalCount || 0,
          checkedTotalPrice: res.data.checkedTotalPrice || 0,
          checkedTotalCount: res.data.checkedTotalCount || 0,
          checkedAll: res.data.cartList && res.data.cartList.length > 0 && !res.data.cartList.some(item => !item.selected)
        });
      } else if (res.code === 401) {
        this.handleAuthError();
      } else {
        util.showToast(res.message || '操作失败');
      }
    }).catch(err => {
      console.error('切换选中状态失败:', err);
      util.showToast('网络异常，请稍后再试');
    });
  },

  /**
   * 切换全选状态
   */
  onToggleAll: function (e) {
    const isSelectAll = !this.data.checkedAll;

    cartApi.checkCart({
      isSelectAll: isSelectAll
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          cartList: res.data.cartList || [],
          totalPrice: res.data.totalPrice || 0,
          totalCount: res.data.totalCount || 0,
          checkedTotalPrice: res.data.checkedTotalPrice || 0,
          checkedTotalCount: res.data.checkedTotalCount || 0,
          checkedAll: isSelectAll
        });
      } else {
        util.showToast(res.message || '操作失败');
      }
    }).catch(err => {
      console.error('切换全选状态失败:', err);
      util.showToast('网络异常，请稍后再试');
    });
  },

  /**
   * 修改商品数量
   */
  onChangeQuantity: function (e) {
    const { id } = e.currentTarget.dataset;
    const quantity = e.detail;

    cartApi.updateCart({
      id: id,
      count: quantity
    }).then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          cartList: res.data.cartList || [],
          totalPrice: res.data.totalPrice || 0,
          totalCount: res.data.totalCount || 0,
          checkedTotalPrice: res.data.checkedTotalPrice || 0,
          checkedTotalCount: res.data.checkedTotalCount || 0
        });
      } else {
        util.showToast(res.message || '修改数量失败');
      }
    }).catch(err => {
      console.error('修改商品数量失败:', err);
      util.showToast('网络异常，请稍后再试');
    });
  },

  /**
   * 删除购物车商品
   */
  onDeleteItem: function (e) {
    const { id } = e.currentTarget.dataset;

    wx.showModal({
      title: '提示',
      content: '确定要删除此商品吗？',
      success: (res) => {
        if (res.confirm) {
          cartApi.deleteCart({
            ids: [id]
          }).then(res => {
            if (res.code === 200 && res.data) {
              util.showToast('删除成功', 'success');
              this.setData({
                cartList: res.data.cartList || [],
                totalPrice: res.data.totalPrice || 0,
                totalCount: res.data.totalCount || 0,
                checkedTotalPrice: res.data.checkedTotalPrice || 0,
                checkedTotalCount: res.data.checkedTotalCount || 0,
                checkedAll: res.data.cartList && res.data.cartList.length > 0 && !res.data.cartList.some(item => !item.selected)
              });
            } else {
              util.showToast(res.message || '删除失败');
            }
          }).catch(err => {
            console.error('删除商品失败:', err);
            util.showToast('网络异常，请稍后再试');
          });
        }
      }
    });
  },

  /**
   * 管理购物车
   */
  toggleEditMode: function () {
    this.setData({
      isEdit: !this.data.isEdit
    });
  },

  /**
   * 删除选中商品
   */
  deleteSelected: function () {
    const selectedItems = this.data.cartList.filter(item => item.selected).map(item => item.id);

    if (selectedItems.length === 0) {
      util.showToast('请选择要删除的商品');
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要删除选中商品吗？',
      success: (res) => {
        if (res.confirm) {
          cartApi.deleteCart({
            ids: selectedItems
          }).then(res => {
            if (res.code === 200 && res.data) {
              util.showToast('删除成功', 'success');
              this.setData({
                cartList: res.data.cartList || [],
                totalPrice: res.data.totalPrice || 0,
                totalCount: res.data.totalCount || 0,
                checkedTotalPrice: res.data.checkedTotalPrice || 0,
                checkedTotalCount: res.data.checkedTotalCount || 0,
                checkedAll: res.data.cartList && res.data.cartList.length > 0 && !res.data.cartList.some(item => !item.selected)
              });
            } else {
              util.showToast(res.message || '删除失败');
            }
          }).catch(err => {
            console.error('删除选中商品失败:', err);
            util.showToast('网络异常，请稍后再试');
          });
        }
      }
    });
  },

  /**
   * 结算
   */
  onSubmit: function () {
    if (this.data.checkedTotalCount === 0) {
      util.showToast('请选择商品');
      return;
    }

    // 跳转到订单确认页面
    wx.navigateTo({
      url: '/pages/order/checkout/index'
    });
  },

  /**
   * 去购物
   */
  goShopping: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})