/**
 * 收货地址相关API路由
 */
const express = require('express');
const router = express.Router();
const addressController = require('../../controllers/addressController');
const { protect } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: 收货地址
 *   description: 收货地址相关接口
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - province
 *         - city
 *         - district
 *         - detail
 *       properties:
 *         id:
 *           type: integer
 *           description: 地址ID
 *         user_id:
 *           type: integer
 *           description: 用户ID
 *         name:
 *           type: string
 *           description: 收货人姓名
 *         phone:
 *           type: string
 *           description: 收货人手机号
 *         province:
 *           type: string
 *           description: 省份
 *         city:
 *           type: string
 *           description: 城市
 *         district:
 *           type: string
 *           description: 区/县
 *         detail:
 *           type: string
 *           description: 详细地址
 *         is_default:
 *           type: integer
 *           description: 是否默认地址 (1是，0否)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

/**
 * 获取地址列表
 * GET /api/address/list
 * @swagger
 * /api/address/list:
 *   get:
 *     summary: 获取用户收货地址列表
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取地址列表
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
 *                   example: 获取地址列表成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 *       401:
 *         description: 未授权，用户未登录
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: 请先登录
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: 服务器错误
 */
router.get('/list', protect, addressController.getAddressList);

/**
 * 添加收货地址
 * POST /api/address/add
 * @swagger
 * /api/address/add:
 *   post:
 *     summary: 添加收货地址
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - province
 *               - city
 *               - district
 *               - detail
 *             properties:
 *               name:
 *                 type: string
 *                 description: 收货人姓名
 *               phone:
 *                 type: string
 *                 description: 收货人手机号
 *                 pattern: '^1[3-9]\d{9}$'
 *               province:
 *                 type: string
 *                 description: 省份
 *               city:
 *                 type: string
 *                 description: 城市
 *               district:
 *                 type: string
 *                 description: 区/县
 *               detail:
 *                 type: string
 *                 description: 详细地址
 *               is_default:
 *                 type: integer
 *                 description: 是否设为默认地址 (1是，0否)
 *                 default: 0
 *     responses:
 *       201:
 *         description: 地址添加成功
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
 *                   example: 地址添加成功
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 请求参数错误
 *       401:
 *         description: 未授权，用户未登录
 *       500:
 *         description: 服务器错误
 */
router.post('/add', protect, addressController.addAddress);

/**
 * 更新收货地址
 * PUT /api/address/update/:id
 * @swagger
 * /api/address/update/{id}:
 *   put:
 *     summary: 更新收货地址
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 地址ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 收货人姓名
 *               phone:
 *                 type: string
 *                 description: 收货人手机号
 *                 pattern: '^1[3-9]\d{9}$'
 *               province:
 *                 type: string
 *                 description: 省份
 *               city:
 *                 type: string
 *                 description: 城市
 *               district:
 *                 type: string
 *                 description: 区/县
 *               detail:
 *                 type: string
 *                 description: 详细地址
 *               is_default:
 *                 type: integer
 *                 description: 是否设为默认地址 (1是，0否)
 *     responses:
 *       200:
 *         description: 地址更新成功
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
 *                   example: 地址更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权，用户未登录
 *       404:
 *         description: 地址不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 地址不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/update/:id', protect, addressController.updateAddress);

/**
 * 删除收货地址
 * DELETE /api/address/delete/:id
 * @swagger
 * /api/address/delete/{id}:
 *   delete:
 *     summary: 删除收货地址
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 地址ID
 *     responses:
 *       200:
 *         description: 地址删除成功
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
 *                   example: 地址删除成功
 *       401:
 *         description: 未授权，用户未登录
 *       404:
 *         description: 地址不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 地址不存在
 *       500:
 *         description: 服务器错误
 */
router.delete('/delete/:id', protect, addressController.deleteAddress);

/**
 * 设置默认收货地址
 * PUT /api/address/default/:id
 * @swagger
 * /api/address/default/{id}:
 *   put:
 *     summary: 设置默认收货地址
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 地址ID
 *     responses:
 *       200:
 *         description: 设置默认地址成功
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
 *                   example: 设置默认地址成功
 *       401:
 *         description: 未授权，用户未登录
 *       404:
 *         description: 地址不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/default/:id', protect, addressController.setDefaultAddress);

/**
 * 获取默认收货地址
 * GET /api/address/default
 * @swagger
 * /api/address/default:
 *   get:
 *     summary: 获取默认收货地址
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取默认地址
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
 *                   example: 获取默认地址成功
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: 未授权，用户未登录
 *       404:
 *         description: 默认地址不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 默认地址不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/default', protect, addressController.getDefaultAddress);

/**
 * 获取收货地址详情
 * GET /api/address/:id
 * @swagger
 * /api/address/{id}:
 *   get:
 *     summary: 获取收货地址详情
 *     tags: [收货地址]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 地址ID
 *     responses:
 *       200:
 *         description: 成功获取地址详情
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
 *                   example: 获取地址详情成功
 *                 data:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: 未授权，用户未登录
 *       404:
 *         description: 地址不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 地址不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', protect, addressController.getAddressDetail);

module.exports = router; 