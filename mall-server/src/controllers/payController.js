/**
 * 支付控制器
 * 处理支付相关的业务逻辑
 */
const { Order, OrderGoods, Goods } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * 获取微信支付参数（在生产环境中，这里需要调用微信支付API）
 * @route POST /api/pay/wxpay
 * @access Private
 */
exports.getWxPayParams = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { order_no } = req.body;

    // 验证参数
    if (!order_no) {
        throw new ValidationError('订单号不能为空');
    }

    try {
        // 查询订单
        const order = await Order.findOne({
            where: {
                order_no,
                user_id: userId
            }
        });

        if (!order) {
            throw new NotFoundError('订单不存在');
        }

        // 检查订单状态
        if (order.status !== 0) {
            throw new ValidationError('订单状态不正确，无法支付');
        }

        // 在实际环境中，这里需要调用微信支付API，获取支付参数
        // 由于是模拟支付，这里直接返回一些模拟的参数
        const mockPayParams = {
            timeStamp: String(Math.floor(Date.now() / 1000)),
            nonceStr: Math.random().toString(36).substr(2, 15),
            package: `prepay_id=wx${Date.now()}`,
            signType: 'MD5',
            paySign: 'mock_sign_value',
            orderId: order.id,
            orderNo: order.order_no,
            payAmount: order.pay_amount
        };

        logger.info(`用户(ID: ${userId})获取支付参数成功，订单号: ${order_no}`);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: mockPayParams
        });
    } catch (error) {
        logger.error(`获取支付参数失败: ${error.message}`);
        throw error;
    }
});

/**
 * 模拟支付接口
 * @route POST /api/pay/mockpay
 * @access Private
 */
exports.mockPay = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { order_no, status } = req.body;

    // 验证参数
    if (!order_no) {
        throw new ValidationError('订单号不能为空');
    }

    try {
        // 查询订单
        const order = await Order.findOne({
            where: {
                order_no,
                user_id: userId
            },
            include: [{
                model: OrderGoods,
                as: 'orderGoods'
            }]
        });

        if (!order) {
            throw new NotFoundError('订单不存在');
        }

        // 检查订单状态
        if (order.status !== 0) {
            throw new ValidationError('订单状态不正确，无法支付');
        }

        // 如果支付成功，更新订单状态
        if (status) {
            await order.update({
                status: 1, // 待发货
                pay_time: new Date(),
                update_time: new Date()
            });

            // 更新商品库存
            if (order.orderGoods && order.orderGoods.length > 0) {
                for (const item of order.orderGoods) {
                    // 获取当前商品信息
                    const goods = await Goods.findByPk(item.goods_id);
                    if (goods) {
                        // 计算新库存，确保不会出现负库存
                        const newStock = Math.max(0, goods.stock - item.quantity);
                        // 更新库存
                        await goods.update({
                            stock: newStock,
                            sale_count: goods.sale_count + item.quantity
                        });
                        logger.info(`商品(ID: ${goods.id})库存更新: ${goods.stock} -> ${newStock}, 销量增加: ${item.quantity}`);
                    }
                }
            }

            logger.info(`用户(ID: ${userId})支付成功，订单号: ${order_no}`);

            // 返回支付成功结果
            return res.status(200).json({
                code: 200,
                message: '支付成功',
                data: {
                    order_id: order.id,
                    order_no: order.order_no
                }
            });
        } else {
            // 支付失败或取消，不更新订单状态
            logger.info(`用户(ID: ${userId})支付失败或取消，订单号: ${order_no}`);

            return res.status(200).json({
                code: 200,
                message: '支付取消',
                data: null
            });
        }
    } catch (error) {
        logger.error(`模拟支付失败: ${error.message}`);
        throw error;
    }
});

/**
 * 查询支付状态
 * @route GET /api/pay/status/:orderId
 * @access Private
 */
exports.getPayStatus = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const orderId = req.params.orderId;

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

        // 返回支付状态
        const isPaid = order.status > 0 && order.status !== 4; // 状态不为待付款或已取消，则视为已支付

        logger.info(`用户(ID: ${userId})查询支付状态成功，订单ID: ${orderId}, 支付状态: ${isPaid ? '已支付' : '未支付'}`);

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: {
                isPaid,
                order_status: order.status,
                order_no: order.order_no
            }
        });
    } catch (error) {
        logger.error(`查询支付状态失败: ${error.message}`);
        throw error;
    }
});

/**
 * 微信支付回调通知处理
 * @route POST /api/pay/notify
 * @access Public
 */
exports.handlePayNotify = catchAsync(async (req, res) => {
    // 在实际环境中，这里需要解析微信支付回调通知的XML数据，验证签名，更新订单状态
    // 由于是模拟支付，这里只做简单处理
    logger.info('收到支付回调通知');

    try {
        // 模拟从请求中获取订单号
        // 在实际场景中，需要从微信支付的XML回调数据中提取
        let orderNo = '';
        if (req.body && req.body.out_trade_no) {
            orderNo = req.body.out_trade_no;
        } else if (req.query && req.query.out_trade_no) {
            orderNo = req.query.out_trade_no;
        }

        // 如果有订单号，更新订单状态和库存
        if (orderNo) {
            // 查询订单信息
            const order = await Order.findOne({
                where: { order_no: orderNo, status: 0 }, // 只处理待支付的订单
                include: [{
                    model: OrderGoods,
                    as: 'orderGoods'
                }]
            });

            if (order) {
                // 更新订单状态为待发货
                await order.update({
                    status: 1, // 待发货
                    pay_time: new Date(),
                    update_time: new Date()
                });

                // 更新商品库存
                if (order.orderGoods && order.orderGoods.length > 0) {
                    for (const item of order.orderGoods) {
                        // 获取当前商品信息
                        const goods = await Goods.findByPk(item.goods_id);
                        if (goods) {
                            // 计算新库存，确保不会出现负库存
                            const newStock = Math.max(0, goods.stock - item.quantity);
                            // 更新库存
                            await goods.update({
                                stock: newStock,
                                sale_count: goods.sale_count + item.quantity
                            });
                            logger.info(`支付回调：商品(ID: ${goods.id})库存更新: ${goods.stock} -> ${newStock}, 销量增加: ${item.quantity}`);
                        }
                    }
                }

                logger.info(`支付回调：订单(${orderNo})状态更新为已支付`);
            } else {
                logger.warn(`支付回调：未找到待支付订单(${orderNo})`);
            }
        } else {
            logger.warn('支付回调：未能获取订单号');
        }
    } catch (error) {
        logger.error(`支付回调处理失败: ${error.message}`);
    }

    // 无论处理结果如何，都返回成功响应给微信支付
    res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
}); 