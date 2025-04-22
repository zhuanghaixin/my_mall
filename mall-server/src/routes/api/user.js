/**
 * 用户相关API路由
 */
const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: 用户
 *   description: 用户相关接口
 */

/**
 * 微信登录
 * POST /api/user/wxlogin
 */
router.post('/wxlogin', userController.wxLogin);

/**
 * 手机号+验证码登录
 * POST /api/user/phonelogin
 */
router.post('/phonelogin', userController.phoneLogin);

/**
 * 微信手机号一键登录
 * POST /api/user/phonenumberlogin
 */
router.post('/phonenumberlogin', userController.phoneNumberLogin);

/**
 * 发送短信验证码
 * POST /api/user/sendsms
 */
router.post('/sendsms', userController.sendSmsCode);

/**
 * 获取用户信息
 * GET /api/user/info
 */
router.get('/info', auth, userController.getUserInfo);

/**
 * 更新用户信息
 * POST /api/user/info
 */
router.post('/info', auth, userController.updateUserInfo);

/**
 * 绑定手机号
 * POST /api/user/bindphone
 */
router.post('/bindphone', auth, userController.bindPhone);

/**
 * 检查登录状态
 * GET /api/user/checklogin
 */
router.get('/checklogin', auth, userController.checkLogin);

module.exports = router; 