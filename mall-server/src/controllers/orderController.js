/**
 * 订单管理控制器
 * 包含订单的增删改查等功能
 */

const { Order, OrderGoods, User, Goods, Cart, Address, sequelize } = require('../models');
const logger = require('../utils/logger');
const { Op, fn, col } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');

/**
 * 获取订单列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            status,
            order_no,
            start_time,
            end_time,
            user_id
        } = req.query;

        const offset = (page - 1) * pageSize;

        // 构建查询条件
        const where = {};

        if (status !== undefined && status !== '') {
            where.status = status;
        }

        if (order_no) {
            where.order_no = { [Op.like]: `%${order_no}%` };
        }

        if (user_id) {
            where.user_id = user_id;
        }

        // 时间范围筛选
        if (start_time && end_time) {
            where.create_time = {
                [Op.between]: [new Date(start_time), new Date(end_time)]
            };
        } else if (start_time) {
            where.create_time = { [Op.gte]: new Date(start_time) };
        } else if (end_time) {
            where.create_time = { [Op.lte]: new Date(end_time) };
        }

        // 查询订单列表
        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nickname', 'phone', 'avatar']
                },
                {
                    model: OrderGoods,
                    as: 'orderGoods',
                    include: [
                        {
                            model: Goods,
                            as: 'goods',
                            attributes: ['id', 'name', 'main_image']
                        }
                    ]
                }
            ],
            order: [['create_time', 'DESC']],
            limit: parseInt(pageSize),
            offset: parseInt(offset)
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                list: rows,
                total: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (error) {
        logger.error('获取订单列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取订单列表失败',
            error: error.message
        });
    }
};

/**
 * 获取订单详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'nickname', 'phone', 'avatar']
                },
                {
                    model: OrderGoods,
                    as: 'orderGoods',
                    include: [
                        {
                            model: Goods,
                            as: 'goods',
                            attributes: ['id', 'name', 'main_image', 'price']
                        }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: order
        });
    } catch (error) {
        logger.error('获取订单详情失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取订单详情失败',
            error: error.message
        });
    }
};

/**
 * 更新订单状态
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateOrderStatus = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { status, delivery_company, delivery_number } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        // 检查状态变更是否合法
        if (status < order.status && order.status !== 4) {
            await transaction.rollback();
            return res.status(400).json({
                code: 400,
                message: '不能将订单状态变更为之前的状态'
            });
        }

        const updateData = { status };

        // 根据状态更新相应字段
        if (status === 1 && order.status === 0) {
            // 待付款 -> 待发货，更新支付时间
            updateData.pay_time = new Date();
        } else if (status === 2 && order.status === 1) {
            // 待发货 -> 待收货，更新发货时间
            updateData.delivery_time = new Date();

            // 如果提供了物流信息，也更新
            if (delivery_company && delivery_number) {
                updateData.delivery_company = delivery_company;
                updateData.delivery_number = delivery_number;
            }
        } else if (status === 3 && order.status === 2) {
            // 待收货 -> 已完成，更新收货时间
            updateData.receive_time = new Date();
        }

        // 更新订单状态
        await Order.update(updateData, {
            where: { id },
            transaction
        });

        await transaction.commit();

        // 获取更新后的订单信息
        const updatedOrder = await Order.findByPk(id);

        res.status(200).json({
            code: 200,
            message: '更新成功',
            data: updatedOrder
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('更新订单状态失败:', error);
        res.status(500).json({
            code: 500,
            message: '更新订单状态失败',
            error: error.message
        });
    }
};

/**
 * 获取订单统计信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getOrderStats = async (req, res) => {
    try {
        // 获取各状态订单数量
        const statusCounts = await Order.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['status']
        });

        // 获取今日订单数
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrderCount = await Order.count({
            where: {
                create_time: {
                    [Op.gte]: today
                }
            }
        });

        // 获取今日销售额
        const todaySales = await Order.sum('pay_amount', {
            where: {
                status: { [Op.gt]: 0 }, // 已支付的订单
                pay_time: {
                    [Op.gte]: today
                }
            }
        });

        // 获取总销售额
        const totalSales = await Order.sum('pay_amount', {
            where: {
                status: { [Op.gt]: 0 } // 已支付的订单
            }
        });

        // 格式化状态统计数据
        const formattedStatusCounts = {
            pending_payment: 0, // 待付款
            pending_delivery: 0, // 待发货
            pending_receipt: 0, // 待收货
            completed: 0, // 已完成
            cancelled: 0 // 已取消
        };

        statusCounts.forEach(item => {
            switch (item.status) {
                case 0:
                    formattedStatusCounts.pending_payment = parseInt(item.getDataValue('count'));
                    break;
                case 1:
                    formattedStatusCounts.pending_delivery = parseInt(item.getDataValue('count'));
                    break;
                case 2:
                    formattedStatusCounts.pending_receipt = parseInt(item.getDataValue('count'));
                    break;
                case 3:
                    formattedStatusCounts.completed = parseInt(item.getDataValue('count'));
                    break;
                case 4:
                    formattedStatusCounts.cancelled = parseInt(item.getDataValue('count'));
                    break;
            }
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                status_counts: formattedStatusCounts,
                today_order_count: todayOrderCount || 0,
                today_sales: todaySales || 0,
                total_sales: totalSales || 0
            }
        });
    } catch (error) {
        logger.error('获取订单统计信息失败:', error);
        res.status(500).json({
            code: 500,
            message: '获取订单统计信息失败',
            error: error.message
        });
    }
};

/**
 * 删除订单
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                code: 404,
                message: '订单不存在'
            });
        }

        // 不允许删除非取消状态的订单
        if (order.status !== 4) {
            await transaction.rollback();
            return res.status(400).json({
                code: 400,
                message: '只能删除已取消的订单'
            });
        }

        // 先删除订单商品
        await OrderGoods.destroy({
            where: { order_id: id },
            transaction
        });

        // 删除订单
        await Order.destroy({
            where: { id },
            transaction
        });

        await transaction.commit();

        res.status(200).json({
            code: 200,
            message: '删除成功',
            data: { id }
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('删除订单失败:', error);
        res.status(500).json({
            code: 500,
            message: '删除订单失败',
            error: error.message
        });
    }
};

/**
 * 生成订单号
 * @returns {string} 生成的订单号
 */
const generateOrderNo = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

/**
 * 创建订单
 * @route POST /api/order/create
 * @access Private
 */
exports.createOrder = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { address_id, remark } = req.body;

    // 验证参数
    if (!address_id) {
        throw new ValidationError('收货地址不能为空');
    }

    const transaction = await sequelize.transaction();

    try {
        // 1. 获取收货地址
        const address = await Address.findOne({
            where: {
                id: address_id,
                user_id: userId
            }
        });

        if (!address) {
            await transaction.rollback();
            throw new NotFoundError('收货地址不存在');
        }

        // 2. 获取用户购物车中已选中的商品
        const cartItems = await Cart.findAll({
            where: {
                user_id: userId,
                selected: 1
            },
            include: [{
                model: Goods,
                as: 'goods'
            }]
        });

        if (cartItems.length === 0) {
            await transaction.rollback();
            throw new ValidationError('购物车中没有选中的商品');
        }

        // 3. 计算订单总金额和运费
        let totalAmount = 0;
        const freightAmount = 10.00; // 运费，可以根据商品重量或其他规则计算

        for (const item of cartItems) {
            totalAmount += item.goods.price * item.quantity;
        }

        // 应付金额 = 商品总金额 + 运费
        const payAmount = totalAmount + freightAmount;

        // 4. 生成订单
        const orderNo = generateOrderNo();
        const order = await Order.create({
            order_no: orderNo,
            user_id: userId,
            total_amount: totalAmount.toFixed(2),
            freight_amount: freightAmount.toFixed(2),
            pay_amount: payAmount.toFixed(2),
            pay_type: 1, // 微信支付
            status: 0, // 待付款
            address_id,
            remark: remark || null,
            create_time: new Date(),
            update_time: new Date()
        }, { transaction });

        // 5. 创建订单商品记录
        const orderGoods = [];
        for (const item of cartItems) {
            orderGoods.push({
                order_id: order.id,
                goods_id: item.goods_id,
                goods_name: item.goods.name,
                goods_image: item.goods.image,
                goods_price: item.goods.price,
                quantity: item.quantity
            });
        }

        await OrderGoods.bulkCreate(orderGoods, { transaction });

        // 6. 清空购物车中已选中的商品
        await Cart.destroy({
            where: {
                user_id: userId,
                selected: 1
            },
            transaction
        });

        await transaction.commit();

        logger.info(`用户(ID: ${userId})创建订单成功，订单号: ${orderNo}`);

        res.status(201).json({
            code: 200,
            message: '创建成功',
            data: {
                order_id: order.id,
                order_no: orderNo
            }
        });
    } catch (error) {
        await transaction.rollback();
        logger.error(`创建订单失败: ${error.message}`);
        throw error;
    }
});

/**
 * 获取用户订单列表
 * @route GET /api/order/list
 * @access Private
 */
exports.getOrderList = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 10 } = req.query;

    // 构建查询条件
    const whereCondition = { user_id: userId };
    if (status !== undefined && status !== '') {
        whereCondition.status = parseInt(status);
    }

    try {
        // 查询订单总数
        const total = await Order.count({ where: whereCondition });

        // 查询订单列表
        const orders = await Order.findAll({
            where: whereCondition,
            include: [{
                model: OrderGoods,
                as: 'order_goods'
            }],
            order: [['create_time', 'DESC']],
            offset: (page - 1) * pageSize,
            limit: parseInt(pageSize)
        });

        logger.info(`用户(ID: ${userId})获取订单列表成功，共${orders.length}条记录`);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                total,
                list: orders,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        logger.error(`获取订单列表失败: ${error.message}`);
        throw error;
    }
});

/**
 * 取消订单
 * @route PUT /api/order/:id/cancel
 * @access Private
 */
exports.cancelOrder = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        // 查询订单
        const order = await Order.findOne({
            where: {
                id: orderId,
                user_id: userId
            }
        });

        if (!order) {
            throw new NotFoundError('订单不存在');
        }

        // 只有待付款状态的订单才能取消
        if (order.status !== 0) {
            throw new ValidationError('只有待付款状态的订单才能取消');
        }

        // 更新订单状态为已取消
        await order.update({
            status: 4, // 已取消
            update_time: new Date()
        });

        logger.info(`用户(ID: ${userId})取消订单成功，订单ID: ${orderId}`);

        res.status(200).json({
            code: 200,
            message: '取消成功',
            data: null
        });
    } catch (error) {
        logger.error(`取消订单失败: ${error.message}`);
        throw error;
    }
});

/**
 * 确认收货
 * @route PUT /api/order/:id/confirm
 * @access Private
 */
exports.confirmOrder = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        // 查询订单
        const order = await Order.findOne({
            where: {
                id: orderId,
                user_id: userId
            }
        });

        if (!order) {
            throw new NotFoundError('订单不存在');
        }

        // 只有待收货状态的订单才能确认收货
        if (order.status !== 2) {
            throw new ValidationError('只有待收货状态的订单才能确认收货');
        }

        // 更新订单状态为已完成
        await order.update({
            status: 3, // 已完成
            receive_time: new Date(),
            update_time: new Date()
        });

        logger.info(`用户(ID: ${userId})确认收货成功，订单ID: ${orderId}`);

        res.status(200).json({
            code: 200,
            message: '确认收货成功',
            data: null
        });
    } catch (error) {
        logger.error(`确认收货失败: ${error.message}`);
        throw error;
    }
});

/**
 * 删除订单
 * @route DELETE /api/order/:id
 * @access Private
 */
exports.deleteOrder = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.id;

    try {
        // 查询订单
        const order = await Order.findOne({
            where: {
                id: orderId,
                user_id: userId
            }
        });

        if (!order) {
            throw new NotFoundError('订单不存在');
        }

        // 只有已完成或已取消状态的订单才能删除
        if (order.status !== 3 && order.status !== 4) {
            throw new ValidationError('只有已完成或已取消状态的订单才能删除');
        }

        // 删除订单及关联的订单商品（通过外键约束实现级联删除）
        await order.destroy();

        logger.info(`用户(ID: ${userId})删除订单成功，订单ID: ${orderId}`);

        res.status(200).json({
            code: 200,
            message: '删除成功',
            data: null
        });
    } catch (error) {
        logger.error(`删除订单失败: ${error.message}`);
        throw error;
    }
}); 