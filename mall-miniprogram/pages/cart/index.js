// pages/cart/index.js
const app = getApp();
const cartApi = require('../../api/cart');
const util = require('../../utils/util');

// 添加防抖函数
function debounce(fn, delay = 500) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

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
    loadingStatus: false,
    isSubmitting: false,  // 是否正在提交数据（防止重复点击）
    refreshing: false,    // 是否正在刷新
    cartItemStates: {},   // 各购物车项状态：normal、loading、error
    invalidGoods: []      // 失效商品列表（已下架或库存不足）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化防抖函数
    this.debouncedQuantityChange = debounce(this.updateItemQuantity, 500);
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
      this.setData({ refreshing: true });
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
      loadingStatus: false,
      refreshing: false
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
          // 处理返回的购物车列表，检查商品状态
          const cartList = res.data.cartList || [];
          const invalidGoods = []; // 记录无效商品（下架或库存不足）

          // 初始化购物车项状态
          const cartItemStates = {};
          cartList.forEach(item => {
            // 检查商品状态
            if (!item.goodsInfo ||
              item.goodsInfo.stock <= 0 ||
              (item.goodsInfo.status !== undefined && item.goodsInfo.status !== 1)) {
              invalidGoods.push(item.id);
              cartItemStates[item.id] = 'error';
            } else if (item.count > item.goodsInfo.stock) {
              // 如果购买数量超过库存，自动调整数量
              item.count = item.goodsInfo.stock;
              cartItemStates[item.id] = 'warning';
            } else {
              cartItemStates[item.id] = 'normal';
            }
          });

          this.setData({
            cartList: cartList,
            totalPrice: res.data.totalPrice || 0,
            totalCount: res.data.totalCount || 0,
            checkedTotalPrice: res.data.checkedTotalPrice || 0,
            checkedTotalCount: res.data.checkedTotalCount || 0,
            checkedAll: cartList.length > 0 && !cartList.some(item => !item.selected),
            cartItemStates: cartItemStates,
            invalidGoods: invalidGoods
          });

          console.log('购物车数据已加载, 数量:', this.data.cartList.length);
          console.log('无效商品数量:', invalidGoods.length);

          // 如果有无效商品，提示用户
          if (invalidGoods.length > 0) {
            wx.showToast({
              title: '部分商品已失效，请重新选择',
              icon: 'none',
              duration: 2000
            });
          }
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
      })
      .finally(() => {
        this.setData({
          loadingStatus: false,
          refreshing: false
        });
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

    // 检查商品是否有效
    if (this.data.invalidGoods.includes(id)) {
      util.showToast('该商品已失效，请删除');
      return;
    }

    // 设置该项为加载状态
    let cartItemStates = this.data.cartItemStates;
    cartItemStates[id] = 'loading';
    this.setData({ cartItemStates });

    cartApi.updateCart({
      id: id,
      selected: !selected
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 处理返回数据
        const cartList = res.data.cartList || [];
        // 更新状态
        cartItemStates[id] = 'normal';

        this.setData({
          cartList: cartList,
          totalPrice: res.data.totalPrice || 0,
          totalCount: res.data.totalCount || 0,
          checkedTotalPrice: res.data.checkedTotalPrice || 0,
          checkedTotalCount: res.data.checkedTotalCount || 0,
          checkedAll: cartList.length > 0 && !cartList.some(item => !item.selected),
          cartItemStates: cartItemStates
        });
      } else if (res.code === 401) {
        this.handleAuthError();
      } else {
        // 恢复状态
        cartItemStates[id] = 'normal';
        this.setData({ cartItemStates });
        util.showToast(res.message || '操作失败');
      }
    }).catch(err => {
      console.error('切换选中状态失败:', err);
      // 恢复状态
      cartItemStates[id] = 'normal';
      this.setData({ cartItemStates });
      util.showToast('网络异常，请稍后再试');
    });
  },

  /**
   * 切换全选状态
   */
  onToggleAll: function (e) {
    const isSelectAll = !this.data.checkedAll;

    // 设置所有正常商品为加载状态
    let cartItemStates = this.data.cartItemStates;
    this.data.cartList.forEach(item => {
      if (!this.data.invalidGoods.includes(item.id)) {
        cartItemStates[item.id] = 'loading';
      }
    });
    this.setData({ cartItemStates });

    cartApi.checkCart({
      isSelectAll: isSelectAll
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 重置所有商品状态
        const cartList = res.data.cartList || [];
        cartList.forEach(item => {
          cartItemStates[item.id] = this.data.invalidGoods.includes(item.id) ? 'error' : 'normal';
        });

        this.setData({
          cartList: cartList,
          totalPrice: res.data.totalPrice || 0,
          totalCount: res.data.totalCount || 0,
          checkedTotalPrice: res.data.checkedTotalPrice || 0,
          checkedTotalCount: res.data.checkedTotalCount || 0,
          checkedAll: isSelectAll,
          cartItemStates: cartItemStates
        });
      } else {
        // 恢复所有商品状态
        this.data.cartList.forEach(item => {
          cartItemStates[item.id] = this.data.invalidGoods.includes(item.id) ? 'error' : 'normal';
        });
        this.setData({ cartItemStates });
        util.showToast(res.message || '操作失败');
      }
    }).catch(err => {
      console.error('切换全选状态失败:', err);
      // 恢复所有商品状态
      this.data.cartList.forEach(item => {
        cartItemStates[item.id] = this.data.invalidGoods.includes(item.id) ? 'error' : 'normal';
      });
      this.setData({ cartItemStates });
      util.showToast('网络异常，请稍后再试');
    });
  },

  /**
   * 修改商品数量UI响应函数
   */
  onChangeQuantity: function (e) {
    const { id } = e.currentTarget.dataset;
    const quantity = e.detail;

    // 查找商品信息
    const cartItem = this.data.cartList.find(item => item.id === id);
    if (!cartItem || !cartItem.goodsInfo) return;

    // 检查库存限制
    if (quantity > cartItem.goodsInfo.stock) {
      util.showToast(`库存不足，最多可购买${cartItem.goodsInfo.stock}件`);
      // 回退到最大库存数
      setTimeout(() => {
        let cartList = this.data.cartList;
        const index = cartList.findIndex(item => item.id === id);
        if (index !== -1) {
          cartList[index].count = cartItem.goodsInfo.stock;
          this.setData({ cartList });
        }
      }, 100);
      return;
    }

    // 设置该项为加载状态
    let cartItemStates = this.data.cartItemStates;
    cartItemStates[id] = 'loading';
    this.setData({ cartItemStates });

    // 使用防抖函数
    this.debouncedQuantityChange(id, quantity);
  },

  /**
   * 实际更新商品数量的函数
   */
  updateItemQuantity: function (id, quantity) {
    cartApi.updateCart({
      id: id,
      count: quantity
    }).then(res => {
      if (res.code === 200 && res.data) {
        // 更新购物车数据
        let cartItemStates = this.data.cartItemStates;
        cartItemStates[id] = 'normal';

        this.setData({
          cartList: res.data.cartList || [],
          totalPrice: res.data.totalPrice || 0,
          totalCount: res.data.totalCount || 0,
          checkedTotalPrice: res.data.checkedTotalPrice || 0,
          checkedTotalCount: res.data.checkedTotalCount || 0,
          cartItemStates: cartItemStates
        });
      } else {
        // 恢复状态
        let cartItemStates = this.data.cartItemStates;
        cartItemStates[id] = 'normal';
        this.setData({ cartItemStates });

        util.showToast(res.message || '修改数量失败');
        // 回滚数据 - 需要重新获取购物车
        this.getCartList();
      }
    }).catch(err => {
      console.error('修改商品数量失败:', err);
      // 恢复状态
      let cartItemStates = this.data.cartItemStates;
      cartItemStates[id] = 'normal';
      this.setData({ cartItemStates });

      util.showToast('网络异常，请稍后再试');
      // 回滚数据
      this.getCartList();
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
          // 设置删除中状态
          let cartItemStates = this.data.cartItemStates;
          cartItemStates[id] = 'loading';
          this.setData({ cartItemStates });

          cartApi.deleteCart({
            ids: [id]
          }).then(res => {
            if (res.code === 200 && res.data) {
              util.showToast('删除成功', 'success');

              // 更新购物车数据和状态
              const cartList = res.data.cartList || [];
              // 更新无效商品列表
              const invalidGoods = this.data.invalidGoods.filter(itemId => itemId !== id);

              this.setData({
                cartList: cartList,
                totalPrice: res.data.totalPrice || 0,
                totalCount: res.data.totalCount || 0,
                checkedTotalPrice: res.data.checkedTotalPrice || 0,
                checkedTotalCount: res.data.checkedTotalCount || 0,
                checkedAll: cartList.length > 0 && !cartList.some(item => !item.selected),
                invalidGoods: invalidGoods
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
          // 设置所有选中项为加载状态
          let cartItemStates = this.data.cartItemStates;
          selectedItems.forEach(id => {
            cartItemStates[id] = 'loading';
          });
          this.setData({ cartItemStates });

          cartApi.deleteCart({
            ids: selectedItems
          }).then(res => {
            if (res.code === 200 && res.data) {
              util.showToast('删除成功', 'success');

              // 更新购物车数据
              const cartList = res.data.cartList || [];
              // 更新无效商品列表
              const invalidGoods = this.data.invalidGoods.filter(id => !selectedItems.includes(id));

              this.setData({
                cartList: cartList,
                totalPrice: res.data.totalPrice || 0,
                totalCount: res.data.totalCount || 0,
                checkedTotalPrice: res.data.checkedTotalPrice || 0,
                checkedTotalCount: res.data.checkedTotalCount || 0,
                checkedAll: cartList.length > 0 && !cartList.some(item => !item.selected),
                invalidGoods: invalidGoods
              });
            } else {
              util.showToast(res.message || '删除失败');
              // 恢复状态
              selectedItems.forEach(id => {
                if (cartItemStates[id]) cartItemStates[id] = 'normal';
              });
              this.setData({ cartItemStates });
            }
          }).catch(err => {
            console.error('删除选中商品失败:', err);
            util.showToast('网络异常，请稍后再试');
            // 恢复状态
            selectedItems.forEach(id => {
              if (cartItemStates[id]) cartItemStates[id] = 'normal';
            });
            this.setData({ cartItemStates });
          });
        }
      }
    });
  },

  /**
   * 删除失效商品
   */
  deleteInvalidGoods: function () {
    if (this.data.invalidGoods.length === 0) {
      util.showToast('没有失效商品');
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要清除所有失效商品吗？',
      success: (res) => {
        if (res.confirm) {
          // 设置所有失效项为加载状态
          let cartItemStates = this.data.cartItemStates;
          this.data.invalidGoods.forEach(id => {
            cartItemStates[id] = 'loading';
          });
          this.setData({ cartItemStates });

          cartApi.deleteCart({
            ids: this.data.invalidGoods
          }).then(res => {
            if (res.code === 200 && res.data) {
              util.showToast('清除成功', 'success');

              this.setData({
                cartList: res.data.cartList || [],
                totalPrice: res.data.totalPrice || 0,
                totalCount: res.data.totalCount || 0,
                checkedTotalPrice: res.data.checkedTotalPrice || 0,
                checkedTotalCount: res.data.checkedTotalCount || 0,
                checkedAll: res.data.cartList && res.data.cartList.length > 0 && !res.data.cartList.some(item => !item.selected),
                invalidGoods: []
              });
            } else {
              util.showToast(res.message || '清除失败');
            }
          }).catch(err => {
            console.error('清除失效商品失败:', err);
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
    if (this.data.isSubmitting) return; // 防止重复点击

    if (this.data.checkedTotalCount === 0) {
      util.showToast('请选择商品');
      return;
    }

    // 检查是否选中了失效商品
    const selectedItems = this.data.cartList.filter(item => item.selected).map(item => item.id);
    const hasInvalidSelected = selectedItems.some(id => this.data.invalidGoods.includes(id));

    if (hasInvalidSelected) {
      util.showToast('包含失效商品，请重新选择');
      return;
    }

    this.setData({ isSubmitting: true });

    // 跳转到订单确认页面
    wx.navigateTo({
      url: '/pages/order/checkout/index',
      complete: () => {
        // 无论成功失败，都重置状态
        setTimeout(() => {
          this.setData({ isSubmitting: false });
        }, 1000);
      }
    });
  },

  /**
   * 去购物
   */
  goShopping: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 图片加载错误
   */
  onImageError: function (e) {
    console.log('图片加载失败:', e);
    // 获取当前加载失败的商品索引
    const index = e.currentTarget.dataset.index;
    // 设置默认图片
    let cartList = this.data.cartList;
    if (cartList[index] && cartList[index].goodsInfo) {
      cartList[index].goodsInfo.main_image = '/assets/images/placeholder.png';
      this.setData({
        cartList: cartList
      });
    }
  }
})