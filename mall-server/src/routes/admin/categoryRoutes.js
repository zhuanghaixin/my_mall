/**
 * 分类管理相关路由
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');
const { verifyToken, checkPermission } = require('../../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: 分类管理
 *   description: 商品分类管理相关接口
 */

/**
 * @swagger
 * /api/admin/category/list:
 *   get:
 *     summary: 获取分类列表
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 */
router.get('/list', verifyToken, checkPermission('category:list'), categoryController.getCategoryList);

/**
 * @swagger
 * /api/admin/category/{id}:
 *   get:
 *     summary: 获取分类详情
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', verifyToken, checkPermission('category:info'), categoryController.getCategoryDetail);

/**
 * @swagger
 * /api/admin/category:
 *   post:
 *     summary: 创建分类
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, checkPermission('category:create'), categoryController.createCategory);

/**
 * @swagger
 * /api/admin/category/{id}:
 *   put:
 *     summary: 更新分类
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, checkPermission('category:update'), categoryController.updateCategory);

/**
 * @swagger
 * /api/admin/category/{id}:
 *   delete:
 *     summary: 删除分类
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verifyToken, checkPermission('category:delete'), categoryController.deleteCategory);

/**
 * @swagger
 * /api/admin/category/{id}/status:
 *   put:
 *     summary: 更新分类状态
 *     tags: [分类管理]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', verifyToken, checkPermission('category:update'), categoryController.updateCategoryStatus);

module.exports = router; 