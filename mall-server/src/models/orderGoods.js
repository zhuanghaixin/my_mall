const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OrderGoods = sequelize.define('order_goods', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '订单商品ID'
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '订单ID'
    },
    goods_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '商品ID'
    },
    goods_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '商品名称'
    },
    goods_image: {
        type: DataTypes.STRING(255),
        comment: '商品图片'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '商品价格'
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '购买数量'
    },
    create_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
    }
}, {
    tableName: 'order_goods',
    timestamps: false,
    indexes: [
        {
            fields: ['order_id']
        },
        {
            fields: ['goods_id']
        }
    ]
});

module.exports = OrderGoods; 