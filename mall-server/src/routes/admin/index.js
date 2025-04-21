/**
 * 管理后台路由索引文件
 * 集中注册和导出所有管理后台API路由
 */
const express = require('express');
const router = express.Router();

// 导入各模块路由
const bannerRoutes = require('./bannerRoutes');
const categoryRoutes = require('./categoryRoutes');
const goodsRoutes = require('./goodsRoutes');
const userRoutes = require('./userRoutes');

// 注册各模块路由
router.use('/banner', bannerRoutes);
router.use('/category', categoryRoutes);
router.use('/goods', goodsRoutes);
router.use('/user', userRoutes);

module.exports = router; 