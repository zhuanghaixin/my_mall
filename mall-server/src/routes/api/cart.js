/**
 * 购物车相关API路由
 */
const express = require('express');
const router = express.Router();
console.log('cart.js');
const cartController = require('../../controllers/cartController');
const { protect } = require('../../middlewares/authMiddleware');
console.log('qqcart.js');
/**
 * @swagger
 * tags:
 *   name: 购物车
 *   description: 购物车相关接口
 */

/**
 * 获取购物车列表
 * GET /api/cart/list
 * @swagger
 * /api/cart/list:
 *   get:
 *     summary: 获取购物车列表
 *     tags: [购物车]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取购物车列表
 *       401:
 *         description: 未授权，用户未登录
 */
router.get('/list', protect, cartController.getCartList);

/**
 * 添加商品到购物车
 * POST /api/cart/add
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: 添加商品到购物车
 *     tags: [购物车]
 *     security:
 *       - bearerAuth: []
 */
router.post('/add', protect, cartController.addToCart);

/**
 * 更新购物车
 * POST /api/cart/update
 * @swagger
 * /api/cart/update:
 *   post:
 *     summary: 更新购物车商品数量或选中状态
 *     tags: [购物车]
 *     security:
 *       - bearerAuth: []
 */
router.post('/update', protect, cartController.updateCart);

/**
 * 删除购物车项
 * POST /api/cart/delete
 * @swagger
 * /api/cart/delete:
 *   post:
 *     summary: 删除购物车商品
 *     tags: [购物车]
 *     security:
 *       - bearerAuth: []
 */
router.post('/delete', protect, cartController.deleteCart);

/**
 * 清空购物车
 * POST /api/cart/clear
 * @swagger
 * /api/cart/clear:
 *   post:
 *     summary: 清空购物车
 *     tags: [购物车]
 *     security:
 *       - bearerAuth: []
 */
router.post('/clear', protect, cartController.clearCart);

/**
 * 更新购物车商品选中状态
 * POST /api/cart/check
 * @swagger
 * /api/cart/check:
 *   post:
 *     summary: 更新购物车商品选中状态
 *     tags: [购物车]
 *     security:
 *       - bearerAuth: []
 */
router.post('/check', protect, cartController.checkCart);

/**
 * 检查商品是否在购物车中
 * GET /api/cart/check/:goodsId
 * @swagger
 * /api/cart/check/{goodsId}:
 *   get:
 *     summary: 检查商品是否在购物车中
 *     tags: [购物车]
 *     parameters:
 *       - in: path
 *         name: goodsId
 *         required: true
 *         description: 商品ID
 */
router.get('/check/:goodsId', cartController.checkGoodsInCart);

/**
 * 获取购物车数量
 * GET /api/cart/count
 * @swagger
 * /api/cart/count:
 *   get:
 *     summary: 获取购物车数量
 *     tags: [购物车]
 */
// router.get('/count', cartController.getCartCount);

module.exports = router; 