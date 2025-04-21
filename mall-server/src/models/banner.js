/**
 * 轮播图模型
 * 定义轮播图的数据库结构
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Banner = sequelize.define('banners', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '轮播图ID'
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '轮播图标题'
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '图片地址'
    },
    url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: '跳转链接'
    },
    sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序值，值越小越靠前'
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0禁用，1启用'
    }
}, {
    // 使用蛇形命名（下划线）
    underscored: true,
    // 添加created_at和updated_at字段
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
    // 表名不复数
    freezeTableName: true,
    // 表注释
    comment: '轮播图表'
});

module.exports = Banner; 