/**
 * 热门搜索词模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SearchHot = sequelize.define('search_hot', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID'
    },
    keyword: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '搜索关键词'
    },
    search_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '搜索次数'
    },
    sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序值，值越大越靠前'
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：0禁用，1启用'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        comment: '更新时间'
    }
}, {
    tableName: 'search_hot',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = SearchHot; 