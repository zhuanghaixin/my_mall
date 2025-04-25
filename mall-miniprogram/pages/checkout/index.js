const orderService = require('../../api/order.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        addressId: null,
        userId: '',
        remark: '',
        submitting: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 从缓存获取用户ID
        const userId = wx.getStorageSync('userId') || '';
        this.setData({
            userId: userId
        });

        // 处理页面参数
        if (options.addressId) {
            this.setData({
                addressId: options.addressId
            });
        }
    },

    /**
     * 选择收货地址
     */
    selectAddress: function () {
        wx.navigateTo({
            url: '/pages/address/list/index?from=checkout'
        });
    },

    /**
     * 设置订单备注
     */
    onRemarkInput: function (e) {
        this.setData({
            remark: e.detail.value
        });
    },

    /**
     * 提交订单
     */
    submitOrder: function () {
        const { addressId, userId, remark } = this.data;

        if (!addressId) {
            wx.showToast({
                title: '请选择收货地址',
                icon: 'none'
            });
            return;
        }

        // 生成客户端订单ID，用于幂等性检查
        const clientOrderId = `${userId}_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;

        wx.showLoading({
            title: '提交订单中...',
            mask: true
        });

        // 禁用按钮防止重复提交
        this.setData({
            submitting: true
        });

        const submitParams = {
            address_id: addressId,
            remark: remark || '',
            client_order_id: clientOrderId // 添加客户端订单ID
        };

        orderService.createOrder(submitParams)
            .then(res => {
                wx.hideLoading();
                if (res.code === 200) {
                    // 跳转到支付页面
                    wx.redirectTo({
                        url: `/pages/order/pay/index?orderId=${res.data.order_id}&orderNo=${res.data.order_no}`
                    });
                } else {
                    this.setData({
                        submitting: false
                    });
                    wx.showToast({
                        title: res.message || '创建订单失败',
                        icon: 'none'
                    });
                }
            })
            .catch(err => {
                wx.hideLoading();
                this.setData({
                    submitting: false
                });
                console.error('创建订单失败', err);
                wx.showToast({
                    title: '网络异常，请重试',
                    icon: 'none'
                });
            });
    }
}); 