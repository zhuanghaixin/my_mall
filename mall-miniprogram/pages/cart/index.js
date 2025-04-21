// pages/cart/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartList: [
      {
        id: 1,
        title: '商品1',
        price: 99.99,
        quantity: 1,
        image: 'https://img.yzcdn.cn/vant/apple-1.jpg',
        checked: true
      },
      {
        id: 2,
        title: '商品2',
        price: 199.99,
        quantity: 2,
        image: 'https://img.yzcdn.cn/vant/apple-2.jpg',
        checked: true
      }
    ],
    checkedAll: true,
    totalPrice: 499.97,
    totalItems: 3
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.calculateTotal();
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
    // 每次显示页面时更新购物车数据
    this.calculateTotal();
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

  calculateTotal: function () {
    let totalPrice = 0;
    let totalItems = 0;
    let checkedAll = true;

    this.data.cartList.forEach(item => {
      if (item.checked) {
        totalPrice += item.price * item.quantity;
        totalItems += item.quantity;
      } else {
        checkedAll = false;
      }
    });

    if (this.data.cartList.length === 0) {
      checkedAll = false;
    }

    this.setData({
      totalPrice: totalPrice.toFixed(2),
      totalItems,
      checkedAll
    });
  },

  onChangeQuantity: function (event) {
    const quantity = event.detail;
    const id = event.currentTarget.dataset.id;

    const cartList = this.data.cartList.map(item => {
      if (item.id === id) {
        return { ...item, quantity };
      }
      return item;
    });

    this.setData({ cartList }, () => {
      this.calculateTotal();
    });
  },

  onDeleteItem: function (event) {
    const id = event.currentTarget.dataset.id;

    const cartList = this.data.cartList.filter(item => item.id !== id);

    this.setData({ cartList }, () => {
      this.calculateTotal();
    });
  },

  onToggleAll: function (event) {
    const checked = event.detail;

    const cartList = this.data.cartList.map(item => {
      return { ...item, checked };
    });

    this.setData({
      cartList,
      checkedAll: checked
    }, () => {
      this.calculateTotal();
    });
  },

  onSubmit: function () {
    if (this.data.totalItems === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      });
      return;
    }

    const checkedItems = this.data.cartList.filter(item => item.checked);

    // 跳转到订单确认页面
    wx.navigateTo({
      url: '/pages/order/checkout/index'
    });
  },

  goShopping: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})