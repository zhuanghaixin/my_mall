// API基础URL
const ApiBaseUrl = 'http://192.168.0.131:8080/api';

// API接口地址
module.exports = {
    // 基础URL
    BaseUrl: ApiBaseUrl,

    // 用户相关
    UserLogin: ApiBaseUrl + '/user/wxlogin', // 微信登录
    // UserLogin: ApiBaseUrl + '/user/login', // 登录
    // UserRegister: ApiBaseUrl + '/user/register', // 注册
    // UserInfo: ApiBaseUrl + '/user/info', // 获取用户信息
    // UserUpdate: ApiBaseUrl + '/user/update', // 更新用户信息
    PhoneLogin: ApiBaseUrl + '/user/phonelogin', // 手机号登录
    PhoneNumberLogin: ApiBaseUrl + '/user/phonenumberlogin', // 微信手机号登录
    SendSmsCode: ApiBaseUrl + '/user/sendsms', // 发送短信验证码
    UserInfo: ApiBaseUrl + '/user/info', // 获取用户信息
    BindPhone: ApiBaseUrl + '/user/bindphone', // 绑定手机号
    CheckLogin: ApiBaseUrl + '/user/checklogin', // 检查登录状态

    // 首页相关
    Banner: ApiBaseUrl + '/home/banner', // 获取轮播图
    HomeData: ApiBaseUrl + '/home/data', // 获取首页数据
    GoodsRecommend: ApiBaseUrl + '/home/recommend', // 获取推荐商品
    HomeCategories: ApiBaseUrl + '/home/categories', // 获取首页分类及商品

    // 商品相关
    GoodsList: ApiBaseUrl + '/goods/list', // 获取商品列表
    GoodsDetail: ApiBaseUrl + '/goods/detail', // 获取商品详情
    GoodsHot: ApiBaseUrl + '/goods/hot', // 获取热门商品

    // 分类相关
    CategoryList: ApiBaseUrl + '/category/tree', // 获取分类树结构
    CategoryGoods: ApiBaseUrl + '/category/:id/goods', // 获取分类下的商品列表

    // 购物车相关
    CartList: ApiBaseUrl + '/cart/list', // 获取购物车列表
    CartChecked: ApiBaseUrl + '/cart/checked', // 获取购物车已选中商品
    CartAdd: ApiBaseUrl + '/cart/add', // 添加购物车
    CartUpdate: ApiBaseUrl + '/cart/update', // 更新购物车
    CartDelete: ApiBaseUrl + '/cart/delete', // 删除购物车商品
    CartClear: ApiBaseUrl + '/cart/clear', // 清空购物车
    CartCheck: ApiBaseUrl + '/cart/check', // 选择/取消选择购物车商品

    // 订单相关
    OrderCreate: ApiBaseUrl + '/order/create', // 创建订单
    OrderList: ApiBaseUrl + '/order/list', // 获取订单列表
    OrderDetail: ApiBaseUrl + '/order', // 获取订单详情（使用 GET /order/:id）
    OrderCancel: ApiBaseUrl + '/order', // 取消订单（使用 PUT /order/:id/cancel）
    OrderConfirm: ApiBaseUrl + '/order', // 确认收货（使用 PUT /order/:id/confirm）
    OrderDelete: ApiBaseUrl + '/order', // 删除订单（使用 DELETE /order/:id）
    OrderCounts: ApiBaseUrl + '/order/count', // 获取订单数量统计

    // 地址相关
    AddressList: ApiBaseUrl + '/address/list', // 地址列表
    AddressDetail: ApiBaseUrl + '/address', // 地址详情（使用 GET /address/:id）
    AddressAdd: ApiBaseUrl + '/address/add', // 添加地址
    AddressUpdate: ApiBaseUrl + '/address/update', // 更新地址
    AddressDelete: ApiBaseUrl + '/address/delete', // 删除地址
    AddressDefault: ApiBaseUrl + '/address/default', // 设置默认地址
    AddressDefaultGet: ApiBaseUrl + '/address/default', // 获取默认地址

    // 搜索相关
    Search: ApiBaseUrl + '/search', // 搜索商品
    SearchHot: ApiBaseUrl + '/search/hot', // 获取热门搜索词
    SearchHistory: ApiBaseUrl + '/search/history', // 获取搜索历史
    SearchClearHistory: ApiBaseUrl + '/search/clearHistory', // 清除搜索历史

    // 收藏相关
    FavoriteList: ApiBaseUrl + '/favorites/list', // 获取收藏列表
    FavoriteAdd: ApiBaseUrl + '/favorites/add', // 添加收藏
    FavoriteDelete: ApiBaseUrl + '/favorites/delete', // 取消收藏
    FavoriteCheck: ApiBaseUrl + '/favorites/check', // 检查商品是否已收藏

    // 浏览历史相关
    HistoryList: ApiBaseUrl + '/browse/history/list', // 获取浏览历史
    HistoryDelete: ApiBaseUrl + '/browse/history/delete', // 删除单条浏览历史
    HistoryClear: ApiBaseUrl + '/browse/history/clear', // 清空浏览历史

    // 支付相关
    PayWxpay: ApiBaseUrl + '/pay/wxpay', // 获取微信支付参数（使用 POST）
    PayMock: ApiBaseUrl + '/pay/mockpay', // 模拟支付（使用 POST）
    PayStatus: ApiBaseUrl + '/pay/status', // 查询支付状态（使用 GET /pay/status/:orderId）
}; 