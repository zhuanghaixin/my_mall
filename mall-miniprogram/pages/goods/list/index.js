/**
 * 商品列表页
 */
const goodsApi = require('../../../api/goods');
const util = require('../../../utils/util');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        keyword: '',               // 搜索关键词
        categoryId: 0,             // 分类ID
        goodsList: [],             // 商品列表
        page: 1,                   // 当前页码
        pageSize: 10,              // 每页数量
        total: 0,                  // 商品总数
        loading: false,            // 是否在加载中
        loadingMore: false,        // 加载更多状态
        hasMore: true,             // 是否有更多数据
        sortOption: 0,             // 排序方式：0综合 1销量降序 2价格升序 3价格降序
        sortOptions: [
            { text: '综合排序', value: 0 },
            { text: '销量优先', value: 1 },
            { text: '价格升序', value: 2 },
            { text: '价格降序', value: 3 }
        ],
        pageTitle: '商品列表',      // 页面标题
        startX: 0,                 // 触摸开始位置
        moveX: 0                   // 移动距离
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取URL参数
        let keyword = options.keyword || '';
        let categoryId = options.category_id ? parseInt(options.category_id) : 0;
        let pageTitle = '商品列表';

        // 更新页面标题
        if (keyword) {
            pageTitle = `搜索: ${keyword}`;
        } else if (categoryId) {
            // 如果有分类名可以设置分类名为标题
            pageTitle = '分类商品';
        }

        // 设置数据并加载商品
        this.setData({
            keyword: keyword,
            categoryId: categoryId,
            pageTitle: pageTitle
        }, () => {
            this.loadGoodsList(false);
        });
    },

    /**
     * 加载商品列表
     * @param {Boolean} append - 是否追加数据
     */
    loadGoodsList: function (append = false) {
        if (this.data.loading) return;

        let page = append ? this.data.page + 1 : 1;

        this.setData({
            loading: true,
            loadingMore: append
        });

        // 构建查询参数
        const params = {
            page: page,
            pageSize: this.data.pageSize,
            keyword: this.data.keyword,
            categoryId: this.data.categoryId,
            sortType: this.data.sortOption
        };

        // 调用商品列表API
        goodsApi.getGoodsList(params).then(res => {
            if (res.code === 200) {
                let newList = append ? [...this.data.goodsList, ...res.data.list] : res.data.list;
                let hasMore = newList.length < res.data.total;

                this.setData({
                    goodsList: newList,
                    total: res.data.total,
                    page: page,
                    hasMore: hasMore,
                    loading: false,
                    loadingMore: false
                });
            } else {
                this.setData({
                    loading: false,
                    loadingMore: false
                });

                wx.showToast({
                    title: res.message || '获取商品列表失败',
                    icon: 'none'
                });
            }
        }).catch(err => {
            console.error('获取商品列表出错：', err);

            this.setData({
                loading: false,
                loadingMore: false
            });

            wx.showToast({
                title: '网络错误，请重试',
                icon: 'none'
            });
        });
    },

    /**
     * 商品点击事件
     */
    onGoodsTap: function (e) {
        const id = e.currentTarget.dataset.id;

        wx.navigateTo({
            url: `/pages/goods/detail/index?id=${id}`
        });
    },

    /**
     * 搜索确认事件
     */
    onSearchConfirm: function (e) {
        const keyword = e.detail;

        this.setData({
            keyword: keyword,
            page: 1
        }, () => {
            this.loadGoodsList(false);
        });
    },

    /**
     * 排序方式改变事件
     */
    onSortChange: function (e) {
        const sortOption = e.detail;

        this.setData({
            sortOption: sortOption,
            page: 1
        }, () => {
            this.loadGoodsList(false);
        });
    },

    /**
     * 下拉刷新事件
     */
    onPullDownRefresh: function () {
        this.loadGoodsList(false).then(() => {
            wx.stopPullDownRefresh();
        });
    },

    /**
     * 上拉加载更多
     */
    onReachBottom: function () {
        if (this.data.hasMore && !this.data.loading) {
            this.loadGoodsList(true);
        }
    },

    /**
     * 触摸开始事件，记录开始位置
     */
    onTouchStart: function (e) {
        this.setData({
            startX: e.changedTouches[0].clientX,
            moveX: 0
        });
    },

    /**
     * 触摸移动事件，计算移动距离
     */
    onTouchMove: function (e) {
        const moveX = e.changedTouches[0].clientX - this.data.startX;
        this.setData({
            moveX: moveX
        });
    },

    /**
     * 触摸结束事件，判断是否满足右滑返回条件
     */
    onTouchEnd: function (e) {
        const moveX = this.data.moveX;
        // 如果右滑距离超过100px，则触发返回操作
        if (moveX > 100) {
            wx.navigateBack({
                delta: 1
            });
        }
    }
}); 