// 首页JS文件
import API from '../../api/index';

Page({
    data: {
        banners: [], // 轮播图数据
        recommendGoods: [], // 推荐商品数据
        categories: [], // 分类数据
        goodsList: [], // 分类商品数据
        currentCategory: {}, // 当前选中的分类
        loading: {
            banner: false,
            recommend: false,
            category: false,
            goods: false
        },
        pageNum: 1,
        pageSize: 10,
        hasMoreGoods: true // 是否还有更多商品
    },

    onLoad() {
        this.getBanners();
        this.getRecommendGoods();
        this.getCategories();
    },

    onPullDownRefresh() {
        this.setData({
            banners: [],
            recommendGoods: [],
            categories: [],
            goodsList: [],
            currentCategory: {},
            pageNum: 1,
            hasMoreGoods: true
        });
        this.getBanners();
        this.getRecommendGoods();
        this.getCategories();
        wx.stopPullDownRefresh();
    },

    onReachBottom() {
        if (this.data.hasMoreGoods && this.data.currentCategory.id) {
            this.loadMoreGoods();
        }
    },

    // 获取轮播图数据
    getBanners() {
        this.setData({
            'loading.banner': true
        });

        API.home.getBanner().then(res => {
            this.setData({
                banners: res.data || [],
                'loading.banner': false
            });
        }).catch(() => {
            this.setData({
                'loading.banner': false
            });
        });
    },

    // 获取推荐商品数据
    getRecommendGoods() {
        this.setData({
            'loading.recommend': true
        });

        API.goods.getRecommendGoods({
            page: 1,
            size: 6
        }).then(res => {
            this.setData({
                recommendGoods: res.data.list || [],
                'loading.recommend': false
            });
        }).catch(() => {
            this.setData({
                'loading.recommend': false
            });
        });
    },

    // 获取分类数据
    getCategories() {
        this.setData({
            'loading.category': true
        });

        API.category.getCategoryList().then(res => {
            const categories = res.data || [];

            this.setData({
                categories,
                'loading.category': false
            });

            if (categories.length > 0) {
                this.setData({
                    currentCategory: categories[0]
                });
                this.getCategoryGoods(categories[0].id);
            }
        }).catch(() => {
            this.setData({
                'loading.category': false
            });
        });
    },

    // 获取分类商品数据
    getCategoryGoods(categoryId) {
        if (!categoryId) return;

        this.setData({
            'loading.goods': true,
            goodsList: [],
            pageNum: 1,
            hasMoreGoods: true
        });

        API.goods.getGoodsList({
            categoryId,
            page: this.data.pageNum,
            size: this.data.pageSize
        }).then(res => {
            const { list, total } = res.data;

            this.setData({
                goodsList: list || [],
                'loading.goods': false,
                hasMoreGoods: list.length >= this.data.pageSize && list.length < total
            });
        }).catch(() => {
            this.setData({
                'loading.goods': false
            });
        });
    },

    // 加载更多商品
    loadMoreGoods() {
        if (this.data.loading.goods) return;

        this.setData({
            pageNum: this.data.pageNum + 1,
            'loading.goods': true
        });

        API.goods.getGoodsList({
            categoryId: this.data.currentCategory.id,
            page: this.data.pageNum,
            size: this.data.pageSize
        }).then(res => {
            const { list, total } = res.data;
            const newList = [...this.data.goodsList, ...(list || [])];

            this.setData({
                goodsList: newList,
                'loading.goods': false,
                hasMoreGoods: list.length >= this.data.pageSize && newList.length < total
            });
        }).catch(() => {
            this.setData({
                'loading.goods': false
            });
        });
    },

    // 切换分类
    handleCategoryChange(e) {
        const { id } = e.currentTarget.dataset;
        const category = this.data.categories.find(item => item.id === id);

        if (category && category.id !== this.data.currentCategory.id) {
            this.setData({
                currentCategory: category
            });
            this.getCategoryGoods(category.id);
        }
    },

    // 跳转到商品详情页
    goToGoodsDetail(e) {
        const { id } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/goods-detail/goods-detail?id=${id}`
        });
    },

    // 跳转到搜索页
    goToSearch() {
        wx.navigateTo({
            url: '/pages/search/search'
        });
    },

    // 加入购物车
    addToCart(e) {
        const app = getApp();
        if (!app.checkLogin()) return;

        const { id } = e.currentTarget.dataset;

        API.cart.addToCart({
            goodsId: id,
            quantity: 1
        }).then(() => {
            wx.showToast({
                title: '添加成功',
                icon: 'success'
            });
        }).catch((err) => {
            wx.showToast({
                title: err.message || '添加失败',
                icon: 'none'
            });
        });
    }
}); 