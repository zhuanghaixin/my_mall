/**
 * 收货地址数据模型
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: '地址ID'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '收货人姓名'
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: '收货人手机号'
    },
    province: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '省份'
    },
    city: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '城市'
    },
    district: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: '区/县'
    },
    detail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '详细地址'
    },
    is_default: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '是否默认地址 0-否 1-是'
    },
    create_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '创建时间'
    },
    update_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: '更新时间'
    }
}, {
    tableName: 'address',
    timestamps: false
});

module.exports = Address; 