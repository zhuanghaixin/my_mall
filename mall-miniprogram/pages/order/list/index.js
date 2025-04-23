// pages/order/list/index.js
// 引入订单API服务
const orderApi = require('../../../api/order');
const util = require('../../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 'all', // all, unpaid, unshipped, unreceived, completed
    orderList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 根据参数设置当前标签
    if (options.type) {
      this.setData({
        activeTab: options.type
      });
    }
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
    // 重置分页并加载数据
    this.setData({
      page: 1,
      hasMore: true,
      orderList: []
    }, () => {
      this.loadOrderList();
    });
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
   * 切换标签
   */
  switchTab: function (e) {
    const type = e.currentTarget.dataset.type;

    if (type === this.data.activeTab) {
      return;
    }

    this.setData({
      activeTab: type,
      page: 1,
      hasMore: true,
      orderList: []
    }, () => {
      this.loadOrderList();
    });
  },

  /**
   * 加载订单列表
   */
  loadOrderList: function () {
    if (this.data.isLoading || !this.data.hasMore) {
      return;
    }

    this.setData({
      isLoading: true
    });

    // 构建查询参数
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize
    };

    // 根据当前标签设置订单状态
    if (this.data.activeTab !== 'all') {
      params.status = this.data.activeTab;
    }

    wx.showLoading({
      title: '加载中',
    });

    orderApi.getOrderList(params)
      .then(res => {
        if (res.code === 200) {
          const newList = res.data.list || [];

          // 转换订单状态文本
          newList.forEach(item => {
            item.status_text = this.getStatusText(item.status);
          });

          // 追加新数据
          const orderList = this.data.page === 1 ? newList : this.data.orderList.concat(newList);

          this.setData({
            orderList: orderList,
            hasMore: newList.length === this.data.pageSize,
            page: this.data.page + 1
          });
        } else {
          wx.showToast({
            title: res.message || '获取订单列表失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取订单列表失败', err);
        wx.showToast({
          title: '获取订单列表失败',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({
          isLoading: false
        });
        wx.hideLoading();
      });
  },

  /**
   * 获取订单状态文本
   */
  getStatusText: function (status) {
    const statusMap = {
      'unpaid': '待付款',
      'unshipped': '待发货',
      'unreceived': '待收货',
      'completed': '已完成',
      'canceled': '已取消',
      'refunding': '退款中',
      'refunded': '已退款'
    };
    return statusMap[status] || '未知状态';
  },

  /**
   * 前往订单详情
   */
  goOrderDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/index?id=${id}`,
    });
  },

  /**
   * 取消订单
   */
  cancelOrder: function (e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          orderApi.cancelOrder(id)
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '订单已取消',
                });
                // 刷新订单列表
                this.setData({
                  page: 1,
                  hasMore: true,
                  orderList: []
                }, () => {
                  this.loadOrderList();
                });
              } else {
                wx.showToast({
                  title: res.message || '取消订单失败',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              console.error('取消订单失败', err);
              wx.showToast({
                title: '取消订单失败',
                icon: 'none'
              });
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      }
    });
  },

  /**
   * 支付订单
   */
  payOrder: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '暂未实现支付功能',
      icon: 'none'
    });
  },

  /**
   * 确认收货
   */
  confirmOrder: function (e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确认已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          orderApi.confirmOrder(id)
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '已确认收货',
                });
                // 刷新订单列表
                this.setData({
                  page: 1,
                  hasMore: true,
                  orderList: []
                }, () => {
                  this.loadOrderList();
                });
              } else {
                wx.showToast({
                  title: res.message || '确认收货失败',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              console.error('确认收货失败', err);
              wx.showToast({
                title: '确认收货失败',
                icon: 'none'
              });
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      }
    });
  },

  /**
   * 删除订单
   */
  deleteOrder: function (e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定要删除该订单吗？删除后不可恢复',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          orderApi.deleteOrder(id)
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '订单已删除',
                });
                // 刷新订单列表
                this.setData({
                  page: 1,
                  hasMore: true,
                  orderList: []
                }, () => {
                  this.loadOrderList();
                });
              } else {
                wx.showToast({
                  title: res.message || '删除订单失败',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              console.error('删除订单失败', err);
              wx.showToast({
                title: '删除订单失败',
                icon: 'none'
              });
            })
            .finally(() => {
              wx.hideLoading();
            });
        }
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      hasMore: true,
      orderList: []
    }, () => {
      this.loadOrderList();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.loadOrderList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})