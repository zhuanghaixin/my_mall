/**
 * 订单相关路由
 */
const express = require('express');
const orderController = require('../../controllers/orderController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 所有订单相关的路由都需要身份验证
router.use(protect);

// 创建订单
router.post('/', orderController.createOrder);

// 获取订单列表
router.get('/list', orderController.getOrderList);

// 获取订单详情
router.get('/:id', orderController.getOrderDetail);

// 取消订单
router.put('/:id/cancel', orderController.cancelOrder);

// 确认收货
router.put('/:id/confirm', orderController.confirmOrder);

// 删除订单
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
