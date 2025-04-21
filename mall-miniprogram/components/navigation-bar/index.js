Component({
    properties: {
        title: {
            type: String,
            value: '商城小程序'
        },
        back: {
            type: Boolean,
            value: false
        },
        color: {
            type: String,
            value: "#000000"
        },
        background: {
            type: String,
            value: "#ffffff"
        },
        fixed: {
            type: Boolean,
            value: true
        }
    },
    data: {
        statusBarHeight: 0,
        navBarHeight: 0
    },
    lifetimes: {
        attached() {
            // 获取状态栏高度
            const systemInfo = wx.getSystemInfoSync();
            const statusBarHeight = systemInfo.statusBarHeight;
            const isIOS = systemInfo.system.indexOf('iOS') > -1;
            let navBarHeight;

            if (isIOS) {
                navBarHeight = 44;
            } else {
                navBarHeight = 48;
            }

            this.setData({
                statusBarHeight,
                navBarHeight
            });
        }
    },
    methods: {
        handleBack() {
            if (this.data.back) {
                wx.navigateBack({
                    delta: 1
                });
            }
        }
    }
}) 