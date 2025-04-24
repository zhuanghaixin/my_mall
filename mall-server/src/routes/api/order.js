/**
 * 订单相关路由
 * 
 * @swagger
 * tags:
 *   - name: 用户订单
 *     description: 用户订单相关的操作
 */
const express = require('express');
const orderController = require('../../controllers/orderController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 所有订单相关的路由都需要身份验证
router.use(protect);

/**
 * @swagger
 * /api/order/create:
 *   post:
 *     summary: 创建订单
 *     tags: [用户订单]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address_id
 *             properties:
 *               address_id:
 *                 type: integer
 *                 description: 收货地址ID
 *               remark:
 *                 type: string
 *                 description: 订单备注
 *     responses:
 *       201:
 *         description: 创建成功
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
 *                   example: 创建成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                       description: 订单ID
 *                       example: 1
 *                     order_no:
 *                       type: string
 *                       description: 订单编号
 *                       example: "202307051234567890"
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/create', orderController.createOrder);

/**
 * @swagger
 * /api/order/list:
 *   get:
 *     summary: 获取订单列表
 *     tags: [用户订单]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2, 3, 4]
 *         description: 订单状态(0待付款，1待发货，2待收货，3已完成，4已取消)
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
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 15
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页条数
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *                       example: 2
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/list', orderController.getOrderList);


/**
 * @swagger
 * /api/order/count:
 *   get:
 *     summary: 获取订单数量统计
 *     tags: [用户订单]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回各状态订单数量
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
 *                     unpaid:
 *                       type: integer
 *                       description: 待付款订单数量
 *                       example: 2
 *                     unshipped:
 *                       type: integer
 *                       description: 待发货订单数量
 *                       example: 1
 *                     delivered:
 *                       type: integer
 *                       description: 待收货订单数量
 *                       example: 3
 *                     completed:
 *                       type: integer
 *                       description: 已完成订单数量
 *                       example: 5
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/count', orderController.getOrderCounts);


/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: 获取订单详情
 *     tags: [用户订单]
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
 * /api/order/{id}/cancel:
 *   put:
 *     summary: 取消订单
 *     tags: [用户订单]
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
 *         description: 取消成功
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
 *                   example: 取消成功
 *                 data:
 *                   type: null
 *       400:
 *         description: 订单状态不允许取消
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/cancel', orderController.cancelOrder);

/**
 * @swagger
 * /api/order/{id}/confirm:
 *   put:
 *     summary: 确认收货
 *     tags: [用户订单]
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
 *         description: 确认收货成功
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
 *                   example: 确认收货成功
 *                 data:
 *                   type: null
 *       400:
 *         description: 订单状态不允许确认收货
 *       401:
 *         description: 未授权
 *       404:
 *         description: 订单不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/confirm', orderController.confirmOrder);

/**
 * @swagger
 * /api/order/{id}:
 *   delete:
 *     summary: 删除订单
 *     tags: [用户订单]
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
 *         description: 删除成功
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
 *                   type: null
 *       400:
 *         description: 订单状态不允许删除
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
 *         order_goods:
 *           type: array
 *           description: 订单商品列表
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 订单商品ID
 *                 example: 1
 *               goods_id:
 *                 type: integer
 *                 description: 商品ID
 *                 example: 1
 *               goods_name:
 *                 type: string
 *                 description: 商品名称
 *                 example: '高品质纯棉T恤 2023新款'
 *               goods_image:
 *                 type: string
 *                 description: 商品图片
 *                 example: 'https://example.com/image.jpg'
 *               goods_price:
 *                 type: number
 *                 description: 商品价格
 *                 example: 199.00
 *               quantity:
 *                 type: integer
 *                 description: 购买数量
 *                 example: 1
 *     OrderDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Order'
 *         - type: object
 *           properties:
 *             address:
 *               type: object
 *               description: 收货地址信息
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 地址ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: 收货人姓名
 *                   example: '张三'
 *                 phone:
 *                   type: string
 *                   description: 收货人电话
 *                   example: '13800138000'
 *                 province:
 *                   type: string
 *                   description: 省份
 *                   example: '广东省'
 *                 city:
 *                   type: string
 *                   description: 城市
 *                   example: '深圳市'
 *                 district:
 *                   type: string
 *                   description: 区/县
 *                   example: '南山区'
 *                 detail:
 *                   type: string
 *                   description: 详细地址
 *                   example: '科技园路10号'
 *                 is_default:
 *                   type: integer
 *                   description: 是否默认地址(1是,0否)
 *                   example: 1
 */

module.exports = router;



