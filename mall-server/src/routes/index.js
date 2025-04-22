/**
 * 路由索引文件
 * 集中注册和导出所有API路由
 */
const express = require('express');
const adminRoutes = require('./adminRoutes');
const adminModuleRoutes = require('./admin');
const uploadRoutes = require('./uploadRoutes');
const homeRoutes = require('./api/home');

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

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: 获取轮播图列表(小程序前端使用)
 *     tags: [小程序接口]
 *     description: 获取所有启用状态的轮播图，按排序值升序排列
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 轮播图ID
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: 轮播图标题
 *                         example: 夏季新品上市
 *                       image:
 *                         type: string
 *                         description: 图片地址
 *                         example: /uploads/banners/summer.jpg
 *                       url:
 *                         type: string
 *                         description: 跳转链接
 *                         example: /pages/goods/list?categoryId=1
 *                       sort:
 *                         type: integer
 *                         description: 排序值
 *                         example: 1
 *                       status:
 *                         type: integer
 *                         description: 状态(1表示启用)
 *                         example: 1
 *                       create_time:
 *                         type: string
 *                         format: date-time
 *                         description: 创建时间
 *                       update_time:
 *                         type: string
 *                         format: date-time
 *                         description: 更新时间
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
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
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

// 注册管理员认证相关路由
router.use('/admin', adminRoutes);

// 注册管理后台模块路由
router.use('/admin', adminModuleRoutes);

// 注册上传接口路由
router.use('/upload', uploadRoutes);

// 注册首页相关路由
router.use('/home', homeRoutes);

module.exports = router; 