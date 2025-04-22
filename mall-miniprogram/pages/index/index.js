// index.js
const homeApi = require('../../api/home.js');
const util = require('../../utils/util.js');

Page({
    data: {
        // 搜索相关
        searchValue: '',

        // 轮播图数据
        banners: [],

        // 推荐商品
        recommendGoods: [],

        // 分类相关
        categories: [],
        currentCategory: 0,
        categoryGoods: [],

        // 分页相关
        currentPage: 1,
        pageSize: 6,
        hasMore: true, // 是否还有更多数据
        loadingMore: false, // 是否正在加载更多

        // 刷新相关
        isRefreshing: false, // 是否正在刷新
        refreshSuccess: false // 刷新成功提示
    },

    // 页面加载
    onLoad() {
        this.loadInitialData();
    },

    // 加载初始数据
    loadInitialData() {
        util.showLoading('加载中...');

        // 使用getHomeData获取所有首页数据
        homeApi.getHomeData().then(res => {
            if (res.code === 200) {
                const data = res.data;

                this.setData({
                    banners: data.banners || [],
                    recommendGoods: data.recommendGoods || [],
                    categories: data.categories || []
                });

                // 如果有分类，设置当前分类并加载商品
                if (data.categories && data.categories.length > 0) {
                    const firstCategory = data.categories[0];

                    this.setData({
                        currentCategory: firstCategory.id,
                        categoryGoods: firstCategory.goods || []
                    });
                }

                util.hideLoading();
            } else {
                throw new Error(res.message || '获取首页数据失败');
            }
        }).catch(err => {
            console.error('初始数据加载失败', err);
            util.hideLoading();
            util.showErrorToast('加载失败，请重试');

            // 加载失败时使用本地缓存或默认数据
            this.setFallbackData();
        });
    },

    // 设置后备数据（当API请求失败时）
    setFallbackData() {
        const fallbackData = {
            banners: [
                {
                    id: 1,
                    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    title: '默认轮播图'
                }
            ],
            recommendGoods: [
                {
                    id: 1,
                    name: '默认商品',
                    price: '99.00',
                    main_image: 'https://img.yzcdn.cn/vant/cat.jpeg'
                }
            ],
            categories: [
                {
                    id: 1,
                    name: '默认分类',
                    goods: []
                }
            ]
        };

        this.setData({
            banners: fallbackData.banners,
            recommendGoods: fallbackData.recommendGoods,
            categories: fallbackData.categories,
            currentCategory: fallbackData.categories[0].id,
            categoryGoods: fallbackData.categories[0].goods
        });
    },

    // 页面显示
    onShow() {
        // 可以在这里刷新购物车数量等信息
    },

    // 页面下拉刷新
    onPullDownRefresh() {
        console.log('触发下拉刷新');
        this.setData({
            isRefreshing: true,
            refreshSuccess: false
        });

        // 重新加载所有数据
        homeApi.getHomeData().then(res => {
            if (res.code === 200) {
                const data = res.data;

                this.setData({
                    banners: data.banners || [],
                    recommendGoods: data.recommendGoods || [],
                    categories: data.categories || []
                });

                // 如果有分类，设置当前分类并加载商品
                if (data.categories && data.categories.length > 0) {
                    // 保持当前选中的分类
                    const currentCatId = this.data.currentCategory;

                    // 查找当前分类
                    const currentCat = data.categories.find(item => item.id === currentCatId);

                    if (currentCat) {
                        this.setData({
                            categoryGoods: currentCat.goods || []
                        });
                    } else if (data.categories.length > 0) {
                        // 如果当前分类不存在了，则选择第一个分类
                        const firstCategory = data.categories[0];
                        this.setData({
                            currentCategory: firstCategory.id,
                            categoryGoods: firstCategory.goods || []
                        });
                    }
                }

                // 停止下拉刷新动画
                wx.stopPullDownRefresh();

                // 显示刷新成功提示
                this.setData({
                    isRefreshing: false,
                    refreshSuccess: true
                });

                // 3秒后隐藏刷新成功提示
                setTimeout(() => {
                    this.setData({
                        refreshSuccess: false
                    });
                }, 3000);

                // 显示成功提示
                wx.showToast({
                    title: '刷新成功',
                    icon: 'success',
                    duration: 1500
                });
            } else {
                throw new Error(res.message || '刷新首页数据失败');
            }
        }).catch(err => {
            console.error('刷新数据失败', err);
            // 停止下拉刷新动画
            wx.stopPullDownRefresh();

            this.setData({
                isRefreshing: false,
                refreshSuccess: false
            });

            util.showErrorToast('刷新失败，请重试');
        });
    },

    // 页面上拉触底
    onReachBottom() {
        console.log('触发上拉触底');
        // 对于首页，可以加载更多推荐商品或者当前分类的更多商品
        // 这里暂不实现，因为后端API需要支持分页才能实现
    },

    // 点击搜索框
    onSearchFocus() {
        wx.navigateTo({
            url: '/pages/search/search'
        });
    },

    // 点击轮播图
    onBannerTap(e) {
        const item = e.currentTarget.dataset.item;
        // 后端API返回的Banner可能包含url和链接类型
        if (item.url) {
            // 根据url类型跳转到不同页面
            wx.navigateTo({
                url: item.url
            });
        }
    },

    // 点击推荐商品
    onGoodsTap(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/goods-detail/goods-detail?id=' + id
        });
    },

    // 点击分类选项
    onCategoryTap(e) {
        const id = e.currentTarget.dataset.id;

        // 查找选中的分类
        const category = this.data.categories.find(item => item.id === id);

        if (category) {
            this.setData({
                currentCategory: id,
                categoryGoods: category.goods || []
            });
        }
    },

    // 点击加入购物车
    onAddCart(e) {
        // 阻止冒泡，防止触发商品点击
        e.stopPropagation();

        const id = e.currentTarget.dataset.id;

        // 判断是否登录
        const app = getApp();
        if (!app.globalData.hasLogin) {
            wx.navigateTo({
                url: '/pages/login/index'
            });
            return;
        }

        // 添加到购物车
        util.showLoading('添加中...');

        // 实际API调用，等后端API准备好时使用
        /*
        api.cart.addCart({
          goodsId: id,
          number: 1
        }).then(res => {
          util.hideLoading();
          util.showSuccessToast('添加成功');
        }).catch(err => {
          console.error('添加购物车失败', err);
          util.hideLoading();
          util.showErrorToast('添加失败');
        });
        */

        // 模拟添加购物车
        setTimeout(() => {
            util.hideLoading();
            util.showSuccessToast('添加成功');
        }, 500);
    }
})
