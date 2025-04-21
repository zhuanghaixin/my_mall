/**
 * 订单管理相关路由
 * 
 * @swagger
 * tags:
 *   - name: 订单管理
 *     description: 订单相关的操作
 */
const express = require('express');
const orderController = require('../../controllers/orderController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 所有订单管理路由都需要管理员身份验证
router.use(protect);

/**
 * @swagger
 * /api/admin/order/list:
 *   get:
 *     summary: 获取订单列表 (带分页和搜索)
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页条数
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4]
 *         description: 订单状态(0待付款，1待发货，2待收货，3已完成，4已取消)
 *       - in: query
 *         name: order_no
 *         schema:
 *           type: string
 *         description: 订单编号(模糊查询)
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: 用户ID
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束时间
 *     responses:
 *       200:
 *         description: 成功返回订单列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页条数
 *                       example: 10
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/list', orderController.getOrders);

/**
 * @swagger
 * /api/admin/order:
 *   get:
 *     summary: 获取订单列表 (简单版本)
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     description: 获取订单列表的简单版本，保留向后兼容性
 *     responses:
 *       200:
 *         description: 成功返回订单列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页条数
 *                       example: 10
 */
router.get('/', orderController.getOrders);

/**
 * @swagger
 * /api/admin/order/stats:
 *   get:
 *     summary: 获取订单统计信息
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     description: 获取各状态订单数量、今日订单数、今日销售额、总销售额等统计信息
 *     responses:
 *       200:
 *         description: 成功返回订单统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     status_counts:
 *                       type: object
 *                       properties:
 *                         pending_payment:
 *                           type: integer
 *                           example: 10
 *                         pending_delivery:
 *                           type: integer
 *                           example: 20
 *                         pending_receipt:
 *                           type: integer
 *                           example: 15
 *                         completed:
 *                           type: integer
 *                           example: 50
 *                         cancelled:
 *                           type: integer
 *                           example: 5
 *                     today_order_count:
 *                       type: integer
 *                       example: 8
 *                     today_sales:
 *                       type: number
 *                       example: 2580.5
 *                     total_sales:
 *                       type: number
 *                       example: 125800.75
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/stats', orderController.getOrderStats);

/**
 * @swagger
 * /api/admin/order/{id}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 成功返回订单详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', orderController.getOrderDetail);

/**
 * @swagger
 * /api/admin/order/{id}/status:
 *   put:
 *     summary: 更新订单状态
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [0, 1, 2, 3, 4]
 *                 description: 订单状态(0待付款，1待发货，2待收货，3已完成，4已取消)
 *               delivery_company:
 *                 type: string
 *                 description: 物流公司名称(发货时可填)
 *               delivery_number:
 *                 type: string
 *                 description: 物流单号(发货时可填)
 *     responses:
 *       200:
 *         description: 成功更新订单状态
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 更新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: 参数错误或状态变更不合法
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/status', orderController.updateOrderStatus);

/**
 * @swagger
 * /api/admin/order/{id}:
 *   delete:
 *     summary: 删除订单
 *     tags: [订单管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 订单ID
 *     responses:
 *       200:
 *         description: 成功删除订单
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: 只能删除已取消的订单
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/:id', orderController.deleteOrder);

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 订单ID
 *           example: 1
 *         order_no:
 *           type: string
 *           description: 订单编号
 *           example: '2023060112345678'
 *         user_id:
 *           type: integer
 *           description: 用户ID
 *           example: 1
 *         total_amount:
 *           type: number
 *           description: 订单总金额
 *           example: 457.00
 *         pay_amount:
 *           type: number
 *           description: 实付金额
 *           example: 437.00
 *         freight_amount:
 *           type: number
 *           description: 运费
 *           example: 10.00
 *         pay_type:
 *           type: integer
 *           description: 支付方式(1微信支付)
 *           example: 1
 *         status:
 *           type: integer
 *           description: 订单状态(0待付款，1待发货，2待收货，3已完成，4已取消)
 *           example: 1
 *         address_id:
 *           type: integer
 *           description: 收货地址ID
 *           example: 1
 *         remark:
 *           type: string
 *           description: 订单备注
 *           example: '请尽快发货'
 *         delivery_company:
 *           type: string
 *           description: 物流公司
 *           example: '顺丰速运'
 *         delivery_number:
 *           type: string
 *           description: 物流单号
 *           example: 'SF1234567890'
 *         pay_time:
 *           type: string
 *           format: date-time
 *           description: 支付时间
 *         delivery_time:
 *           type: string
 *           format: date-time
 *           description: 发货时间
 *         receive_time:
 *           type: string
 *           format: date-time
 *           description: 收货时间
 *         create_time:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         update_time:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: 用户ID
 *               example: 1
 *             nickname:
 *               type: string
 *               description: 用户昵称
 *               example: '张三'
 *             phone:
 *               type: string
 *               description: 手机号
 *               example: '13800138000'
 *             avatar:
 *               type: string
 *               description: 头像
 *               example: 'https://example.com/avatar.jpg'
 *     OrderDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Order'
 *         - type: object
 *           properties:
 *             orderGoods:
 *               type: array
 *               description: 订单商品列表
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: 订单商品ID
 *                     example: 1
 *                   order_id:
 *                     type: integer
 *                     description: 订单ID
 *                     example: 1
 *                   goods_id:
 *                     type: integer
 *                     description: 商品ID
 *                     example: 1
 *                   goods_name:
 *                     type: string
 *                     description: 商品名称
 *                     example: '高品质纯棉T恤 2023新款'
 *                   goods_image:
 *                     type: string
 *                     description: 商品图片
 *                     example: 'https://example.com/image.jpg'
 *                   price:
 *                     type: number
 *                     description: 商品价格
 *                     example: 199.00
 *                   quantity:
 *                     type: integer
 *                     description: 购买数量
 *                     example: 1
 *                   goods:
 *                     type: object
 *                     description: 商品信息
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 商品ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: 商品名称
 *                         example: '高品质纯棉T恤 2023新款'
 *                       main_image:
 *                         type: string
 *                         description: 商品主图
 *                         example: 'https://example.com/image.jpg'
 *                       price:
 *                         type: number
 *                         description: 商品价格
 *                         example: 199.00
 */

module.exports = router; 