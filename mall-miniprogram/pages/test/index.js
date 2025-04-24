const app = getApp();
const util = require('../../utils/util.js');
const { getEnv, getApiBaseUrl, setEnv, getAllEnvs } = require('../../config/env.js');

// 获取当前环境配置
const currentEnv = getEnv();
// 获取API基础URL（不包含/api前缀）
const getServerUrl = () => {
    const env = getEnv();
    // 处理标准端口
    const isHttps = env.apiHost.startsWith('https://');
    if ((isHttps && env.apiPort === '443') || (!isHttps && env.apiPort === '80')) {
        return `${env.apiHost}`;
    }
    return `${env.apiHost}:${env.apiPort}`;
};

Page({
    data: {
        imageSrc: '',
        apiResult: '',
        serverUrl: '',
        filePath: '',
        uploadResult: '',
        imageList: [],
        currentEnv: '',
        availableEnvs: [], // 可用的环境列表
        showEnvPicker: false // 是否显示环境选择器
    },

    // 页面的自定义导航配置
    onLoad: function () {
        // 隐藏默认导航栏
        wx.hideNavigationBarLoading();

        this.refreshEnvInfo();

        // 页面加载时自动获取服务器图片列表
        this.getImageList();
    },

    // 刷新环境信息
    refreshEnvInfo() {
        // 获取当前环境
        const env = getEnv();
        // 获取所有可用环境
        const availableEnvs = getAllEnvs();

        // 设置当前环境服务器URL和环境信息
        this.setData({
            serverUrl: getServerUrl(),
            currentEnv: env.envName,
            availableEnvs: availableEnvs
        });

        // 显示当前环境名称
        wx.showToast({
            title: `环境：${env.envName}`,
            icon: 'none',
            duration: 2000
        });
    },

    // 显示环境选择器
    showEnvSelector() {
        this.setData({
            showEnvPicker: true
        });
    },

    // 切换环境
    switchEnv(e) {
        const envName = e.currentTarget.dataset.env;
        if (setEnv(envName)) {
            this.refreshEnvInfo();
            // 重新获取图片列表
            this.getImageList();

            wx.showToast({
                title: `切换到环境：${envName}`,
                icon: 'success',
                duration: 2000
            });
        }

        this.setData({
            showEnvPicker: false
        });
    },

    // 取消选择环境
    cancelEnvSelect() {
        this.setData({
            showEnvPicker: false
        });
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
        const apiUrl = getApiBaseUrl(); // 获取完整API基础URL（包含/api前缀）

        wx.request({
            url: apiUrl + '/health', // 使用API配置，已包含/api前缀，因此不需要再加
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

        const apiUrl = getApiBaseUrl();

        wx.uploadFile({
            url: apiUrl + '/upload/image', // 使用API配置
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
        const apiUrl = getApiBaseUrl();

        wx.request({
            url: apiUrl + '/upload/list', // 使用API配置
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