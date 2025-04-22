/**
 * 商品详情页
 */

// 引入API接口
const goodsApi = require('../../../api/goods');
const cartApi = require('../../../api/cart');
const util = require('../../../utils/util');
const cartUtil = require('../../../utils/cart');  // 新增引用购物车工具模块
const Toast = require('../../../miniprogram_npm/@vant/weapp/toast/toast');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        goodsId: 0,          // 商品ID
        goods: null,         // 商品信息
        current: 0,          // 当前轮播图索引
        imageUrls: [],       // 轮播图URL数组
        loading: true,       // 加载状态
        quantity: 1,         // 商品数量
        cartCount: 0,        // 购物车商品数量
        showSku: false,      // 是否显示规格选择
        buyType: 'cart',     // 购买类型：cart-加入购物车，buy-立即购买
        isCollected: false,  // 是否已收藏
        startX: 0,           // 触摸开始位置
        moveX: 0,            // 移动距离
        moveDirection: ''    // 移动方向
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log('[商品详情页] onLoad:', options);
        if (options.id) {
            this.setData({
                goodsId: parseInt(options.id)
            });
            this.loadGoodsDetail();
            this.loadCollectionStatus();
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.log('[商品详情页] onShow');
        // 获取购物车数量
        this.getCartCount();
    },

    /**
     * 监听页面初次渲染完成
     */
    onReady: function () {
        console.log('[商品详情页] onReady');
    },

    /**
     * 监听页面隐藏
     */
    onHide: function () {
        console.log('[商品详情页] onHide');
    },

    /**
     * 监听页面卸载
     */
    onUnload: function () {
        console.log('[商品详情页] onUnload');
    },

    /**
     * 触摸开始事件
     */
    touchStart: function (e) {
        console.log('[商品详情页] touchStart:', e.touches[0].pageX);
        this.setData({
            startX: e.touches[0].pageX
        });
    },

    /**
     * 触摸移动事件
     */
    touchMove: function (e) {
        const moveX = e.touches[0].pageX - this.data.startX;
        const direction = moveX > 0 ? 'right' : 'left';

        console.log('[商品详情页] touchMove:', e.touches[0].pageX, '移动距离:', moveX, '方向:', direction);

        this.setData({
            moveX: moveX,
            moveDirection: direction
        });
    },

    /**
     * 触摸结束事件
     */
    touchEnd: function (e) {
        console.log('[商品详情页] touchEnd, 最终移动:', this.data.moveX, '方向:', this.data.moveDirection);

        // 如果右滑距离超过100，则触发返回
        if (this.data.moveDirection === 'right' && this.data.moveX > 100) {
            console.log('[商品详情页] 触发右滑返回');
            this.goBack();
        }

        // 重置
        this.setData({
            startX: 0,
            moveX: 0,
            moveDirection: ''
        });
    },

    /**
     * 返回上一页
     */
    goBack: function () {
        console.log('[商品详情页] 执行返回');
        wx.navigateBack({
            delta: 1,
            success: () => {
                console.log('[商品详情页] 返回成功');
            },
            fail: (err) => {
                console.error('[商品详情页] 返回失败:', err);
                // 如果返回失败，尝试跳转到首页
                wx.switchTab({
                    url: '/pages/index/index'
                });
            }
        });
    },

    /**
     * 加载商品详情
     */
    loadGoodsDetail: function () {
        const that = this;

        // 显示加载状态
        wx.showLoading({
            title: '加载中...',
            mask: true
        });

        // 调用商品详情API
        goodsApi.getGoodsDetail(that.data.goodsId).then(res => {
            // 隐藏加载状态
            wx.hideLoading();

            if (res.code === 200) {
                // 处理商品图片，转换为数组
                let imageUrls = [];
                if (res.data.main_image) {
                    imageUrls.push(res.data.main_image);
                }

                if (res.data.images) {
                    // 如果是字符串则按逗号分隔转换为数组
                    const moreImages = typeof res.data.images === 'string'
                        ? res.data.images.split(',')
                        : res.data.images;
                    imageUrls = imageUrls.concat(moreImages);
                }

                // 更新页面数据
                that.setData({
                    goods: res.data,
                    imageUrls: imageUrls,
                    loading: false
                });

                // 设置页面标题
                wx.setNavigationBarTitle({
                    title: res.data.name
                });
            } else {
                // 加载失败处理
                that.setData({
                    loading: false
                });

                Toast.fail({
                    message: '商品信息加载失败',
                    onClose: () => {
                        wx.navigateBack();
                    }
                });
            }
        }).catch(err => {
            console.error('加载商品详情出错：', err);
            wx.hideLoading();

            that.setData({
                loading: false
            });

            Toast.fail({
                message: '网络错误，请重试',
                onClose: () => {
                    wx.navigateBack();
                }
            });
        });
    },

    /**
     * 获取购物车商品数量
     */
    getCartCount: function () {
        // 调用购物车数量API，暂用模拟数据
        setTimeout(() => {
            this.setData({
                cartCount: 5 // 模拟数据，实际项目中应调用API
            });
        }, 500);

        // 实际API调用(联调时使用)
        /*
        cartApi.getCartCount().then(res => {
            if (res.code === 200) {
                this.setData({
                    cartCount: res.data.count
                });
            }
        }).catch(err => {
            console.error('获取购物车数量出错：', err);
        });
        */
    },

    /**
     * 加载收藏状态
     */
    loadCollectionStatus: function () {
        // 这里应该调用API获取收藏状态，暂用本地存储模拟
        const { goodsId } = this.data;
        const collectedGoods = wx.getStorageSync('collectedGoods') || [];
        const isCollected = collectedGoods.includes(goodsId);

        this.setData({ isCollected });
    },

    /**
     * 切换收藏状态
     */
    toggleCollect: function () {
        const { goodsId, isCollected } = this.data;
        let collectedGoods = wx.getStorageSync('collectedGoods') || [];

        if (isCollected) {
            // 取消收藏
            collectedGoods = collectedGoods.filter(id => id !== goodsId);
            Toast.success('已取消收藏');
        } else {
            // 添加收藏
            if (!collectedGoods.includes(goodsId)) {
                collectedGoods.push(goodsId);
            }
            Toast.success('收藏成功');
        }

        // 保存到本地存储
        wx.setStorageSync('collectedGoods', collectedGoods);

        // 更新收藏状态
        this.setData({
            isCollected: !isCollected
        });

        // 实际API调用(联调时使用)
        /*
        if (isCollected) {
            goodsApi.cancelCollect(goodsId).then(res => {
                if (res.code === 200) {
                    Toast.success('已取消收藏');
                    this.setData({ isCollected: false });
                } else {
                    Toast.fail(res.message || '操作失败');
                }
            }).catch(err => {
                console.error('取消收藏出错：', err);
                Toast.fail('网络错误，请重试');
            });
        } else {
            goodsApi.collect(goodsId).then(res => {
                if (res.code === 200) {
                    Toast.success('收藏成功');
                    this.setData({ isCollected: true });
                } else {
                    Toast.fail(res.message || '操作失败');
                }
            }).catch(err => {
                console.error('收藏出错：', err);
                Toast.fail('网络错误，请重试');
            });
        }
        */
    },

    /**
     * 轮播图切换事件
     */
    onSwiperChange: function (e) {
        this.setData({
            current: e.detail.current
        });
    },

    /**
     * 预览图片
     */
    previewImage: function (e) {
        const { imageUrls } = this.data;
        const current = e.currentTarget.dataset.url;

        wx.previewImage({
            current: current,
            urls: imageUrls
        });
    },

    /**
     * 修改商品数量
     */
    onQuantityChange: function (e) {
        this.setData({
            quantity: e.detail
        });
    },

    /**
     * 添加到购物车
     */
    addToCart: function () {
        this.setData({
            buyType: 'cart',
            showSku: true
        });
    },

    /**
     * 立即购买
     */
    buyNow: function () {
        if (!this.checkLogin()) return;

        this.setData({
            buyType: 'buy',
            showSku: true
        });
    },

    /**
     * 关闭规格选择层
     */
    onCloseSkuPopup: function () {
        this.setData({
            showSku: false
        });
    },

    /**
     * 确认购买或加入购物车
     */
    confirmAction: function () {
        const { buyType, goods, quantity } = this.data;

        // 关闭规格选择层
        this.setData({
            showSku: false
        });

        if (buyType === 'cart') {
            // 添加到购物车
            this.confirmAddToCart();
        } else {
            // 立即购买
            this.confirmBuyNow();
        }
    },

    /**
     * 确认添加到购物车
     */
    confirmAddToCart: function () {
        const { goods, quantity } = this.data;

        wx.showLoading({
            title: '添加中...',
            mask: true
        });

        // 使用购物车工具模块添加商品，会自动处理登录检查
        cartUtil.addToCart({
            goodsId: goods.id,
            number: quantity
        }).then(res => {
            wx.hideLoading();
            // 更新购物车数量
            this.setData({
                cartCount: this.data.cartCount + quantity
            });
        }).catch(err => {
            wx.hideLoading();
            console.error('添加购物车出错：', err);
            // 错误已在cartUtil中处理，这里不需要额外提示
        });
    },

    /**
     * 确认立即购买
     */
    confirmBuyNow: function () {
        const { goods, quantity } = this.data;

        // 跳转到订单确认页面
        wx.navigateTo({
            url: `/pages/order/order-confirm/index?goods_id=${goods.id}&quantity=${quantity}&buy_now=1`
        });
    },

    /**
     * 检查是否已登录
     */
    checkLogin: function () {
        const auth = require('../../../utils/auth');
        if (!auth.isLoggedIn()) {
            // 获取当前页面路径
            const currentPage = util.getCurrentPageUrl();
            // 跳转到登录页面并传递当前页面路径用于登录后返回
            auth.navigateToLogin(currentPage);
            return false;
        }
        return true;
    },

    /**
     * 跳转到购物车页面
     */
    goToCart: function () {
        wx.switchTab({
            url: '/pages/cart/index'
        });
    },

    /**
     * 分享商品
     */
    onShareAppMessage: function () {
        const { goods } = this.data;

        return {
            title: goods.name,
            path: `/pages/goods/detail/index?id=${goods.id}`,
            imageUrl: goods.main_image
        };
    }
}); 