const app = getApp();
const util = require('../../utils/util.js');

Page({
    data: {
        imageSrc: '',
        apiResult: '',
        serverUrl: 'http://192.168.0.131:8080',
        filePath: '',
        uploadResult: '',
        imageList: []
    },

    onLoad: function () {
        // 页面加载时自动获取服务器图片列表
        this.getImageList();
    },

    // 测试图片加载
    testImageLoad() {
        // 测试加载静态轮播图
        this.setData({
            imageSrc: this.data.serverUrl + '/uploads/banners/banner1.jpg'
        });
    },

    // 测试API调用
    testApiCall() {
        wx.request({
            url: this.data.serverUrl + '/api/health',
            success: (res) => {
                this.setData({
                    apiResult: JSON.stringify(res.data)
                });
            },
            fail: (err) => {
                this.setData({
                    apiResult: '请求失败: ' + JSON.stringify(err)
                });
                util.showErrorToast('API请求失败');
            }
        });
    },

    // 选择文件上传
    chooseImage() {
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePaths = res.tempFilePaths;
                this.setData({
                    filePath: tempFilePaths[0]
                });
            }
        });
    },

    // 上传图片到服务器
    uploadImage() {
        if (!this.data.filePath) {
            util.showErrorToast('请先选择图片');
            return;
        }

        wx.showLoading({
            title: '上传中...',
        });

        wx.uploadFile({
            url: this.data.serverUrl + '/api/upload/image',
            filePath: this.data.filePath,
            name: 'file',
            header: {
                'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            success: (res) => {
                try {
                    const result = JSON.parse(res.data);
                    this.setData({
                        uploadResult: '上传成功：' + result.data.url
                    });
                    // 上传成功后刷新图片列表
                    this.getImageList();
                } catch (e) {
                    this.setData({
                        uploadResult: '解析响应失败: ' + res.data
                    });
                }
            },
            fail: (err) => {
                this.setData({
                    uploadResult: '上传失败: ' + JSON.stringify(err)
                });
                util.showErrorToast('上传失败');
            },
            complete: () => {
                wx.hideLoading();
            }
        });
    },

    // 获取服务器图片列表
    getImageList() {
        wx.request({
            url: this.data.serverUrl + '/api/upload/list',
            method: 'GET',
            header: {
                'Authorization': 'Bearer ' + wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data && res.data.code === 200) {
                    this.setData({
                        imageList: res.data.data || []
                    });
                }
            },
            fail: (err) => {
                console.error('获取图片列表失败', err);
            }
        });
    }
}); 