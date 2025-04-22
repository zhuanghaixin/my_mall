// pages/category/index.js
const categoryApi = require('../../api/category.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeCategory: 0,
    categories: [], // 一级分类列表
    currentCategory: {}, // 当前选中的一级分类
    currentSubcategories: [], // 当前选中分类的子分类
    loadingCategories: true, // 加载分类中
    loadingGoods: false, // 加载商品中
    goodsList: [], // 商品列表
    goodsTotal: 0, // 商品总数
    goodsPage: 1, // 当前页码
    goodsPageSize: 10, // 每页数量
    reachBottom: false // 是否到底了
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 加载分类数据
    this.loadCategories();

    // 如果有分类ID参数，跳转到对应分类
    if (options.categoryId) {
      const categoryId = parseInt(options.categoryId);
      this.switchToCategory(categoryId);
    }
  },

  /**
   * 加载分类数据
   */
  loadCategories() {
    this.setData({ loadingCategories: true });

    categoryApi.getCategoryTree().then(res => {
      if (res.code === 200 && res.data && res.data.length > 0) {
        const categories = res.data;
        const currentCategory = categories[0];
        const currentSubcategories = currentCategory.children || [];

        this.setData({
          categories,
          currentCategory,
          currentSubcategories,
          activeCategory: 0
        });

        // 加载该分类下的商品
        if (currentCategory.id) {
          this.loadCategoryGoods(currentCategory.id);
        }
      } else {
        wx.showToast({
          title: '获取分类数据失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('获取分类数据出错:', err);
      wx.showToast({
        title: '获取分类数据失败',
        icon: 'none'
      });
    }).finally(() => {
      this.setData({ loadingCategories: false });
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载分类下的商品
   */
  loadCategoryGoods(categoryId, page = 1, append = false) {
    if (!categoryId) return;

    this.setData({ loadingGoods: true });

    const params = {
      page: page,
      pageSize: this.data.goodsPageSize
    };

    categoryApi.getCategoryGoods(categoryId, params).then(res => {
      if (res.code === 200) {
        const goodsList = append ? [...this.data.goodsList, ...res.data.list] : res.data.list;
        const reachBottom = goodsList.length >= res.data.total;

        this.setData({
          goodsList,
          goodsPage: res.data.page,
          goodsTotal: res.data.total,
          reachBottom
        });
      } else {
        wx.showToast({
          title: '获取商品列表失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('获取商品列表出错:', err);
      wx.showToast({
        title: '获取商品列表失败',
        icon: 'none'
      });
    }).finally(() => {
      this.setData({ loadingGoods: false });
    });
  },

  /**
   * 切换到指定ID的分类
   */
  switchToCategory(categoryId) {
    const { categories } = this.data;
    const index = categories.findIndex(item => item.id === categoryId);

    if (index !== -1) {
      this.onCategoryChange({ detail: index });
    }
  },

  /**
   * 分类切换事件
   */
  onCategoryChange(event) {
    const activeCategory = event.detail;
    const currentCategory = this.data.categories[activeCategory];
    const currentSubcategories = currentCategory.children || [];

    this.setData({
      activeCategory,
      currentCategory,
      currentSubcategories,
      goodsList: [],
      goodsPage: 1,
      reachBottom: false
    });

    // 加载新选中分类的商品
    this.loadCategoryGoods(currentCategory.id);
  },

  /**
   * 点击子分类
   */
  onSubcategoryTap(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/list/index?category_id=${id}`
    });
  },

  /**
   * 点击商品
   */
  onGoodsTap(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/detail/index?id=${id}`
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 重新加载分类数据
    this.loadCategories();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.reachBottom || this.data.loadingGoods) return;

    const nextPage = this.data.goodsPage + 1;
    const categoryId = this.data.currentCategory.id;

    this.loadCategoryGoods(categoryId, nextPage, true);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})