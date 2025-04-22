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

                setTimeout(() => {
                    this.setData({
                        isRefreshing: false,
                        refreshSuccess: true
                    });
                }, 500);

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
        // 检查是否有更多数据且当前不在加载中
        if (!this.data.hasMore || this.data.loadingMore) return;

        this.setData({ loadingMore: true });

        const nextPage = this.data.currentPage + 1;

        // 加载更多商品
        homeApi.getCategoryGoods(this.data.currentCategory, nextPage, this.data.pageSize)
            .then(res => {
                if (res.code === 200) {
                    const newGoods = res.data.list || [];

                    if (newGoods.length > 0) {
                        // 合并新商品到现有列表
                        const allGoods = [...this.data.categoryGoods, ...newGoods];

                        this.setData({
                            categoryGoods: allGoods,
                            currentPage: nextPage,
                            hasMore: newGoods.length >= this.data.pageSize
                        });
                    } else {
                        this.setData({
                            hasMore: false
                        });
                    }
                } else {
                    throw new Error(res.message || '加载更多失败');
                }
            })
            .catch(err => {
                console.error('加载更多失败', err);
                util.showErrorToast('加载更多失败');
            })
            .finally(() => {
                this.setData({ loadingMore: false });
            });
    },

    // 点击搜索框
    onSearchFocus() {
        wx.navigateTo({
            url: '/pages/search/index'
        });
    },

    // 点击轮播图
    onBannerTap(e) {
        const item = e.currentTarget.dataset.item;
        console.log('点击了轮播图', item);

        // 根据轮播图链接类型跳转
        if (item.url) {
            wx.navigateTo({
                url: item.url
            });
        }
    },

    // 点击推荐商品
    onGoodsTap(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/goods/detail/index?id=${id}`
        });
    },

    // 点击分类选项
    onCategoryTap(e) {
        const id = e.currentTarget.dataset.id;

        if (id === this.data.currentCategory) return;

        this.setData({
            currentCategory: id,
            categoryGoods: [],
            currentPage: 1,
            hasMore: true,
            loadingMore: false
        });

        // 加载所选分类的商品
        util.showLoading('加载中...');

        homeApi.getCategoryGoods(id, 1, this.data.pageSize)
            .then(res => {
                if (res.code === 200) {
                    this.setData({
                        categoryGoods: res.data.list || [],
                        hasMore: (res.data.list || []).length >= this.data.pageSize
                    });
                } else {
                    throw new Error(res.message || '获取分类商品失败');
                }
            })
            .catch(err => {
                console.error('获取分类商品失败', err);
                util.showErrorToast('获取商品失败');
            })
            .finally(() => {
                util.hideLoading();
            });
    },

    // 点击加入购物车
    onAddCart(e) {
        const id = e.currentTarget.dataset.id;
        console.log('添加到购物车', id);

        util.showSuccessToast('添加成功');

        // 阻止事件冒泡
        return false;
    }
})
