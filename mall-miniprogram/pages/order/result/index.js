/**
 * 订单支付结果页面
 */
const app = getApp();
const orderService = require('../../../api/order.js');
import util from '../../../utils/util';

Page({
    /**
     * 页面的初始数据
     */
    data: {
        orderId: 0,
        status: 'success', // success, fail
        orderInfo: {},
        animationData: {},
        animated: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.orderId && options.status) {
            this.setData({
                orderId: parseInt(options.orderId),
                status: options.status
            });

            if (options.status === 'success') {
                this.getOrderDetail();
                this.startAnimation();
            }
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
     * 获取订单详情
     */
    getOrderDetail: function () {
        const orderId = this.data.orderId;

        wx.showLoading({
            title: '加载中...'
        });

        orderService.getOrderDetail(orderId)
            .then(res => {
                wx.hideLoading();
                if (res.code === 200) {
                    this.setData({
                        orderInfo: res.data
                    });
                } else {
                    wx.showToast({
                        title: res.msg || '获取订单信息失败',
                        icon: 'none'
                    });
                }
            })
            .catch(err => {
                wx.hideLoading();
                wx.showToast({
                    title: '网络异常，请重试',
                    icon: 'none'
                });
                console.error('获取订单详情失败', err);
            });
    },

    /**
     * 开始动画效果
     */
    startAnimation: function () {
        if (this.data.animated) {
            return;
        }

        const animation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease',
        });

        animation.opacity(1).scale(1).step();

        this.setData({
            animationData: animation.export(),
            animated: true
        });
    },

    /**
     * 查看订单详情
     */
    viewOrderDetail: function () {
        wx.redirectTo({
            url: '/pages/order/detail/index?id=' + this.data.orderId
        });
    },

    /**
     * 返回首页
     */
    backToHome: function () {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },

    /**
     * 继续购物
     */
    continueShopping: function () {
        wx.switchTab({
            url: '/pages/category/index'
        });
    },

    /**
     * 重新支付
     */
    repay: function () {
        wx.redirectTo({
            url: '/pages/order/pay/index?orderId=' + this.data.orderId
        });
    }
}) 