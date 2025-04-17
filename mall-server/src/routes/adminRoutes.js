/**
 * 管理员相关路由
 */
const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// 管理员登录接口
router.post('/login', adminController.login);

// 需要身份验证的路由
router.use(protect);

// 获取管理员个人资料
router.get('/profile', adminController.getProfile);

// 以下路由需要超级管理员权限
// router.use(restrictTo('admin'));

module.exports = router; 