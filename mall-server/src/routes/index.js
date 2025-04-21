/**
 * 路由索引文件
 * 集中注册和导出所有API路由
 */
const express = require('express');
const adminRoutes = require('./adminRoutes');
const goodsRoutes = require('./goodsRoutes');
const categoryRoutes = require('./categoryRoutes');
const uploadRoutes = require('./uploadRoutes');
const bannerRoutes = require('./bannerRoutes');

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 健康检查接口
 *     tags: [系统]
 *     description: 检查API服务是否正常运行
 *     responses:
 *       200:
 *         description: 服务运行正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 服务运行正常
 *                 time:
 *                   type: string
 *                   format: date-time
 *                   description: 当前服务器时间
 */
// 健康检查接口
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '服务运行正常',
        time: new Date()
    });
});

// 小程序API接口 - 无需身份验证
router.get('/banners', async (req, res) => {
    try {
        const { Banner } = require('../models');
        // 只返回启用状态的轮播图
        const banners = await Banner.findAll({
            where: { status: 1 },
            order: [
                ['sort', 'ASC'],
                ['id', 'DESC']
            ]
        });

        res.status(200).json({
            code: 200,
            message: '获取成功',
            data: banners
        });
    } catch (error) {
        console.error('获取轮播图失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误',
            error: error.message
        });
    }
});

// 注册各模块路由
router.use('/admin', adminRoutes);
router.use('/admin/goods', goodsRoutes);
router.use('/admin/category', categoryRoutes);
router.use('/admin/banner', bannerRoutes);
router.use('/upload', uploadRoutes);

module.exports = router; 