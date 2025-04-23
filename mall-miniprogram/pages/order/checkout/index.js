// pages/order/checkout/index.js
// 引入API服务
const cartApi = require('../../../api/cart');
const orderApi = require('../../../api/order');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartItems: [], // 购物车选中的商品列表
    selectedAddress: null, // 选中的收货地址
    goodsAmount: 0, // 商品总金额
    deliveryFee: 0, // 运费
    totalAmount: 0, // 总金额
    remark: '', // 订单备注
    isSubmitting: false // 是否正在提交订单
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取选中的购物车商品
    this.getSelectedCartItems();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时，获取默认收货地址
    this.getDefaultAddress();
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

  /**
   * 获取购物车选中的商品
   */
  getSelectedCartItems: function () {
    wx.showLoading({
      title: '加载中',
    });

    cartApi.getSelectedCartItems()
      .then(res => {
        if (res.code === 200) {
          const cartItems = res.data || [];

          // 计算商品总金额
          let goodsAmount = 0;
          cartItems.forEach(item => {
            goodsAmount += item.goods_info.price * item.quantity;
          });

          // 计算运费，这里简单处理：商品总额满99包邮，否则运费10元
          const deliveryFee = goodsAmount >= 99 ? 0 : 10;

          // 计算总金额
          const totalAmount = goodsAmount + deliveryFee;

          this.setData({
            cartItems,
            goodsAmount,
            deliveryFee,
            totalAmount
          });
        } else {
          wx.showToast({
            title: res.message || '获取购物车商品失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取购物车商品失败', err);
        wx.showToast({
          title: '获取购物车商品失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 获取默认收货地址
   */
  getDefaultAddress: function () {
    // 如果已经有选中的地址，不再获取默认地址
    if (this.data.selectedAddress) {
      return;
    }

    wx.showLoading({
      title: '加载中',
    });

    // 调用获取默认地址的接口
    cartApi.getDefaultAddress()
      .then(res => {
        if (res.code === 200 && res.data) {
          this.setData({
            selectedAddress: res.data
          });
        }
      })
      .catch(err => {
        console.error('获取默认地址失败', err);
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 跳转到地址选择页面
   */
  chooseAddress: function () {
    wx.navigateTo({
      url: '/pages/address/list/index?from=checkout&selectedId=' + (this.data.selectedAddress ? this.data.selectedAddress.id : '')
    });
  },

  /**
   * 处理备注输入
   */
  handleRemarkInput: function (e) {
    this.setData({
      remark: e.detail.value
    });
  },

  /**
   * 提交订单
   */
  submitOrder: function () {
    if (this.data.isSubmitting) {
      return;
    }

    if (!this.data.selectedAddress) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      });
      return;
    }

    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }

    this.setData({
      isSubmitting: true
    });

    wx.showLoading({
      title: '提交中',
    });

    // 构建订单数据
    const orderData = {
      address_id: this.data.selectedAddress.id,
      goods_amount: this.data.goodsAmount,
      delivery_fee: this.data.deliveryFee,
      total_amount: this.data.totalAmount,
      remark: this.data.remark,
      cart_ids: this.data.cartItems.map(item => item.id)
    };

    // 调用创建订单接口
    orderApi.createOrder(orderData)
      .then(res => {
        if (res.code === 200) {
          wx.hideLoading();

          // 创建订单成功，跳转到订单详情页
          wx.showToast({
            title: '订单提交成功',
            icon: 'success'
          });

          setTimeout(() => {
            // 跳转到订单详情页
            wx.redirectTo({
              url: `/pages/order/detail/index?id=${res.data.id}`
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.message || '提交订单失败',
            icon: 'none'
          });
          this.setData({
            isSubmitting: false
          });
        }
      })
      .catch(err => {
        console.error('提交订单失败', err);
        wx.showToast({
          title: '提交订单失败',
          icon: 'none'
        });
        this.setData({
          isSubmitting: false
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  }
});