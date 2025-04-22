/**
 * 搜索页面
 */
const searchApi = require('../../api/search');
const util = require('../../utils/util');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        searchValue: '', // 搜索框的值
        historyList: [], // 搜索历史列表
        hotList: [], // 热门搜索列表
        loading: false // 加载状态
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 加载搜索历史
        this.loadSearchHistory();

        // 加载热门搜索词
        this.loadHotSearch();
    },

    /**
     * 加载搜索历史
     */
    loadSearchHistory: function () {
        // 从本地存储中获取搜索历史
        const historyList = wx.getStorageSync('searchHistory') || [];
        this.setData({ historyList });
    },

    /**
     * 加载热门搜索词
     */
    loadHotSearch: function () {
        this.setData({ loading: true });

        // 这里可以调用后端API获取热门搜索词
        // 如果后端接口还未完成，使用模拟数据
        const mockHotList = [
            '手机', '电脑', '女装', '男装', '家具',
            '电视', '冰箱', '洗衣机', '空调', '食品'
        ];

        setTimeout(() => {
            this.setData({
                hotList: mockHotList,
                loading: false
            });
        }, 500);

        // 实际API调用(待接口联调)
        /*
        searchApi.getHotSearch().then(res => {
          if (res.code === 200) {
            this.setData({
              hotList: res.data || [],
              loading: false
            });
          } else {
            this.setData({ loading: false });
            util.showErrorToast('获取热门搜索失败');
          }
        }).catch(err => {
          console.error('获取热门搜索出错:', err);
          this.setData({ loading: false });
          util.showErrorToast('网络错误，请重试');
        });
        */
    },

    /**
     * 输入框内容变化
     */
    onSearchInput: function (e) {
        this.setData({
            searchValue: e.detail
        });
    },

    /**
     * 执行搜索
     */
    onSearch: function () {
        const keyword = this.data.searchValue.trim();
        if (!keyword) {
            util.showToast('请输入搜索关键词');
            return;
        }

        // 保存到搜索历史
        this.saveSearchHistory(keyword);

        // 跳转到商品列表页
        this.navigateToGoodsList(keyword);
    },

    /**
     * 点击搜索历史或热门搜索
     */
    onTagTap: function (e) {
        const keyword = e.currentTarget.dataset.keyword;

        // 设置搜索框的值
        this.setData({ searchValue: keyword });

        // 保存到搜索历史
        this.saveSearchHistory(keyword);

        // 跳转到商品列表页
        this.navigateToGoodsList(keyword);
    },

    /**
     * 保存搜索历史
     */
    saveSearchHistory: function (keyword) {
        let historyList = wx.getStorageSync('searchHistory') || [];

        // 如果已存在，则移除旧记录
        historyList = historyList.filter(item => item !== keyword);

        // 添加到开头
        historyList.unshift(keyword);

        // 最多保存10条历史记录
        if (historyList.length > 10) {
            historyList = historyList.slice(0, 10);
        }

        // 保存到本地存储
        wx.setStorageSync('searchHistory', historyList);

        // 更新页面数据
        this.setData({ historyList });
    },

    /**
     * 清除搜索历史
     */
    onClearHistory: function () {
        wx.showModal({
            title: '提示',
            content: '确定要清除搜索历史吗？',
            success: res => {
                if (res.confirm) {
                    // 清除本地存储中的搜索历史
                    wx.removeStorageSync('searchHistory');
                    // 更新页面数据
                    this.setData({ historyList: [] });
                    util.showToast('清除成功');
                }
            }
        });
    },

    /**
     * 跳转到商品列表页
     */
    navigateToGoodsList: function (keyword) {
        wx.navigateTo({
            url: `/pages/goods/list/index?keyword=${encodeURIComponent(keyword)}`
        });
    },

    /**
     * 取消搜索，返回上一页
     */
    onSearchCancel: function () {
        wx.navigateBack();
    }
}); 