const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '订单ID'
    },
    order_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: '订单编号'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '用户ID'
    },
    client_order_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '客户端订单ID，用于幂等性处理'
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '订单总金额'
    },
    pay_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: '实付金额'
    },
    freight_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        comment: '运费'
    },
    pay_type: {
        type: DataTypes.TINYINT,
        comment: '支付方式：1微信支付'
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: '订单状态：0待付款，1待发货，2待收货，3已完成，4已取消'
    },
    address_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '收货地址ID'
    },
    remark: {
        type: DataTypes.STRING(255),
        comment: '订单备注'
    },
    pay_time: {
        type: DataTypes.DATE,
        comment: '支付时间'
    },
    delivery_time: {
        type: DataTypes.DATE,
        comment: '发货时间'
    },
    receive_time: {
        type: DataTypes.DATE,
        comment: '收货时间'
    },
    delivery_company: {
        type: DataTypes.STRING(50),
        comment: '物流公司'
    },
    delivery_number: {
        type: DataTypes.STRING(50),
        comment: '物流单号'
    },
    create_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '创建时间'
    },
    update_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: '更新时间'
    }
}, {
    tableName: 'orders',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['order_no']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['user_id', 'client_order_id'],
            unique: true,
            where: {
                client_order_id: {
                    [sequelize.Sequelize.Op.ne]: null
                }
            }
        }
    ]
});

module.exports = Order; 