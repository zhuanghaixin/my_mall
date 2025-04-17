/**
 * 路由索引文件
 * 集中注册和导出所有API路由
 */
const express = require('express');
const adminRoutes = require('./adminRoutes');

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

// 注册各模块路由
router.use('/admin', adminRoutes);

module.exports = router; 