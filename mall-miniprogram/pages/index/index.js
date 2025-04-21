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
        categoryGoods: []
    },

    // 页面加载
    onLoad() {
        this.loadBanners();
        this.loadRecommendGoods();
        this.loadCategories();
    },

    // 页面显示
    onShow() {

    },

    // 页面下拉刷新
    onPullDownRefresh() {
        this.loadBanners();
        this.loadRecommendGoods();
        this.loadCategories();
        // 停止下拉刷新
        wx.stopPullDownRefresh();
    },

    // 页面上拉触底
    onReachBottom() {
        // 加载更多分类商品
        if (this.data.currentCategory !== 0) {
            this.loadMoreCategoryGoods();
        }
    },

    // 加载轮播图
    loadBanners() {
        util.showLoading();
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
        util.hideLoading();

        // 实际API调用，等后端API准备好时替换上面的模拟数据
        /* 
        api.home.getBanner().then(res => {
          this.setData({
            banners: res
          });
          util.hideLoading();
        }).catch(err => {
          console.error('获取轮播图失败', err);
          util.hideLoading();
        });
        */
    },

    // 加载推荐商品
    loadRecommendGoods() {
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

        // 实际API调用，等后端API准备好时替换上面的模拟数据
        /*
        api.home.getRecommend().then(res => {
          this.setData({
            recommendGoods: res
          });
        }).catch(err => {
          console.error('获取推荐商品失败', err);
        });
        */
    },

    // 加载分类
    loadCategories() {
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
            currentCategory: categories[0].id
        });

        // 加载第一个分类的商品
        this.loadCategoryGoods(categories[0].id);

        // 实际API调用，等后端API准备好时替换上面的模拟数据
        /*
        api.category.getCategoryList().then(res => {
          if (res && res.length > 0) {
            this.setData({
              categories: res,
              currentCategory: res[0].id
            });
            
            // 加载第一个分类的商品
            this.loadCategoryGoods(res[0].id);
          }
        }).catch(err => {
          console.error('获取分类失败', err);
        });
        */
    },

    // 加载分类商品
    loadCategoryGoods(categoryId, page = 1, size = 6) {
        util.showLoading();

        // 使用本地模拟数据
        const categoryGoods = [
            {
                id: 5,
                name: '分类商品1',
                primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                retail_price: '59.00',
                goods_number: 100
            },
            {
                id: 6,
                name: '分类商品2',
                primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                retail_price: '79.00',
                goods_number: 50
            },
            {
                id: 7,
                name: '分类商品3',
                primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                retail_price: '89.00',
                goods_number: 85
            },
            {
                id: 8,
                name: '分类商品4',
                primary_pic_url: 'https://img.yzcdn.cn/vant/cat.jpeg',
                retail_price: '109.00',
                goods_number: 120
            }
        ];

        this.setData({
            categoryGoods: categoryGoods
        });
        util.hideLoading();

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
              categoryGoods: res.list
            });
          } else {
            // 加载更多，追加数据
            this.setData({
              categoryGoods: this.data.categoryGoods.concat(res.list)
            });
          }
          util.hideLoading();
        }).catch(err => {
          console.error('获取分类商品失败', err);
          util.hideLoading();
        });
        */
    },

    // 加载更多分类商品
    loadMoreCategoryGoods() {
        // 实际实现时，这里需要记录当前页码，然后加载下一页
        // this.loadCategoryGoods(this.data.currentCategory, this.data.currentPage + 1);
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
            currentCategory: id
        });

        // 加载该分类的商品
        this.loadCategoryGoods(id);
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
