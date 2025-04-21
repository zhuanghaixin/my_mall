// pages/category/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeCategory: 0,
    categories: [
      { id: 1, name: '手机数码' },
      { id: 2, name: '家用电器' },
      { id: 3, name: '电脑办公' },
      { id: 4, name: '服装鞋包' },
      { id: 5, name: '美妆个护' },
      { id: 6, name: '食品生鲜' },
      { id: 7, name: '家居家装' },
      { id: 8, name: '母婴玩具' }
    ],
    currentCategory: { id: 1, name: '手机数码' },
    currentSubcategories: [
      { id: 101, name: '手机', icon: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 102, name: '平板', icon: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 103, name: '相机', icon: 'https://img.yzcdn.cn/vant/apple-3.jpg' },
      { id: 104, name: '耳机', icon: 'https://img.yzcdn.cn/vant/apple-4.jpg' },
      { id: 105, name: '配件', icon: 'https://img.yzcdn.cn/vant/apple-5.jpg' },
      { id: 106, name: '智能手表', icon: 'https://img.yzcdn.cn/vant/apple-6.jpg' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 可以在这里加载分类数据
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  onCategoryChange(event) {
    const activeCategory = event.detail;
    const currentCategory = this.data.categories[activeCategory];

    // 模拟切换分类后的子分类数据
    const currentSubcategories = [
      { id: 100 + activeCategory * 10 + 1, name: '子分类1', icon: 'https://img.yzcdn.cn/vant/apple-1.jpg' },
      { id: 100 + activeCategory * 10 + 2, name: '子分类2', icon: 'https://img.yzcdn.cn/vant/apple-2.jpg' },
      { id: 100 + activeCategory * 10 + 3, name: '子分类3', icon: 'https://img.yzcdn.cn/vant/apple-3.jpg' },
      { id: 100 + activeCategory * 10 + 4, name: '子分类4', icon: 'https://img.yzcdn.cn/vant/apple-4.jpg' }
    ];

    this.setData({
      activeCategory,
      currentCategory,
      currentSubcategories
    });
  },

  onSubcategoryTap(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/list/index?category_id=${id}`
    });
  }
})