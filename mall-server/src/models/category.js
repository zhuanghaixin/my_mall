/**
 * 商品分类模型
 * 定义商品分类的数据库结构
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Category = sequelize.define('categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '分类ID'
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '父分类ID'
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '分类名称'
    },
    icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '分类图标'
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '分类层级：1一级，2二级，3三级'
    },
    sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序'
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0禁用，1正常'
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
    comment: '商品分类表'
});

module.exports = Category; 