/**
 * 商品管理相关路由
 */
const express = require('express');
const router = express.Router();
const productController = require('../../controllers/productController');
const { verifyToken, checkPermission } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: 商品管理
 *   description: 商品管理相关接口
 */

/**
 * @swagger
 * /api/admin/product/list:
 *   get:
 *     summary: 获取商品列表
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页条数
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 商品名称(模糊查询)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: 分类ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 商品状态(0-下架，1-上架)
 */
router.get('/list', verifyToken, checkPermission('product:list'), productController.getProductList);

/**
 * @swagger
 * /api/admin/product/{id}:
 *   get:
 *     summary: 获取商品详情
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 */
router.get('/:id', verifyToken, checkPermission('product:info'), productController.getProductDetail);

/**
 * @swagger
 * /api/admin/product:
 *   post:
 *     summary: 创建商品
 *     tags: [商品管理]
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
 *               - categoryId
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 description: 商品名称
 *               categoryId:
 *                 type: integer
 *                 description: 分类ID
 *               price:
 *                 type: number
 *                 description: 价格
 *               description:
 *                 type: string
 *                 description: 商品描述
 *               stock:
 *                 type: integer
 *                 description: 库存
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 商品图片
 *               status:
 *                 type: integer
 *                 description: 商品状态(0-下架，1-上架)
 */
router.post('/', verifyToken, checkPermission('product:create'), productController.createProduct);

/**
 * @swagger
 * /api/admin/product/{id}:
 *   put:
 *     summary: 更新商品
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 */
router.put('/:id', verifyToken, checkPermission('product:update'), productController.updateProduct);

/**
 * @swagger
 * /api/admin/product/{id}:
 *   delete:
 *     summary: 删除商品
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
 */
router.delete('/:id', verifyToken, checkPermission('product:delete'), productController.deleteProduct);

/**
 * @swagger
 * /api/admin/product/{id}/status:
 *   put:
 *     summary: 更新商品状态(上架/下架)
 *     tags: [商品管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 商品ID
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
 *                 description: 商品状态(0-下架，1-上架)
 */
router.put('/:id/status', verifyToken, checkPermission('product:update'), productController.updateProductStatus);

module.exports = router; 