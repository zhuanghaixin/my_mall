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
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0下架，1上架'
    }
}, {
    // 使用蛇形命名（下划线）
    underscored: true,
    // 添加created_at和updated_at字段
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'update_time',
    // 表名不复数
    freezeTableName: true,
    // 表注释
    comment: '商品表'
});

module.exports = Goods; 