/**
 * 模型索引文件
 * 集中导出所有数据模型
 */

const Admin = require('./admin');
const Goods = require('./goods');
const Category = require('./category');
const Banner = require('./banner');
const User = require('./user');
const Order = require('./order');
const OrderGoods = require('./orderGoods');
const SearchHot = require('./searchHot');
const SearchHistory = require('./searchHistory');

// 设置模型之间的关联关系
// 分类与商品的一对多关系
Category.hasMany(Goods, { foreignKey: 'category_id', as: 'goods' });
Goods.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 用户与订单的一对多关系
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 订单与订单商品的一对多关系
Order.hasMany(OrderGoods, { foreignKey: 'order_id', as: 'orderGoods' });
OrderGoods.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 商品与订单商品的一对多关系
Goods.hasMany(OrderGoods, { foreignKey: 'goods_id', as: 'orderGoods' });
OrderGoods.belongsTo(Goods, { foreignKey: 'goods_id', as: 'goods' });

// 用户与搜索历史的一对多关系
User.hasMany(SearchHistory, { foreignKey: 'user_id', as: 'searchHistories' });
SearchHistory.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
    Admin,
    Goods,
    Category,
    Banner,
    User,
    Order,
    OrderGoods,
    SearchHot,
    SearchHistory
}; 