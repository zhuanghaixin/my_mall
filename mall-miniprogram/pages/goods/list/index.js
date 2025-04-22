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
        pageSize: 20,              // 每页数量（增加默认值）
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
        console.log('商品列表页接收参数:', options);
        // 获取URL参数并解码
        let keyword = '';
        let categoryId = 0;
        let pageTitle = '商品列表';

        try {
            // 安全地解码关键词
            if (options.keyword) {
                keyword = decodeURIComponent(options.keyword);
                console.log('解码后的关键词:', keyword);
            }

            // 解析分类ID
            if (options.category_id) {
                categoryId = parseInt(options.category_id) || 0;
            }
        } catch (error) {
            console.error('参数解析错误:', error);
            // 出错时使用原始值
            keyword = options.keyword || '';
        }

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
            try {
                this.loadGoodsList(false).catch(err => {
                    console.error('页面加载商品列表出错:', err);
                });
            } catch (error) {
                console.error('执行loadGoodsList出错:', error);
            }
        });
    },

    /**
     * 加载商品列表
     * @param {Boolean} append - 是否追加数据
     */
    loadGoodsList: function (append = false) {
        if (this.data.loading) return Promise.reject('正在加载中');

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

        console.log('请求参数:', params);

        // 调用商品列表API，并返回Promise对象
        return goodsApi.getGoodsList(params).then(res => {
            console.log('商品列表接口返回：', res);
            if (res.code === 200) {
                // 处理数据结构，兼容items和list字段
                const items = res.data.items || res.data.list || [];
                const total = res.data.total || 0;

                // 处理商品数据，兼容不同字段名称和格式
                const processedItems = items.map(item => {
                    // 确保图片路径完整
                    if (item.cover_image && !item.cover_image.startsWith('http')) {
                        item.cover_image = this.getFullImageUrl(item.cover_image);
                    }
                    if (item.main_image && !item.main_image.startsWith('http')) {
                        item.main_image = this.getFullImageUrl(item.main_image);
                    }
                    return item;
                });

                let newList = append ? [...this.data.goodsList, ...processedItems] : processedItems;

                // 修复hasMore判断逻辑，根据总条数和当前加载的总数比较
                const hasMore = newList.length < total;
                console.log(`已加载: ${newList.length}, 总数: ${total}, 是否有更多: ${hasMore}`);

                this.setData({
                    goodsList: newList,
                    total: total,
                    page: page,
                    hasMore: hasMore,
                    loading: false,
                    loadingMore: false
                });

                return res; // 返回结果，使链式调用可以继续
            } else {
                this.setData({
                    loading: false,
                    loadingMore: false
                });

                wx.showToast({
                    title: res.message || '获取商品列表失败',
                    icon: 'none'
                });

                return Promise.reject(res.message || '获取商品列表失败');
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

            return Promise.reject(err);
        });
    },

    /**
     * 获取完整图片URL
     */
    getFullImageUrl: function (url) {
        if (!url) return '';

        // 如果已经是完整URL则直接返回
        if (url.startsWith('http')) {
            return url;
        }

        // 如果是相对路径，拼接基础URL
        const baseUrl = getApp().globalData.baseUrl || 'http://localhost:8080';

        // 确保路径正确
        if (url.startsWith('/')) {
            return baseUrl + url;
        } else {
            return baseUrl + '/' + url;
        }
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

        // 避免重复加载相同关键词
        if (keyword === this.data.keyword) {
            return;
        }

        // 更新页面标题
        const pageTitle = keyword ? `搜索: ${keyword}` : '商品列表';

        this.setData({
            keyword: keyword,
            page: 1,
            pageTitle: pageTitle
        }, () => {
            try {
                this.loadGoodsList(false).catch(err => {
                    console.error('搜索商品列表出错:', err);
                });
            } catch (error) {
                console.error('执行搜索loadGoodsList出错:', error);
            }
        });
    },

    /**
     * 搜索取消事件
     */
    onSearchCancel: function () {
        this.setData({
            keyword: '',
            page: 1,
            pageTitle: '商品列表'
        }, () => {
            try {
                this.loadGoodsList(false).catch(err => {
                    console.error('重置搜索商品列表出错:', err);
                });
            } catch (error) {
                console.error('执行重置搜索loadGoodsList出错:', error);
            }
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
            try {
                this.loadGoodsList(false).catch(err => {
                    console.error('排序商品列表出错:', err);
                });
            } catch (error) {
                console.error('执行排序loadGoodsList出错:', error);
            }
        });
    },

    /**
     * 下拉刷新事件
     */
    onPullDownRefresh: function () {
        try {
            const result = this.loadGoodsList(false);
            if (result && typeof result.then === 'function') {
                result.then(() => {
                    wx.stopPullDownRefresh();
                }).catch(err => {
                    console.error('下拉刷新出错:', err);
                    wx.stopPullDownRefresh();
                });
            } else {
                console.warn('loadGoodsList未返回Promise对象');
                wx.stopPullDownRefresh();
            }
        } catch (error) {
            console.error('下拉刷新执行出错:', error);
            wx.stopPullDownRefresh();
        }
    },

    /**
     * 上拉加载更多
     */
    onReachBottom: function () {
        console.log('触发上拉加载更多', this.data.hasMore, this.data.loading);

        if (this.data.hasMore && !this.data.loading) {
            console.log('开始加载更多数据，当前页：', this.data.page);
            try {
                this.loadGoodsList(true).catch(err => {
                    console.error('加载更多数据出错:', err);
                });
            } catch (error) {
                console.error('加载更多执行出错:', error);
            }
        } else if (!this.data.hasMore) {
            wx.showToast({
                title: '已加载全部商品',
                icon: 'none'
            });
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