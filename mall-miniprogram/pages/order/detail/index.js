// pages/order/detail/index.js
// 引入订单API服务
const orderApi = require('../../../api/order');
const util = require('../../../utils/util');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    order: null,
    statusDesc: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      });
      this.loadOrderDetail();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 加载订单详情
   */
  loadOrderDetail: function () {
    wx.showLoading({
      title: '加载中',
    });

    orderApi.getOrderDetail(this.data.orderId)
      .then(res => {
        if (res.code === 200 && res.data) {
          // 设置状态文本
          res.data.status_text = this.getStatusText(res.data.status);

          // 设置状态描述
          const statusDesc = this.getStatusDesc(res.data);

          // 数据映射处理 - 将orderGoods映射到goods属性
          const orderData = res.data;
          if (orderData.orderGoods && orderData.orderGoods.length > 0) {
            // 将orderGoods字段映射到goods字段，以便页面渲染
            orderData.goods = orderData.orderGoods.map(item => {
              return {
                id: item.id,
                name: item.goods_name,
                image: item.goods_image,
                price: item.price,
                quantity: item.quantity,
                specs: item.specs || ''
              };
            });
          }

          this.setData({
            order: orderData,
            statusDesc: statusDesc
          });
        } else {
          wx.showToast({
            title: res.message || '获取订单详情失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('获取订单详情失败', err);
        wx.showToast({
          title: '获取订单详情失败',
          icon: 'none'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 获取订单状态文本
   */
  getStatusText: function (status) {
    // 支持状态码为数字的情况
    const statusCode = typeof status === 'number' ? status : status;

    // 数字状态码映射
    const numberStatusMap = {
      0: '待付款',
      1: '待发货',
      2: '待收货',
      3: '已完成',
      4: '已取消'
    };

    // 字符串状态码映射
    const stringStatusMap = {
      'unpaid': '待付款',
      'unshipped': '待发货',
      'unreceived': '待收货',
      'completed': '已完成',
      'canceled': '已取消',
      'refunding': '退款中',
      'refunded': '已退款'
    };

    // 先尝试用数字状态码映射，再尝试用字符串状态码映射
    return numberStatusMap[statusCode] || stringStatusMap[status] || '未知状态';
  },

  /**
   * 获取状态描述文本
   */
  getStatusDesc: function (order) {
    // 支持状态码为数字的情况
    const status = order.status;
    const statusCode = typeof status === 'number' ? status : status;

    // 数字状态码
    if (typeof statusCode === 'number') {
      switch (statusCode) {
        case 0:
          return '请在24小时内完成付款，超时订单将自动取消';
        case 1:
          return '商家正在处理您的订单，请耐心等待';
        case 2:
          return '商家已发货，请注意查收';
        case 3:
          return '订单已完成，感谢您的购买';
        case 4:
          return '订单已取消';
        default:
          return '';
      }
    }

    // 字符串状态码
    switch (status) {
      case 'unpaid':
        return '请在24小时内完成付款，超时订单将自动取消';
      case 'unshipped':
        return '商家正在处理您的订单，请耐心等待';
      case 'unreceived':
        return '商家已发货，请注意查收';
      case 'completed':
        return '订单已完成，感谢您的购买';
      case 'canceled':
        return '订单已取消';
      case 'refunding':
        return '退款申请正在处理中';
      case 'refunded':
        return '退款已完成';
      default:
        return '';
    }
  },

  /**
   * 复制订单号
   */
  copyOrderNo: function () {
    wx.setClipboardData({
      data: this.data.order.order_no,
      success: () => {
        wx.showToast({
          title: '订单号已复制',
        });
      }
    });
  },

  /**
   * 复制物流单号
   */
  copyLogisticsNo: function () {
    wx.setClipboardData({
      data: this.data.order.logistics_no,
      success: () => {
        wx.showToast({
          title: '物流单号已复制',
        });
      }
    });
  },

  /**
   * 取消订单
   */
  cancelOrder: function () {
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          orderApi.cancelOrder(this.data.orderId)
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '订单已取消',
                });
                // 重新加载订单详情
                setTimeout(() => {
                  this.loadOrderDetail();
                }, 1500);
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
  payOrder: function () {
    // 获取订单ID和订单号
    const orderId = this.data.orderId;
    const orderNo = this.data.order.order_no;

    if (!orderId || !orderNo) {
      wx.showToast({
        title: '订单信息不完整',
        icon: 'none'
      });
      return;
    }

    // 跳转到支付页面
    wx.navigateTo({
      url: `/pages/order/pay/index?order_id=${orderId}&order_no=${orderNo}`,
    });
  },

  /**
   * 查看物流
   */
  checkLogistics: function () {
    wx.showToast({
      title: '暂未实现物流查询功能',
      icon: 'none'
    });
  },

  /**
   * 确认收货
   */
  confirmOrder: function () {
    wx.showModal({
      title: '提示',
      content: '确认已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          orderApi.confirmOrder(this.data.orderId)
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '已确认收货',
                });
                // 重新加载订单详情
                setTimeout(() => {
                  this.loadOrderDetail();
                }, 1500);
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
  deleteOrder: function () {
    wx.showModal({
      title: '提示',
      content: '确定要删除该订单吗？删除后不可恢复',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          });

          orderApi.deleteOrder(this.data.orderId)
            .then(res => {
              if (res.code === 200) {
                wx.showToast({
                  title: '订单已删除',
                });
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
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
   * 联系客服
   */
  contactService: function () {
    wx.showToast({
      title: '暂未实现客服功能',
      icon: 'none'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 如果订单ID存在，重新加载订单信息
    if (this.data.orderId) {
      this.loadOrderDetail();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.orderId) {
      this.loadOrderDetail();
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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