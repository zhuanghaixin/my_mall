/**
 * 轮播图管理路由
 */
const express = require('express');
const bannerController = require('../../controllers/bannerController');
const { verifyToken, checkPermission } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 使用认证中间件，保证只有登录后的管理员才能访问这些接口
// router.use(authMiddleware.adminAuth);

/**
 * @swagger
 * /api/admin/banner:
 *   get:
 *     summary: 获取轮播图列表
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取轮播图列表
 */
router.get('/', verifyToken, checkPermission('banner:list'), bannerController.getBannerList);

/**
 * @swagger
 * /api/admin/banner/{id}:
 *   get:
 *     summary: 获取指定轮播图详情
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 轮播图ID
 *     responses:
 *       200:
 *         description: 成功获取轮播图详情
 */
router.get('/:id', verifyToken, checkPermission('banner:info'), bannerController.getBanner);

/**
 * @swagger
 * /api/admin/banner:
 *   post:
 *     summary: 添加新轮播图
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *               - url
 *             properties:
 *               title:
 *                 type: string
 *                 description: 轮播图标题
 *               image:
 *                 type: string
 *                 description: 图片地址
 *               url:
 *                 type: string
 *                 description: 跳转链接
 *               sort:
 *                 type: integer
 *                 description: 排序值
 *               status:
 *                 type: integer
 *                 description: 状态
 *     responses:
 *       201:
 *         description: 成功添加轮播图
 */
router.post('/', verifyToken, checkPermission('banner:create'), bannerController.addBanner);

/**
 * @swagger
 * /api/admin/banner/{id}:
 *   put:
 *     summary: 更新轮播图
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 轮播图ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *               url:
 *                 type: string
 *               sort:
 *                 type: integer
 *               status:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 成功更新轮播图
 */
router.put('/:id', verifyToken, checkPermission('banner:update'), bannerController.updateBanner);

/**
 * @swagger
 * /api/admin/banner/{id}:
 *   delete:
 *     summary: 删除轮播图
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 轮播图ID
 *     responses:
 *       200:
 *         description: 成功删除轮播图
 */
router.delete('/:id', verifyToken, checkPermission('banner:delete'), bannerController.deleteBanner);

/**
 * @swagger
 * /api/admin/banner/{id}/status:
 *   put:
 *     summary: 更新轮播图状态
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 轮播图ID
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
 *                 description: 状态：0禁用，1启用
 *     responses:
 *       200:
 *         description: 成功更新轮播图状态
 */
router.put('/:id/status', verifyToken, checkPermission('banner:update'), bannerController.updateBannerStatus);

/**
 * @swagger
 * /api/admin/banner/{id}/sort:
 *   put:
 *     summary: 更新轮播图排序
 *     tags: [轮播图管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 轮播图ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sort
 *             properties:
 *               sort:
 *                 type: integer
 *                 description: 排序值
 *     responses:
 *       200:
 *         description: 成功更新轮播图排序
 */
router.put('/:id/sort', verifyToken, checkPermission('banner:update'), bannerController.updateBannerSort);

module.exports = router; 