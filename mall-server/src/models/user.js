/**
 * 用户模型
 * 小程序用户的数据模型
 */
const { DataTypes } = require('sequelize');
const db = require('../db/index');

const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    openid: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    nickname: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    gender: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0, // 0: 未知, 1: 男, 2: 女
        validate: {
            isIn: [[0, 1, 2]]
        }
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1, // 0: 禁用, 1: 正常
        validate: {
            isIn: [[0, 1]]
        }
    },
    // 注意: email字段已被移除，因为数据库中不存在该字段
    // 如果需要添加email字段，请先修改数据库表结构
    // email: {
    //     type: DataTypes.STRING(100),
    //     allowNull: true,
    //     validate: {
    //         isEmail: true
    //     }
    // },
    createdAt: {
        type: DataTypes.DATE,
        field: 'create_time',
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'update_time',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User; 