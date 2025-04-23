Component({
    data: {
        selected: 0,
        list: [
            {
                pagePath: "/pages/index/index",
                text: "首页",
                iconName: "home-o"
            },
            {
                pagePath: "/pages/category/index",
                text: "分类",
                iconName: "apps-o"
            },
            {
                pagePath: "/pages/cart/index",
                text: "购物车",
                iconName: "cart-o"
            },
            {
                pagePath: "/pages/user/index/index",
                text: "我的",
                iconName: "user-o"
            }
        ]
    },
    lifetimes: {
        attached() {
            this.setCurrentPage();
        },
        ready() {
            this.setCurrentPage();
        }
    },
    pageLifetimes: {
        show: function () {
            this.setCurrentPage();
        }
    },
    methods: {
        onChange(event) {
            const index = event.detail;
            const url = this.data.list[index].pagePath;

            // 避免重复触发
            if (this.data.selected === index) {
                return;
            }

            wx.switchTab({ url });
            this.setData({ selected: index });
        },
        setCurrentPage() {
            const pages = getCurrentPages();
            if (pages.length === 0) {
                return;
            }
            const currentPage = pages[pages.length - 1];
            const route = '/' + currentPage.route;

            const index = this.data.list.findIndex(item => item.pagePath === route);
            if (index !== -1) {
                this.setData({
                    selected: index
                });
            }
        }
    }
}) 