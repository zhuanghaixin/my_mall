// pages/cart/index.js
const app = getApp();

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
        // 可以在这里添加验证token的逻辑
      }
      this.getCartList();
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
   * 获取购物车列表
   */
  getCartList: function () {
    this.setData({ loadingStatus: true });

    // 获取最新的token
    const token = wx.getStorageSync('token') || app.globalData.token;

    wx.request({
      url: `${app.globalData.baseUrl}/api/cart/list`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            cartList: res.data.data.cartList || [],
            totalPrice: res.data.data.totalPrice || 0,
            totalCount: res.data.data.totalCount || 0,
            checkedTotalPrice: res.data.data.checkedTotalPrice || 0,
            checkedTotalCount: res.data.data.checkedTotalCount || 0,
            checkedAll: res.data.data.cartList && res.data.data.cartList.length > 0 && !res.data.data.cartList.some(item => !item.selected)
          });
        } else {
          // 如果是未登录错误，更新登录状态
          if (res.data.code === 401) {
            this.setData({ isLogin: false });
            app.globalData.hasLogin = false;
            wx.removeStorageSync('token');
          } else {
            wx.showToast({
              title: res.data.message || '获取购物车列表失败',
              icon: 'none'
            });
          }
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络异常，请稍后再试',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({ loadingStatus: false });
        wx.stopPullDownRefresh();
      }
    });
  },

  /**
   * 切换商品选中状态
   */
  onToggleItem: function (e) {
    const { id, selected } = e.currentTarget.dataset;
    wx.request({
      url: `${app.globalData.baseUrl}/api/cart/update`,
      method: 'POST',
      header: {
        Authorization: `Bearer ${app.globalData.token}`
      },
      data: {
        id: id,
        selected: !selected
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            cartList: res.data.data.cartList,
            totalPrice: res.data.data.totalPrice,
            totalCount: res.data.data.totalCount,
            checkedTotalPrice: res.data.data.checkedTotalPrice,
            checkedTotalCount: res.data.data.checkedTotalCount,
            checkedAll: this.data.cartList.length > 0 && !this.data.cartList.some(item => !item.selected)
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 切换全选状态
   */
  onToggleAll: function (e) {
    const isSelectAll = !this.data.checkedAll;
    wx.request({
      url: `${app.globalData.baseUrl}/api/cart/check`,
      method: 'POST',
      header: {
        Authorization: `Bearer ${app.globalData.token}`
      },
      data: {
        isSelectAll: isSelectAll
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            cartList: res.data.data.cartList,
            totalPrice: res.data.data.totalPrice,
            totalCount: res.data.data.totalCount,
            checkedTotalPrice: res.data.data.checkedTotalPrice,
            checkedTotalCount: res.data.data.checkedTotalCount,
            checkedAll: isSelectAll
          });
        } else {
          wx.showToast({
            title: res.data.message || '操作失败',
            icon: 'none'
          });
        }
      }
    });
  },

  /**
   * 修改商品数量
   */
  onChangeQuantity: function (e) {
    const { id } = e.currentTarget.dataset;
    const quantity = e.detail;

    wx.request({
      url: `${app.globalData.baseUrl}/api/cart/update`,
      method: 'POST',
      header: {
        Authorization: `Bearer ${app.globalData.token}`
      },
      data: {
        id: id,
        count: quantity
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            cartList: res.data.data.cartList,
            totalPrice: res.data.data.totalPrice,
            totalCount: res.data.data.totalCount,
            checkedTotalPrice: res.data.data.checkedTotalPrice,
            checkedTotalCount: res.data.data.checkedTotalCount
          });
        } else {
          wx.showToast({
            title: res.data.message || '修改数量失败',
            icon: 'none'
          });
        }
      }
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
          wx.request({
            url: `${app.globalData.baseUrl}/api/cart/delete`,
            method: 'POST',
            header: {
              Authorization: `Bearer ${app.globalData.token}`
            },
            data: {
              ids: [id]
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.setData({
                  cartList: res.data.data.cartList,
                  totalPrice: res.data.data.totalPrice,
                  totalCount: res.data.data.totalCount,
                  checkedTotalPrice: res.data.data.checkedTotalPrice,
                  checkedTotalCount: res.data.data.checkedTotalCount,
                  checkedAll: this.data.cartList.length > 0 && !this.data.cartList.some(item => !item.selected)
                });
              } else {
                wx.showToast({
                  title: res.data.message || '删除失败',
                  icon: 'none'
                });
              }
            }
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
      wx.showToast({
        title: '请选择要删除的商品',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要删除选中商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${app.globalData.baseUrl}/api/cart/delete`,
            method: 'POST',
            header: {
              Authorization: `Bearer ${app.globalData.token}`
            },
            data: {
              ids: selectedItems
            },
            success: (res) => {
              if (res.data.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.setData({
                  cartList: res.data.data.cartList,
                  totalPrice: res.data.data.totalPrice,
                  totalCount: res.data.data.totalCount,
                  checkedTotalPrice: res.data.data.checkedTotalPrice,
                  checkedTotalCount: res.data.data.checkedTotalCount,
                  checkedAll: this.data.cartList.length > 0 && !this.data.cartList.some(item => !item.selected)
                });
              } else {
                wx.showToast({
                  title: res.data.message || '删除失败',
                  icon: 'none'
                });
              }
            }
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
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
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