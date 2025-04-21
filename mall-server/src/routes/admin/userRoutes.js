/**
 * 用户管理相关路由
 * 
 * @swagger
 * tags:
 *   - name: 用户管理
 *     description: 用户管理相关的操作
 */
const express = require('express');
const userController = require('../../controllers/userController');
const { protect } = require('../../middlewares/authMiddleware');

const router = express.Router();

// 所有用户管理路由都需要管理员身份验证
router.use(protect);

// 获取用户列表
router.get('/list', userController.getUserList);

// 获取用户详情
router.get('/:id', userController.getUserDetail);

// 更新用户状态
router.put('/:id/status', userController.updateUserStatus);

// 重置用户密码
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router; 