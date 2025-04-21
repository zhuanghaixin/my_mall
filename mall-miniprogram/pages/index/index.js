// index.js
const api = require('../../api/index.js');
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
        pageSize: 20,
        hasMore: true, // 是否还有更多数据
        loadingMore: false, // 是否正在加载更多
        allCategoryGoods: [], // 存储100条模拟数据

        // 刷新相关
        isRefreshing: false, // 是否正在刷新
        refreshSuccess: false, // 刷新成功提示

        // 滚动相关
        scrollTop: 0,
        lastLoadedItemCount: 0 // 上次加载时的商品数量
    },

    // 页面加载
    onLoad() {
        this.generateMockCategoryGoods(); // 生成100条模拟商品数据
        this.loadInitialData();
    },

    // 加载初始数据
    loadInitialData() {
        util.showLoading('加载中...');
        Promise.all([
            this.loadBanners(),
            this.loadRecommendGoods(),
            this.loadCategories()
        ]).then(() => {
            util.hideLoading();
        }).catch(err => {
            console.error('初始数据加载失败', err);
            util.hideLoading();
            util.showErrorToast('加载失败，请重试');
        });
    },

    // 页面显示
    onShow() {
        // 可以在这里刷新购物车数量等信息
    },

    // 页面下拉刷新
    onPullDownRefresh() {
        this.setData({
            isRefreshing: true,
            refreshSuccess: false,
            currentPage: 1,
            hasMore: true,
            lastLoadedItemCount: 0
        });

        // 重新加载所有数据
        Promise.all([
            this.loadBanners(),
            this.loadRecommendGoods(),
            this.loadCategories()
        ]).then(() => {
            // 重新加载当前分类的商品
            return this.loadCategoryGoods(this.data.currentCategory, 1, true);
        }).then(() => {
            // 生成新的模拟数据以模拟真实刷新
            this.generateMockCategoryGoods();

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

    // 监听页面滚动
    onPageScroll(e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        });

        // 如果已经在加载或者没有更多数据，直接返回
        if (this.data.loadingMore || !this.data.hasMore) {
            return;
        }

        // 如果当前显示的商品数量比上次加载的多，表示用户正在浏览新加载的商品
        // 如果商品数量已达到或超过下一页的阈值，自动加载更多
        const visibleItems = this.data.categoryGoods.length;

        if (visibleItems > 0 && visibleItems >= this.data.lastLoadedItemCount + (this.data.pageSize / 2)) {
            this.loadMoreCategoryGoods();
            this.setData({
                lastLoadedItemCount: visibleItems
            });
        }
    },

    // 滚动到底部触发
    onScrollToLower() {
        if (this.data.currentCategory !== 0 && this.data.hasMore && !this.data.loadingMore) {
            this.loadMoreCategoryGoods();
        }
    },

    // 页面上拉触底 (保留此方法以兼容)
    onReachBottom() {
        if (this.data.currentCategory !== 0 && this.data.hasMore && !this.data.loadingMore) {
            this.loadMoreCategoryGoods();
        }
    },

    // 生成100条模拟商品数据
    generateMockCategoryGoods() {
        const allGoods = [];
        for (let i = 1; i <= 100; i++) {
            allGoods.push({
                id: i + 10, // 避免ID冲突
                name: `分类商品${i}`,
                primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                retail_price: (Math.random() * 200 + 50).toFixed(2),
                goods_number: Math.floor(Math.random() * 200 + 20)
            });
        }
        this.setData({
            allCategoryGoods: allGoods
        });
    },

    // 加载轮播图
    loadBanners() {
        return new Promise((resolve, reject) => {
            // 使用本地模拟数据
            const banners = [
                {
                    id: 1,
                    image_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    link_type: 0,
                    link: '',
                    sort_order: 1
                },
                {
                    id: 2,
                    image_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    link_type: 0,
                    link: '',
                    sort_order: 2
                },
                {
                    id: 3,
                    image_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    link_type: 0,
                    link: '',
                    sort_order: 3
                }
            ];

            this.setData({
                banners: banners
            });

            resolve(banners);

            // 实际API调用，等后端API准备好时替换上面的模拟数据
            /* 
            api.home.getBanner().then(res => {
              this.setData({
                banners: res
              });
              resolve(res);
            }).catch(err => {
              console.error('获取轮播图失败', err);
              reject(err);
            });
            */
        });
    },

    // 加载推荐商品
    loadRecommendGoods() {
        return new Promise((resolve, reject) => {
            // 使用本地模拟数据
            const recommendGoods = [
                {
                    id: 1,
                    name: '商品1',
                    primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    retail_price: '99.00'
                },
                {
                    id: 2,
                    name: '商品2',
                    primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    retail_price: '188.00'
                },
                {
                    id: 3,
                    name: '商品3',
                    primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    retail_price: '299.00'
                },
                {
                    id: 4,
                    name: '商品4',
                    primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                    retail_price: '59.00'
                }
            ];

            this.setData({
                recommendGoods: recommendGoods
            });

            resolve(recommendGoods);

            // 实际API调用，等后端API准备好时替换上面的模拟数据
            /*
            api.home.getRecommend().then(res => {
              this.setData({
                recommendGoods: res
              });
              resolve(res);
            }).catch(err => {
              console.error('获取推荐商品失败', err);
              reject(err);
            });
            */
        });
    },

    // 加载分类
    loadCategories() {
        return new Promise((resolve, reject) => {
            // 使用本地模拟数据
            const categories = [
                {
                    id: 1,
                    name: '分类一'
                },
                {
                    id: 2,
                    name: '分类二'
                },
                {
                    id: 3,
                    name: '分类三'
                },
                {
                    id: 4,
                    name: '分类四'
                }
            ];

            this.setData({
                categories: categories,
                currentCategory: categories[0].id,
                currentPage: 1,
                hasMore: true,
                lastLoadedItemCount: 0
            });

            // 加载第一个分类的商品
            this.loadCategoryGoods(categories[0].id, 1);

            resolve(categories);

            // 实际API调用，等后端API准备好时替换上面的模拟数据
            /*
            api.category.getCategoryList().then(res => {
              if (res && res.length > 0) {
                this.setData({
                  categories: res,
                  currentCategory: res[0].id,
                  currentPage: 1,
                  hasMore: true
                });
                
                // 加载第一个分类的商品
                this.loadCategoryGoods(res[0].id, 1);
                resolve(res);
              } else {
                reject(new Error('分类列表为空'));
              }
            }).catch(err => {
              console.error('获取分类失败', err);
              reject(err);
            });
            */
        });
    },

    // 加载分类商品
    loadCategoryGoods(categoryId, page = 1, isRefresh = false) {
        return new Promise((resolve, reject) => {
            const size = this.data.pageSize;

            if (!isRefresh) {
                this.setData({ loadingMore: true });
                if (page === 1) {
                    util.showLoading('加载中...');
                }
            }

            if (page === 1) {
                this.setData({
                    categoryGoods: []
                });
            }

            // 使用本地模拟数据，从全部100条数据中取指定页的数据
            const startIndex = (page - 1) * size;
            const endIndex = startIndex + size;

            // 模拟从服务器获取数据的延迟
            setTimeout(() => {
                const pageData = this.data.allCategoryGoods.slice(startIndex, endIndex);

                let hasMore = true;
                if (endIndex >= this.data.allCategoryGoods.length) {
                    hasMore = false;
                }

                if (page === 1) {
                    // 第一页数据直接替换
                    this.setData({
                        categoryGoods: pageData,
                        currentPage: page,
                        hasMore: hasMore,
                        loadingMore: false,
                        lastLoadedItemCount: pageData.length
                    });
                } else {
                    // 加载更多，追加数据
                    const newCategoryGoods = this.data.categoryGoods.concat(pageData);
                    this.setData({
                        categoryGoods: newCategoryGoods,
                        currentPage: page,
                        hasMore: hasMore,
                        loadingMore: false,
                        lastLoadedItemCount: newCategoryGoods.length
                    });
                }

                if (!isRefresh && page === 1) {
                    util.hideLoading();
                }

                resolve(pageData);
            }, 1000); // 增加延迟时间，使加载状态更明显

            // 实际API调用，等后端API准备好时替换上面的模拟数据
            /*
            api.category.getCategoryGoods({
              categoryId: categoryId,
              page: page,
              size: size
            }).then(res => {
              if (page === 1) {
                // 第一页数据直接替换
                this.setData({
                  categoryGoods: res.list,
                  hasMore: res.totalPages > page,
                  currentPage: page,
                  loadingMore: false
                });
              } else {
                // 加载更多，追加数据
                this.setData({
                  categoryGoods: this.data.categoryGoods.concat(res.list),
                  hasMore: res.totalPages > page,
                  currentPage: page,
                  loadingMore: false
                });
              }
              
              if (!isRefresh) {
                util.hideLoading();
              }
              
              resolve(res);
            }).catch(err => {
              console.error('获取分类商品失败', err);
              
              if (!isRefresh) {
                util.hideLoading();
              }
              
              this.setData({
                loadingMore: false
              });
              
              reject(err);
            });
            */
        });
    },

    // 加载更多分类商品
    loadMoreCategoryGoods() {
        if (!this.data.hasMore || this.data.loadingMore) {
            return;
        }

        this.setData({
            loadingMore: true
        });

        const nextPage = this.data.currentPage + 1;
        this.loadCategoryGoods(this.data.currentCategory, nextPage);
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
        // 根据轮播图设置的链接类型和链接地址进行跳转
        if (item.link_type === 1 && item.link) {
            // 商品详情
            wx.navigateTo({
                url: '/pages/goods-detail/goods-detail?id=' + item.link
            });
        } else if (item.link_type === 2 && item.link) {
            // 分类列表
            wx.navigateTo({
                url: '/pages/goods-list/goods-list?categoryId=' + item.link
            });
        }
        // 其他类型可以根据需求添加
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
        this.setData({
            currentCategory: id,
            currentPage: 1,
            hasMore: true,
            loadingMore: false,
            lastLoadedItemCount: 0
        });

        // 加载该分类的商品
        this.loadCategoryGoods(id, 1);
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
