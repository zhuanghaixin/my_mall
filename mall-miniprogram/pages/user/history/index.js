// pages/user/history/index.js
// 引入历史记录API服务
import historyApi from '../../../api/history'
import cartApi from '../../../api/cart'
import { showToast, showModal, showLoading, hideLoading } from '../../../utils/util'
import goodsApi from '../../../api/goods'
import util from '../../../utils/util.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyList: [],
    loading: false,
    loadingMore: false,
    pageNum: 1,
    pageSize: 10,
    hasMore: true,
    initialLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchHistoryList(true);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示时刷新数据
    if (!this.data.initialLoading) {
      this.setData({
        pageNum: 1,
        historyList: [],
        hasMore: true
      });
      this.fetchHistoryList(true);
    }
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
    this.setData({ pageNum: 1 });
    this.fetchHistoryList(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.fetchHistoryList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 获取浏览历史列表
   * @param {boolean} refresh 是否刷新列表
   */
  fetchHistoryList: function (refresh = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    const { pageNum, pageSize } = this.data;
    const currentPage = refresh ? 1 : pageNum;

    return historyApi.getBrowseHistoryList({ pageNum: currentPage, pageSize })
      .then(res => {
        if (res && res.success) {
          const newList = refresh ? res.data.list : [...this.data.historyList, ...res.data.list];

          this.setData({
            historyList: newList,
            hasMore: newList.length < res.data.total,
            pageNum: currentPage + 1,
            initialLoading: false
          });
        } else {
          showToast('获取历史记录失败');
        }
      })
      .catch(err => {
        console.error('获取浏览历史失败', err);
        showToast('获取历史记录失败');
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  /**
   * 跳转到商品详情
   */
  handleItemTap: function (e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/index?id=${id}`
    });
  },

  /**
   * 添加到购物车
   */
  async handleAddToCart(e) {
    const { id } = e.currentTarget.dataset;
    try {
      const result = await cartApi.addToCart({
        goodsId: id,
        count: 1
      });

      if (result && result.success) {
        showToast('已加入购物车');
      } else {
        showToast('加入购物车失败');
      }
    } catch (error) {
      console.error('加入购物车出错：', error);
      showToast('操作失败，请重试');
    }
  },

  /**
   * 删除单个历史记录
   */
  async handleDelete(e) {
    const { id } = e.currentTarget.dataset;
    try {
      const confirm = await showModal({
        title: '提示',
        content: '确定要删除此历史记录吗？'
      });

      if (confirm.confirm) {
        const result = await historyApi.deleteHistory(id);

        if (result && result.success) {
          // 更新列表
          this.setData({
            historyList: this.data.historyList.filter(item => item.id !== id)
          });
          showToast('删除成功');
        } else {
          showToast('删除失败');
        }
      }
    } catch (error) {
      console.error('删除历史记录出错：', error);
      showToast('操作失败，请重试');
    }
  },

  /**
   * 清空所有历史记录
   */
  async handleClearAll() {
    if (this.data.historyList.length === 0) {
      showToast('暂无浏览记录');
      return;
    }

    try {
      const res = await showModal({
        title: '提示',
        content: '确定要清空所有浏览记录吗？'
      });

      if (res.confirm) {
        const result = await historyApi.clearBrowseHistory();
        if (result && result.success) {
          this.setData({
            historyList: [],
            pageNum: 1,
            hasMore: false
          });
          showToast('已清空浏览记录');
        } else {
          showToast('清空失败，请重试');
        }
      }
    } catch (error) {
      console.error('清空历史记录出错：', error);
      showToast('操作失败，请重试');
    }
  },

  /**
   * 跳转到商城首页
   */
  goToShop: function () {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})