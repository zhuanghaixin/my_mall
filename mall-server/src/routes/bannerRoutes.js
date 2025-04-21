/**
 * 轮播图相关路由
 * 
 * @swagger
 * tags:
 *   - name: 轮播图管理
 *     description: 轮播图相关的操作
 */
const express = require('express');
const bannerController = require('../controllers/bannerController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 所有轮播图管理路由都需要管理员身份验证
router.use(protect);

/**
 * @swagger
 * /api/admin/banner/list:
 *   get:
 *     summary: 获取轮播图列表 (带分页和搜索)
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
 */
router.get('/list', bannerController.getBannerList);

// 获取轮播图列表 (简单版本，保留向后兼容)
router.get('/', bannerController.getBannerList);

// 获取轮播图详情
router.get('/:id', bannerController.getBanner);

// 创建轮播图
router.post('/', bannerController.addBanner);

// 更新轮播图
router.put('/:id', bannerController.updateBanner);

// 删除轮播图
router.delete('/:id', bannerController.deleteBanner);

// 更新轮播图状态
router.put('/:id/status', bannerController.updateBannerStatus);

// 更新轮播图排序
router.put('/:id/sort', bannerController.updateBannerSort);

module.exports = router; 