// API地址配置
const API_BASE_URL = 'http://localhost:8080';

// 用户相关接口
const USER = {
    WX_LOGIN: `${API_BASE_URL}/api/user/wxlogin`, // 微信登录
    BIND_PHONE: `${API_BASE_URL}/api/user/bindphone`, // 手机号绑定
    INFO: `${API_BASE_URL}/api/user/info`, // 获取用户信息
    UPDATE_INFO: `${API_BASE_URL}/api/user/info` // 更新用户信息
};

// 商品相关接口
const GOODS = {
    LIST: `${API_BASE_URL}/api/goods/list`, // 获取商品列表
    DETAIL: `${API_BASE_URL}/api/goods/:id`, // 获取商品详情
    RECOMMEND: `${API_BASE_URL}/api/goods/recommend`, // 获取推荐商品
    HOT: `${API_BASE_URL}/api/goods/hot` // 获取热销商品
};

// 分类相关接口
const CATEGORY = {
    LIST: `${API_BASE_URL}/api/category/list`, // 获取分类列表
    DETAIL: `${API_BASE_URL}/api/category/:id`, // 获取分类详情
    GOODS: `${API_BASE_URL}/api/category/:id/goods` // 获取分类商品
};

// 购物车相关接口
const CART = {
    LIST: `${API_BASE_URL}/api/cart/list`, // 获取购物车列表
    ADD: `${API_BASE_URL}/api/cart`, // 添加购物车
    UPDATE: `${API_BASE_URL}/api/cart/:id`, // 更新购物车商品
    DELETE: `${API_BASE_URL}/api/cart/:id`, // 删除购物车商品
    CLEAR: `${API_BASE_URL}/api/cart/clear`, // 清空购物车
    SELECT: `${API_BASE_URL}/api/cart/:id/select`, // 选择/取消选择商品
    SELECT_ALL: `${API_BASE_URL}/api/cart/selectall` // 全选/取消全选
};

// 订单相关接口
const ORDER = {
    CREATE: `${API_BASE_URL}/api/order`, // 创建订单
    LIST: `${API_BASE_URL}/api/order/list`, // 获取订单列表
    DETAIL: `${API_BASE_URL}/api/order/:id`, // 获取订单详情
    CANCEL: `${API_BASE_URL}/api/order/:id/cancel`, // 取消订单
    CONFIRM: `${API_BASE_URL}/api/order/:id/confirm`, // 确认收货
    DELETE: `${API_BASE_URL}/api/order/:id`, // 删除订单
    LOGISTICS: `${API_BASE_URL}/api/order/:id/logistics` // 获取物流信息
};

// 支付相关接口
const PAY = {
    WXPAY: `${API_BASE_URL}/api/pay/wxpay`, // 微信支付
    STATUS: `${API_BASE_URL}/api/pay/status/:orderId` // 支付状态查询
};

// 地址相关接口
const ADDRESS = {
    LIST: `${API_BASE_URL}/api/address/list`, // 获取地址列表
    ADD: `${API_BASE_URL}/api/address`, // 添加地址
    UPDATE: `${API_BASE_URL}/api/address/:id`, // 更新地址
    DELETE: `${API_BASE_URL}/api/address/:id`, // 删除地址
    SET_DEFAULT: `${API_BASE_URL}/api/address/:id/default` // 设置默认地址
};

// 搜索相关接口
const SEARCH = {
    SEARCH: `${API_BASE_URL}/api/search`, // 搜索商品
    HOT: `${API_BASE_URL}/api/search/hot`, // 获取热门搜索词
    HISTORY: `${API_BASE_URL}/api/search/history`, // 获取搜索历史
    CLEAR_HISTORY: `${API_BASE_URL}/api/search/history` // 清除搜索历史
};

// 首页相关接口
const HOME = {
    BANNER: `${API_BASE_URL}/api/home/banner`, // 获取轮播图
    DATA: `${API_BASE_URL}/api/home/data` // 获取首页数据
};

// 文件上传接口
const UPLOAD = {
    IMAGE: `${API_BASE_URL}/api/upload/image`, // 上传图片
    IMAGES: `${API_BASE_URL}/api/upload/images` // 上传多图
};

export default {
    USER,
    GOODS,
    CATEGORY,
    CART,
    ORDER,
    PAY,
    ADDRESS,
    SEARCH,
    HOME,
    UPLOAD
}; 