// 引入地址API服务
const addressApi = require('../../../api/address');
// 引入地区数据
const regionData = require('../../../utils/region-data');
const { showToast, showLoading, hideLoading } = require('../../../utils/util');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressId: '',
        name: '',
        phone: '',
        province: '',
        provinceName: '',
        city: '',
        cityName: '',
        district: '',
        districtName: '',
        detail: '',
        isDefault: false,
        provinces: regionData.provinces,
        cities: [],
        districts: [],
        regionVisible: false,
        addressId: null,
        isEdit: false,
        addressData: {
            name: '',
            phone: '',
            province: '',
            city: '',
            district: '',
            detail: '',
            is_default: 0
        },
        // 地区选择器相关数据
        showRegion: false,
        provinces: [],
        cities: [],
        districts: [],
        regionValue: [0, 0, 0],
        tempRegion: {
            province: '',
            city: '',
            district: ''
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 初始化地区数据
        this.initRegionData();

        // 编辑模式
        if (options.id) {
            const id = options.id;
            this.setData({
                addressId: id,
                isEdit: true
            });
            this.fetchAddressDetail(id);
        }
    },

    /**
     * 初始化地区数据
     */
    initRegionData() {
        // 假设regionData是一个包含省市区数据的对象
        // 格式: { provinces: [], cities: { province_id: [] }, districts: { city_id: [] } }
        const provinces = regionData.provinces.map(item => item.name);

        // 默认显示第一个省的城市
        const provinceId = regionData.provinces[0].id;
        const cities = regionData.cities[provinceId].map(item => item.name);

        // 默认显示第一个城市的区县
        const cityId = regionData.cities[provinceId][0].id;
        const districts = regionData.districts[cityId].map(item => item.name);

        this.setData({
            provinces,
            cities,
            districts
        });
    },

    /**
     * 获取地址详情
     */
    fetchAddressDetail(id) {
        wx.showLoading({
            title: '加载中',
        });

        addressApi.getAddressDetail(id)
            .then(res => {
                if (res.code === 200 && res.data) {
                    const addressData = res.data;

                    this.setData({
                        addressData: {
                            name: addressData.name || '',
                            phone: addressData.phone || '',
                            province: addressData.province || '',
                            city: addressData.city || '',
                            district: addressData.district || '',
                            detail: addressData.detail || '',
                            is_default: addressData.is_default || 0
                        }
                    });

                    // 设置地区选择器的值
                    this.setRegionValue(addressData.province, addressData.city, addressData.district);
                } else {
                    wx.showToast({
                        title: res.message || '获取地址详情失败',
                        icon: 'none'
                    });
                }
            })
            .catch(err => {
                wx.showToast({
                    title: '获取地址详情失败',
                    icon: 'none'
                });
                console.error('获取地址详情失败', err);
            })
            .finally(() => {
                wx.hideLoading();
            });
    },

    /**
     * 根据省市区名称设置地区选择器的值
     */
    setRegionValue(province, city, district) {
        if (!province || !city || !district) return;

        // 查找省份索引
        const provinceIndex = this.data.provinces.findIndex(item => item === province);
        if (provinceIndex === -1) return;

        // 根据省份获取城市列表
        const provinceId = regionData.provinces[provinceIndex].id;
        const cities = regionData.cities[provinceId].map(item => item.name);

        // 查找城市索引
        const cityIndex = cities.findIndex(item => item === city);
        if (cityIndex === -1) return;

        // 根据城市获取区县列表
        const cityId = regionData.cities[provinceId][cityIndex].id;
        const districts = regionData.districts[cityId].map(item => item.name);

        // 查找区县索引
        const districtIndex = districts.findIndex(item => item === district);
        if (districtIndex === -1) return;

        // 设置选择器的值
        this.setData({
            cities,
            districts,
            regionValue: [provinceIndex, cityIndex, districtIndex],
            tempRegion: {
                province,
                city,
                district
            }
        });
    },

    /**
     * 处理表单输入变化
     */
    handleInputChange(e) {
        const field = e.currentTarget.dataset.field;
        const value = e.detail.value;

        this.setData({
            [`addressData.${field}`]: value
        });
    },

    /**
     * 处理默认地址开关变化
     */
    handleDefaultChange(e) {
        const value = e.detail.value ? 1 : 0;

        this.setData({
            'addressData.is_default': value
        });
    },

    /**
     * 显示地区选择器
     */
    showRegionPicker() {
        this.setData({
            showRegion: true
        });
    },

    /**
     * 隐藏地区选择器
     */
    cancelRegion() {
        this.setData({
            showRegion: false
        });
    },

    /**
     * 确认地区选择
     */
    confirmRegion() {
        const { tempRegion } = this.data;

        this.setData({
            'addressData.province': tempRegion.province,
            'addressData.city': tempRegion.city,
            'addressData.district': tempRegion.district,
            showRegion: false
        });
    },

    /**
     * 处理地区选择器变化
     */
    handleRegionChange(e) {
        const value = e.detail.value;
        const [provinceIndex, cityIndex, districtIndex] = value;

        // 选择的省份发生变化
        if (provinceIndex !== this.data.regionValue[0]) {
            // 获取新的省份ID
            const provinceId = regionData.provinces[provinceIndex].id;
            // 更新城市列表
            const cities = regionData.cities[provinceId].map(item => item.name);
            // 默认选中第一个城市
            const cityId = regionData.cities[provinceId][0].id;
            // 更新区县列表
            const districts = regionData.districts[cityId].map(item => item.name);

            this.setData({
                cities,
                districts,
                regionValue: [provinceIndex, 0, 0],
                tempRegion: {
                    province: this.data.provinces[provinceIndex],
                    city: cities[0],
                    district: districts[0]
                }
            });
            return;
        }

        // 选择的城市发生变化
        if (cityIndex !== this.data.regionValue[1]) {
            // 获取当前省份ID
            const provinceId = regionData.provinces[provinceIndex].id;
            // 获取新的城市ID
            const cityId = regionData.cities[provinceId][cityIndex].id;
            // 更新区县列表
            const districts = regionData.districts[cityId].map(item => item.name);

            this.setData({
                districts,
                regionValue: [provinceIndex, cityIndex, 0],
                tempRegion: {
                    province: this.data.provinces[provinceIndex],
                    city: this.data.cities[cityIndex],
                    district: districts[0]
                }
            });
            return;
        }

        // 选择的区县发生变化
        if (districtIndex !== this.data.regionValue[2]) {
            this.setData({
                regionValue: [provinceIndex, cityIndex, districtIndex],
                tempRegion: {
                    province: this.data.provinces[provinceIndex],
                    city: this.data.cities[cityIndex],
                    district: this.data.districts[districtIndex]
                }
            });
        }
    },

    /**
     * 保存地址
     */
    handleSave() {
        const { addressData, isEdit, addressId } = this.data;

        // 表单验证
        if (!addressData.name) {
            return wx.showToast({
                title: '请输入收货人姓名',
                icon: 'none'
            });
        }

        if (!addressData.phone) {
            return wx.showToast({
                title: '请输入手机号码',
                icon: 'none'
            });
        }

        // 验证手机号格式
        const phoneReg = /^1[3-9]\d{9}$/;
        if (!phoneReg.test(addressData.phone)) {
            return wx.showToast({
                title: '手机号格式不正确',
                icon: 'none'
            });
        }

        if (!addressData.province || !addressData.city || !addressData.district) {
            return wx.showToast({
                title: '请选择所在地区',
                icon: 'none'
            });
        }

        if (!addressData.detail) {
            return wx.showToast({
                title: '请输入详细地址',
                icon: 'none'
            });
        }

        wx.showLoading({
            title: '保存中',
        });

        // 编辑地址
        if (isEdit && addressId) {
            addressApi.updateAddress(addressId, addressData)
                .then(res => {
                    if (res.code === 200) {
                        wx.showToast({
                            title: '保存成功',
                        });
                        // 返回上一页
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1500);
                    } else {
                        wx.showToast({
                            title: res.message || '保存失败',
                            icon: 'none'
                        });
                    }
                })
                .catch(err => {
                    wx.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                    console.error('保存地址失败', err);
                })
                .finally(() => {
                    wx.hideLoading();
                });
        }
        // 新增地址
        else {
            addressApi.addAddress(addressData)
                .then(res => {
                    if (res.code === 200) {
                        wx.showToast({
                            title: '保存成功',
                        });
                        // 返回上一页
                        setTimeout(() => {
                            wx.navigateBack();
                        }, 1500);
                    } else {
                        wx.showToast({
                            title: res.message || '保存失败',
                            icon: 'none'
                        });
                    }
                })
                .catch(err => {
                    wx.showToast({
                        title: '保存失败',
                        icon: 'none'
                    });
                    console.error('保存地址失败', err);
                })
                .finally(() => {
                    wx.hideLoading();
                });
        }
    }
}); 