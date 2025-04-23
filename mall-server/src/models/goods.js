/**
 * 商品模型
 * 定义商品的数据库结构
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Goods = sequelize.define('goods', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '商品ID'
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '分类ID'
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '商品名称'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '商品价格'
    },
    original_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: '原价'
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '库存'
    },
    sales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '销量'
    },
    main_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '主图URL'
    },
    image_url: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.getDataValue('main_image');
        },
        comment: 'main_image的别名，用于兼容'
    },
    cover_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '封面图URL'
    },
    images: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '商品图片，多个图片用逗号分隔'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '商品描述'
    },
    detail: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: '商品详情'
    },
    is_recommend: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '是否推荐：0不推荐，1推荐'
    },
    sale_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '销售数量'
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0下架，1上架'
    }
}, {
    // 使用snake_case命名
    underscored: true,
    // 使用时间戳
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'update_time',
    // 表名
    tableName: 'goods',
    // 表注释
    comment: '商品表'
});

module.exports = Goods; 