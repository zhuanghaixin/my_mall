/**
 * 购物车模型
 * 定义购物车的数据库结构
 */
const { DataTypes } = require('sequelize');
const db = require('../db/index');

// 购物车模型
const Cart = db.define('Cart', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '购物车ID'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    goods_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '商品ID'
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        },
        comment: '商品数量'
    },
    selected: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: '是否选中'
    },
    add_time: {
        type: DataTypes.BIGINT,
        defaultValue: () => Math.floor(Date.now() / 1000),
        comment: '添加时间'
    },
    update_time: {
        type: DataTypes.BIGINT,
        defaultValue: () => Math.floor(Date.now() / 1000),
        comment: '更新时间'
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是否删除'
    }
}, {
    // 表名
    tableName: 'cart',
    // 不自动添加时间戳字段
    timestamps: false,
    // 使用蛇形命名（下划线）
    underscored: true,
    // 表名不复数
    freezeTableName: true,
    // 表注释
    comment: '购物车表'
});

module.exports = Cart; 