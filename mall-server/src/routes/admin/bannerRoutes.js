/**
 * 轮播图管理路由
 * 
 * @swagger
 * tags:
 *   - name: 轮播图管理
 *     description: 轮播图相关的管理操作
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
 *         name: title
 *         schema:
 *           type: string
 *         description: 标题搜索
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 状态过滤
 *     responses:
 *       200:
 *         description: 成功获取轮播图列表
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
 *                         $ref: '#/components/schemas/Banner'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 15
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页条数
 *                       example: 10
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
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: 轮播图不存在
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
 *                   example: 轮播图不存在
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
 *                 example: 新品促销
 *               image:
 *                 type: string
 *                 description: 图片地址
 *                 example: /uploads/banners/promotion.jpg
 *               url:
 *                 type: string
 *                 description: 跳转链接
 *                 example: /pages/goods/detail?id=1
 *               sort:
 *                 type: integer
 *                 description: 排序值(值越小越靠前)
 *                 example: 1
 *               status:
 *                 type: integer
 *                 description: 状态(0禁用，1启用)
 *                 example: 1
 *     responses:
 *       201:
 *         description: 成功添加轮播图
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
 *                   example: 添加成功
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
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
 *                   example: 标题、图片和链接为必填项
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
 *       200:
 *         description: 成功更新轮播图
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
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: 轮播图不存在
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
 *                   example: 轮播图不存在
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
 *       404:
 *         description: 轮播图不存在
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
 *                   example: 轮播图不存在
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
 *                 example: 1
 *     responses:
 *       200:
 *         description: 成功更新轮播图状态
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
 *                   $ref: '#/components/schemas/Banner'
 *       400:
 *         description: 状态参数错误
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
 *                   example: 状态不能为空
 *       404:
 *         description: 轮播图不存在
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
 *                   example: 轮播图不存在
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
 *                 description: 排序值(值越小越靠前)
 *                 example: 2
 *     responses:
 *       200:
 *         description: 成功更新轮播图排序
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
 *                   $ref: '#/components/schemas/Banner'
 *       400:
 *         description: 排序参数错误
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
 *                   example: 排序值不能为空
 *       404:
 *         description: 轮播图不存在
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
 *                   example: 轮播图不存在
 */
router.put('/:id/sort', verifyToken, checkPermission('banner:update'), bannerController.updateBannerSort);

/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 轮播图ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 轮播图标题
 *           example: 夏季新品
 *         image:
 *           type: string
 *           description: 图片地址
 *           example: /uploads/banners/summer.jpg
 *         url:
 *           type: string
 *           description: 跳转链接
 *           example: /pages/goods/list?categoryId=1
 *         sort:
 *           type: integer
 *           description: 排序值
 *           example: 1
 *         status:
 *           type: integer
 *           description: 状态(0禁用，1启用)
 *           example: 1
 *         create_time:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         update_time:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

module.exports = router; 