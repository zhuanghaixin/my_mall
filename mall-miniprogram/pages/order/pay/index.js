const app = getApp();
const api = require('../../../config/api.js');
const orderService = require('../../../api/order.js');
const payService = require('../../../api/pay.js');
import util from '../../../utils/util.js';

Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderId: 0,
        orderNo: '',
        orderInfo: {},
        totalAmount: 0,
        goodsAmount: 0,
        deliveryFee: 10,
        discount: 0,
        orderTime: '',
        countdownMinutes: 30,
        countdownSeconds: 0,
        paymentMethods: [
            {
                id: 'wechat',
                name: '微信支付',
                desc: '推荐使用微信支付',
                icon: '/static/images/pay/wechat.png'
            },
            {
                id: 'balance',
                name: '余额支付',
                desc: '使用账户余额支付',
                icon: '/static/images/pay/balance.png'
            }
        ],
        selectedMethodId: 'wechat',
        timer: null,
        payMethodActive: 'wxpay', // 默认选择微信支付
        paymentLoading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('支付页面接收到的参数:', options);
        if (options.order_id) {
            this.setData({
                orderId: parseInt(options.order_id),
                orderNo: options.order_no || ''
            });
            this.getOrderDetail();
            this.startCountdown();
        } else {
            wx.showToast({
                title: '订单信息不存在',
                icon: 'none',
                duration: 2000,
                complete: () => {
                    setTimeout(() => {
                        wx.navigateBack();
                    }, 2000);
                }
            });
        }
    },

    /**
     * 获取订单详情
     */
    getOrderDetail: function () {
        wx.showLoading({ title: '加载中...' });
        util.request(api.OrderDetail, { order_id: this.data.orderId }, 'GET')
            .then(res => {
                if (res.code === 200 && res.data) {
                    this.setData({
                        orderInfo: res.data,
                        totalAmount: res.data.pay_amount,
                        goodsAmount: res.data.total_amount,
                        deliveryFee: res.data.freight_amount,
                        orderNo: res.data.order_no,
                        orderTime: util.formatTime(new Date(res.data.create_time))
                    });
                } else {
                    util.showErrorToast('获取订单信息失败');
                }
                wx.hideLoading();
            })
            .catch(err => {
                console.error(err);
                wx.hideLoading();
                util.showErrorToast('系统异常，请稍后再试');
            });
    },

    /**
     * 选择支付方式
     */
    selectPayMethod: function (e) {
        const methodId = e.currentTarget.dataset.id;
        this.setData({
            selectedMethodId: methodId
        });
    },

    /**
     * 开始倒计时
     */
    startCountdown: function () {
        // 清除之前的计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }

        // 设置初始时间：30分钟
        let totalSeconds = this.data.countdownMinutes * 60 + this.data.countdownSeconds;

        const timer = setInterval(() => {
            if (totalSeconds <= 0) {
                // 倒计时结束，清除计时器
                clearInterval(timer);

                // 提示用户订单已超时
                this.orderExpired();
                return;
            }

            // 减少1秒
            totalSeconds--;

            // 计算分钟和秒
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            // 更新显示的倒计时
            this.setData({
                countdownMinutes: minutes,
                countdownSeconds: seconds
            });
        }, 1000);

        this.setData({
            timer: timer
        });
    },

    /**
     * 订单超时
     */
    orderExpired: function () {
        util.showErrorToast('支付超时，订单已取消');
        setTimeout(() => {
            wx.navigateBack({
                delta: 1
            });
        }, 1500);
    },

    /**
     * 取消支付
     */
    cancelPay: function () {
        wx.showModal({
            title: '取消支付',
            content: '确定要取消支付吗？',
            success: (res) => {
                if (res.confirm) {
                    // 用户点击确定，返回上一页
                    wx.navigateBack();
                }
            }
        });
    },

    /**
     * 确认支付
     */
    confirmPay: function () {
        const { orderId, orderNo, selectedMethodId } = this.data;

        if (!orderNo) {
            wx.showToast({
                title: '订单号不存在',
                icon: 'none'
            });
            return;
        }

        wx.showLoading({
            title: '支付处理中',
        });

        // 发起支付请求
        if (selectedMethodId === 'wechat') {
            // 微信支付
            payService.getWxPayParams({
                order_no: orderNo
            }).then(res => {
                wx.hideLoading();
                if (res.code === 200) {
                    this.processWxPay(res.data);
                } else {
                    wx.showToast({
                        title: res.message || '支付失败',
                        icon: 'none'
                    });
                }
            }).catch(err => {
                wx.hideLoading();
                console.error('获取支付参数失败', err);
                wx.showToast({
                    title: '网络异常，请重试',
                    icon: 'none'
                });
            });
        } else {
            // 余额支付或其他支付方式（模拟支付）
            payService.mockPay({
                order_no: orderNo,
                status: true
            }).then(res => {
                wx.hideLoading();
                if (res.code === 200) {
                    wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 1500,
                        success: () => {
                            setTimeout(() => {
                                wx.redirectTo({
                                    url: '/pages/order/result/index?order_id=' + orderId + '&status=success'
                                });
                            }, 1500);
                        }
                    });
                } else {
                    wx.showToast({
                        title: res.message || '支付失败',
                        icon: 'none'
                    });
                }
            }).catch(err => {
                wx.hideLoading();
                console.error('支付失败', err);
                wx.showToast({
                    title: '网络异常，请重试',
                    icon: 'none'
                });
            });
        }
    },

    /**
     * 处理微信支付
     */
    processWxPay: function (payParams) {
        wx.requestPayment({
            timeStamp: payParams.timeStamp,
            nonceStr: payParams.nonceStr,
            package: payParams.package,
            signType: payParams.signType,
            paySign: payParams.paySign,
            success: (res) => {
                console.log('支付成功', res);
                wx.redirectTo({
                    url: '/pages/order/result/index?order_id=' + this.data.orderId + '&status=success'
                });
            },
            fail: (err) => {
                console.error('支付失败', err);
                // 如果用户取消支付，不作任何处理
                if (err.errMsg !== 'requestPayment:fail cancel') {
                    wx.showToast({
                        title: '支付失败',
                        icon: 'none'
                    });
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        // 页面卸载时清除计时器
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
    }
}); 