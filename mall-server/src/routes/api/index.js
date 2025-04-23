/**
 * API路由入口文件
 */
const express = require('express');
const userRoutes = require('./user');
const goodsRoutes = require('./goods');
const categoryRoutes = require('./category');
const addressRoutes = require('./address');
const cartRoutes = require('./cart');
const searchRoutes = require('./search');
const homeRoutes = require('./home');
const orderRoutes = require('./order');
const payRoutes = require('./pay');

const router = express.Router();

// 注册各个模块的路由
router.use('/user', userRoutes);
router.use('/goods', goodsRoutes);
router.use('/category', categoryRoutes);
router.use('/address', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/search', searchRoutes);
router.use('/home', homeRoutes);
router.use('/order', orderRoutes);
router.use('/pay', payRoutes);

module.exports = router;

