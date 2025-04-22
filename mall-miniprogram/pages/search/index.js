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
        loading: false, // 加载状态
        userId: '', // 用户ID
        openid: '' // 微信openid
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 获取用户信息
        this.getUserInfo();

        // 加载搜索历史
        this.loadSearchHistory();

        // 加载热门搜索词
        this.loadHotSearch();
    },

    /**
     * 获取用户信息
     */
    getUserInfo: function () {
        // 从全局数据或缓存中获取用户信息
        const app = getApp();
        if (app.globalData.userInfo) {
            this.setData({
                userId: app.globalData.userInfo.id || '',
                openid: app.globalData.userInfo.openid || ''
            });
        } else {
            // 如果全局没有，尝试从存储获取
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo) {
                this.setData({
                    userId: userInfo.id || '',
                    openid: userInfo.openid || ''
                });
            }
        }
    },

    /**
     * 加载搜索历史
     */
    loadSearchHistory: function () {
        this.setData({ loading: true });

        // 判断是否登录，使用后端API获取搜索历史
        if (this.data.userId || this.data.openid) {
            searchApi.getSearchHistory()
                .then(res => {
                    if (res.code === 200) {
                        this.setData({
                            historyList: res.data || [],
                            loading: false
                        });
                    } else {
                        // API调用失败，回退到本地存储
                        this.loadLocalSearchHistory();
                    }
                })
                .catch(err => {
                    console.error('获取搜索历史出错:', err);
                    // 出错时回退到本地存储
                    this.loadLocalSearchHistory();
                });
        } else {
            // 未登录时使用本地存储
            this.loadLocalSearchHistory();
        }
    },

    /**
     * 从本地存储加载搜索历史
     */
    loadLocalSearchHistory: function () {
        // 从本地存储中获取搜索历史
        const historyList = wx.getStorageSync('searchHistory') || [];
        this.setData({
            historyList,
            loading: false
        });
    },

    /**
     * 加载热门搜索词
     */
    loadHotSearch: function () {
        this.setData({ loading: true });

        searchApi.getHotSearch()
            .then(res => {
                if (res.code === 200) {
                    this.setData({
                        hotList: res.data || [],
                        loading: false
                    });
                } else {
                    this.setData({ loading: false });
                    util.showErrorToast('获取热门搜索失败');
                }
            })
            .catch(err => {
                console.error('获取热门搜索出错:', err);
                this.setData({ loading: false });

                // 发生错误时使用默认数据
                const defaultHotList = [
                    '手机', '电脑', '女装', '男装', '家具',
                    '电视', '冰箱', '洗衣机', '空调', '食品'
                ];
                this.setData({ hotList: defaultHotList });
            });
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
        // 判断是否登录，使用后端API保存搜索历史
        if (this.data.userId || this.data.openid) {
            // 通过搜索功能间接保存搜索历史
            searchApi.searchGoods({ keyword })
                .then(res => {
                    // 更新本地搜索历史视图
                    this.loadSearchHistory();
                })
                .catch(err => {
                    console.error('保存搜索历史出错:', err);
                    // 出错时使用本地存储保存
                    this.saveLocalSearchHistory(keyword);
                });
        } else {
            // 未登录时使用本地存储
            this.saveLocalSearchHistory(keyword);
        }
    },

    /**
     * 保存到本地搜索历史
     */
    saveLocalSearchHistory: function (keyword) {
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
                    // 判断是否登录，使用后端API清除搜索历史
                    if (this.data.userId || this.data.openid) {
                        searchApi.clearSearchHistory()
                            .then(res => {
                                if (res.code === 200) {
                                    this.setData({ historyList: [] });
                                    util.showToast('清除成功');
                                } else {
                                    util.showErrorToast('清除失败：' + (res.msg || '未知错误'));
                                }
                            })
                            .catch(err => {
                                console.error('清除搜索历史出错:', err);
                                util.showErrorToast('网络错误，请重试');
                            });
                    } else {
                        // 未登录时清除本地存储
                        wx.removeStorageSync('searchHistory');
                        this.setData({ historyList: [] });
                        util.showToast('清除成功');
                    }
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