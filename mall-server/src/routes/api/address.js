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
 *       401:
 *         description: 未授权，用户未登录
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
 *         description: 地址ID
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
 *         description: 地址ID
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
 *         description: 地址ID
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
 *         description: 地址ID
 */
router.get('/:id', protect, addressController.getAddressDetail);

module.exports = router; 