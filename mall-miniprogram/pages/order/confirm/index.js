/**
 * 订单确认页面
 */
const addressService = require('../../../api/address.js');
const cartService = require('../../../api/cart.js');
const orderService = require('../../../api/order.js');
import util from '../../../utils/util';

const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        address: null, // 收货地址
        cartList: [], // 购物车商品列表
        totalPrice: 0, // 商品总价
        freightPrice: 10.00, // 运费
        actualPrice: 0, // 实际需要支付的金额
        remark: '', // 订单备注
        submitting: false, // 是否正在提交订单
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取默认收货地址
        this.getDefaultAddress();
        // 获取购物车中选中的商品
        this.getCheckedCartList();
    },

    /**
     * 获取默认收货地址
     */
    getDefaultAddress: function () {
        addressService.getDefaultAddress().then(res => {
            if (res.code === 200 && res.data) {
                this.setData({
                    address: res.data
                });
            }
        }).catch(err => {
            console.error('获取默认地址失败', err);
            wx.showToast({
                title: '获取地址失败',
                icon: 'none'
            });
        });
    },

    /**
     * 获取购物车中选中的商品
     */
    getCheckedCartList: function () {
        cartService.getCheckedCartGoods().then(res => {
            if (res.code === 200) {
                // 接口直接返回选中的商品，无需filter
                const checkedGoods = res.data || [];

                // 计算总价
                let totalPrice = 0;
                checkedGoods.forEach(item => {
                    totalPrice += item.goods.price * item.quantity;
                });

                // 计算实际支付金额
                const actualPrice = totalPrice + this.data.freightPrice;

                this.setData({
                    cartList: checkedGoods,
                    totalPrice: totalPrice.toFixed(2),
                    actualPrice: actualPrice.toFixed(2)
                });
            } else {
                // 如果接口不可用，回退到原方案
                this.getCartListFallback();
            }
        }).catch(err => {
            console.error('获取购物车选中商品失败', err);
            // 如果新API不可用，回退到原方案
            this.getCartListFallback();
        });
    },

    /**
     * 获取购物车商品备用方案
     */
    getCartListFallback: function () {
        cartService.getCartList().then(res => {
            if (res.code === 200) {
                let checkedGoods = [];

                // 安全处理：确保res.data是数组
                if (Array.isArray(res.data)) {
                    checkedGoods = res.data.filter(item => item.selected === 1);
                } else if (res.data && typeof res.data === 'object') {
                    // 如果是对象，尝试获取内部的items或list数组
                    const items = res.data.items || res.data.list || [];
                    if (Array.isArray(items)) {
                        checkedGoods = items.filter(item => item.selected === 1);
                    }
                }

                // 计算总价
                let totalPrice = 0;
                checkedGoods.forEach(item => {
                    totalPrice += item.goods.price * item.quantity;
                });

                // 计算实际支付金额
                const actualPrice = totalPrice + this.data.freightPrice;

                this.setData({
                    cartList: checkedGoods,
                    totalPrice: totalPrice.toFixed(2),
                    actualPrice: actualPrice.toFixed(2)
                });
            } else {
                wx.showToast({
                    title: '获取商品失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            console.error('获取购物车商品失败', err);
            wx.showToast({
                title: '获取商品失败',
                icon: 'none'
            });
        });
    },

    /**
     * 跳转到地址选择页面
     */
    goToAddressSelect: function () {
        wx.navigateTo({
            url: '/pages/address/select/select',
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
        // 如果正在提交订单，则不再重复提交
        if (this.data.submitting) {
            return;
        }

        // 检查是否有收货地址
        if (!this.data.address) {
            wx.showToast({
                title: '请选择收货地址',
                icon: 'none'
            });
            return;
        }

        // 检查是否有商品
        if (this.data.cartList.length === 0) {
            wx.showToast({
                title: '没有选中商品',
                icon: 'none'
            });
            return;
        }

        // 设置为正在提交状态
        this.setData({
            submitting: true
        });

        // 创建订单
        const orderData = {
            address_id: this.data.address.id,
            remark: this.data.remark
        };

        orderService.createOrder(orderData).then(res => {
            if (res.code === 200) {
                // 创建订单成功，跳转到支付页面
                wx.navigateTo({
                    url: `/pages/order/pay/index?order_id=${res.data.order_id}&order_no=${res.data.order_no}`,
                });
            } else {
                wx.showToast({
                    title: res.message || '创建订单失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            console.error('创建订单失败', err);
            wx.showToast({
                title: '创建订单失败',
                icon: 'none'
            });
        }).finally(() => {
            // 恢复提交按钮状态
            this.setData({
                submitting: false
            });
        });
    },

    /**
     * 生命周期函数--监听页面显示
     * 用于页面返回时重新加载数据
     */
    onShow: function () {
        // 从地址选择页面返回时，可能需要刷新地址信息
        const pages = getCurrentPages();
        const currPage = pages[pages.length - 1];

        // 如果有选择的新地址
        if (currPage.data.selectedAddress) {
            this.setData({
                address: currPage.data.selectedAddress
            });
            // 清除选择的地址，避免重复设置
            currPage.setData({
                selectedAddress: null
            });
        }
    }
}); 