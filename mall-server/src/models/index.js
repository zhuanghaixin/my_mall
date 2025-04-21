/**
 * 模型索引文件
 * 集中导出所有数据模型
 */

const Admin = require('./admin');
const Goods = require('./goods');
const Category = require('./category');
const Banner = require('./banner');
const User = require('./user');

// 设置模型之间的关联关系
// 分类与商品的一对多关系
Category.hasMany(Goods, { foreignKey: 'category_id', as: 'goods' });
Goods.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = {
    Admin,
    Goods,
    Category,
    Banner,
    User
}; 