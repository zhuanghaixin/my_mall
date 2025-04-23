// 引入地址API服务
const addressApi = require('../../../api/address');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressList: [],
        selectedId: null, // 用于选择地址场景
        from: '' // 来源页面标识，如'checkout'表示从结算页来
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 处理选择地址的场景
        if (options.selectedId) {
            this.setData({
                selectedId: parseInt(options.selectedId)
            });
        }

        // 记录来源页面
        if (options.from) {
            this.setData({
                from: options.from
            });
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.fetchAddressList();
    },

    /**
     * 获取地址列表
     */
    fetchAddressList() {
        wx.showLoading({
            title: '加载中',
        });

        addressApi.getAddressList()
            .then(res => {
                console.log('获取地址列表', res);
                if (res.code === 200) {
                    // 处理地址列表数据
                    const addressList = res.data.map(item => {
                        return {
                            ...item,
                            // 生成完整的地址字符串，方便显示
                            fullAddress: `${item.province}${item.city}${item.district}${item.detail}`
                        };
                    });

                    this.setData({
                        addressList
                    });
                } else {
                    wx.showToast({
                        title: res.message || '获取地址列表失败',
                        icon: 'none'
                    });
                }
            })
            .catch(err => {
                wx.showToast({
                    title: '获取地址列表失败',
                    icon: 'none'
                });
                console.error('获取地址列表失败', err);
            })
            .finally(() => {
                wx.hideLoading();
            });
    },

    /**
     * 处理添加地址
     */
    handleAdd() {
        wx.navigateTo({
            url: '/pages/address/edit/index'
        });
    },

    /**
     * 处理编辑地址
     */
    handleEdit(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/address/edit/index?id=${id}`
        });
    },

    /**
     * 设置默认地址
     */
    handleSetDefault(e) {
        const id = e.currentTarget.dataset.id;

        wx.showLoading({
            title: '设置中',
        });

        addressApi.setDefaultAddress(id)
            .then(res => {
                if (res.code === 200) {
                    wx.showToast({
                        title: '设置成功',
                    });
                    // 刷新列表
                    this.fetchAddressList();
                } else {
                    wx.showToast({
                        title: res.message || '设置失败',
                        icon: 'none'
                    });
                }
            })
            .catch(err => {
                wx.showToast({
                    title: '设置失败',
                    icon: 'none'
                });
                console.error('设置默认地址失败', err);
            })
            .finally(() => {
                wx.hideLoading();
            });
    },

    /**
     * 删除地址
     */
    handleDelete(e) {
        const id = e.currentTarget.dataset.id;

        wx.showModal({
            title: '提示',
            content: '确定要删除这个地址吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '删除中',
                    });

                    addressApi.deleteAddress(id)
                        .then(res => {
                            if (res.code === 200) {
                                wx.showToast({
                                    title: '删除成功',
                                });
                                // 刷新列表
                                this.fetchAddressList();
                            } else {
                                wx.showToast({
                                    title: res.message || '删除失败',
                                    icon: 'none'
                                });
                            }
                        })
                        .catch(err => {
                            wx.showToast({
                                title: '删除失败',
                                icon: 'none'
                            });
                            console.error('删除地址失败', err);
                        })
                        .finally(() => {
                            wx.hideLoading();
                        });
                }
            }
        });
    },

    /**
     * 选择地址（从结算页进入时）
     */
    handleSelect(e) {
        if (this.data.from === 'checkout') {
            const id = e.currentTarget.dataset.id;
            const selectedAddress = this.data.addressList.find(item => item.id === id);

            // 更新选中状态
            const addressList = this.data.addressList.map(item => {
                return {
                    ...item,
                    selected: item.id === id
                };
            });

            this.setData({
                addressList,
                selectedId: id
            });

            if (selectedAddress) {
                // 显示已选择提示
                wx.showToast({
                    title: '地址已选择',
                    icon: 'success',
                    duration: 1000
                });

                // 延迟返回，让用户看到选中效果
                setTimeout(() => {
                    // 将选中的地址传回结算页
                    const pages = getCurrentPages();
                    const prevPage = pages[pages.length - 2]; // 上一个页面

                    prevPage.setData({
                        selectedAddress: selectedAddress
                    });

                    wx.navigateBack();
                }, 1000);
            }
        }
    }
}); 