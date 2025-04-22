/**
 * 搜索历史模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SearchHistory = sequelize.define('search_history', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: '用户ID，未登录时为null'
    },
    openid: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '微信用户openid，标识匿名用户'
    },
    keyword: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '搜索关键词'
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
    tableName: 'search_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        // 只保留最重要的一个索引
        {
            fields: ['user_id'],
            name: 'idx_user_id'
        }
    ]
});

module.exports = SearchHistory;