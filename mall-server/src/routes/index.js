/**
 * 路由索引文件
 * 集中注册和导出所有API路由
 */
const express = require('express');
const adminRoutes = require('./adminRoutes');

const router = express.Router();

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