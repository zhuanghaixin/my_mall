/**
 * 支付相关路由
 */
const express = require('express');
const payController = require('../../controllers/payController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 所有支付相关的路由都需要身份验证
router.use(protect);

// 获取微信支付参数
router.post('/wxpay', payController.getWxPayParams);

// 模拟支付接口
router.post('/mockpay', payController.mockPay);

// 查询支付状态
router.get('/status/:orderId', payController.getPayStatus);

// 支付成功回调通知（这个接口可以不需要保护，微信支付成功后会回调）
router.post('/notify', express.raw({ type: 'application/xml' }), payController.handlePayNotify);

module.exports = router; 