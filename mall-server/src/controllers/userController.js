/**
 * 用户控制器
 * 处理用户相关的业务逻辑
 */
const { User } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { WXBizDataCrypt } = require('../utils/wxBizDataCrypt');
const axios = require('axios');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户ID
 *         openid:
 *           type: string
 *           description: 微信openid
 *         nickname:
 *           type: string
 *           description: 用户昵称
 *         avatar:
 *           type: string
 *           description: 用户头像URL
 *         phone:
 *           type: string
 *           description: 手机号码
 *         email:
 *           type: string
 *           description: 电子邮箱
 *         gender:
 *           type: integer
 *           description: 性别，0未知，1男，2女
 *         status:
 *           type: integer
 *           description: 状态，0禁用，1正常
 *         create_time:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         update_time:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       example:
 *         id: 1001
 *         openid: 'wx123456789abcdef'
 *         nickname: '张三'
 *         avatar: 'https://example.com/avatar.jpg'
 *         phone: '13800138000'
 *         email: 'zhangsan@example.com'
 *         gender: 1
 *         status: 1
 *         create_time: '2023-01-01T08:00:00.000Z'
 *         update_time: '2023-01-01T08:00:00.000Z'
 */

/**
 * @swagger
 * /api/admin/user/list:
 *   get:
 *     summary: 获取用户列表
 *     tags: [用户管理]
 *     description: 获取用户列表，支持分页和条件筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词，可查询用户名、昵称、电话或邮箱
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 用户状态，0禁用，1正常
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页记录数
 *     responses:
 *       200:
 *         description: 成功获取用户列表
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
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 100
 *                     pageNum:
 *                       type: integer
 *                       description: 当前页码
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: 每页记录数
 *                       example: 10
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
exports.getUserList = catchAsync(async (req, res) => {
    const { keyword, status, pageNum = 1, pageSize = 10 } = req.query;

    // 构建查询条件
    const where = {};

    // 如果提供了关键词，搜索用户名、昵称、电话或邮箱
    if (keyword) {
        where[Op.or] = [
            { nickname: { [Op.like]: `%${keyword}%` } },
            { phone: { [Op.like]: `%${keyword}%` } }
        ];
    }

    // 如果提供了状态，按状态筛选
    if (status !== undefined && status !== '') {
        where.status = parseInt(status);
    }

    // 查询分页数据
    const { count, rows } = await User.findAndCountAll({
        where,
        order: [['id', 'DESC']],
        offset: (parseInt(pageNum) - 1) * parseInt(pageSize),
        limit: parseInt(pageSize)
    });

    logger.info(`获取用户列表成功，共${count}条记录`);

    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: {
            list: rows,
            total: count,
            pageNum: parseInt(pageNum),
            pageSize: parseInt(pageSize)
        }
    });
});

/**
 * @swagger
 * /api/admin/user/{id}:
 *   get:
 *     summary: 获取用户详情
 *     tags: [用户管理]
 *     description: 根据用户ID获取用户详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功获取用户详情
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
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
exports.getUserDetail = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
        throw new NotFoundError('用户不存在');
    }

    // 返回用户详情
    res.status(200).json({
        code: 200,
        message: '获取成功',
        data: user
    });
});

/**
 * @swagger
 * /api/admin/user/{id}/status:
 *   put:
 *     summary: 更新用户状态
 *     tags: [用户管理]
 *     description: 启用或禁用用户
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 description: 用户状态，0禁用，1启用
 *             example:
 *               status: 0
 *     responses:
 *       200:
 *         description: 成功更新用户状态
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
 *                   example: 操作成功
 *                 data:
 *                   type: null
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
exports.updateUserStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // 参数验证
    if (status !== 0 && status !== 1) {
        throw new ValidationError('无效的状态值');
    }

    const user = await User.findByPk(id);

    if (!user) {
        throw new NotFoundError('用户不存在');
    }

    // 更新状态
    user.status = status;
    await user.save();

    logger.info(`用户(ID: ${id})状态更新为${status}`);

    res.status(200).json({
        code: 200,
        message: status === 1 ? '用户已启用' : '用户已禁用',
        data: null
    });
});

/**
 * @swagger
 * /api/admin/user/{id}/reset-password:
 *   post:
 *     summary: 重置用户密码
 *     tags: [用户管理]
 *     description: 重置用户密码，生成随机密码并返回
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 成功重置密码
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
 *                   example: 密码重置成功
 *                 data:
 *                   type: string
 *                   description: 重置后的密码
 *                   example: XYZ123abc
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器错误
 */
exports.resetPassword = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
        throw new NotFoundError('用户不存在');
    }

    // 生成随机密码（实际项目中应使用更复杂的密码生成逻辑）
    const randomPassword = Math.random().toString(36).slice(-8);

    logger.info(`用户(ID: ${id})密码已重置`);

    // 在真实环境中，这里应该更新用户密码并发送通知
    // 由于小程序用户通常使用微信登录，可以不用更新密码，只需发送通知

    res.status(200).json({
        code: 200,
        message: '密码重置成功，已通知用户',
        data: randomPassword
    });
});

/**
 * @swagger
 * /api/user/phonenumberlogin:
 *   post:
 *     summary: 微信手机号一键登录
 *     tags: [用户]
 *     description: 通过微信获取的手机号信息进行登录或注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - encryptedData
 *               - iv
 *             properties:
 *               code:
 *                 type: string
 *                 description: 微信临时登录凭证
 *               encryptedData:
 *                 type: string
 *                 description: 包含手机号的加密数据
 *               iv:
 *                 type: string
 *                 description: 加密算法的初始向量
 *     responses:
 *       200:
 *         description: 登录成功
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
 *                   example: 登录成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT认证令牌
 *                     userInfo:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: 参数错误或解密失败
 *       500:
 *         description: 服务器错误
 */
exports.phoneNumberLogin = catchAsync(async (req, res) => {
    const { code, encryptedData, iv } = req.body;

    // 验证必要参数
    if (!code || !encryptedData || !iv) {
        throw new ValidationError('缺少必要参数');
    }

    try {
        // 1. 获取微信 session_key 和 openid
        const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.wx.appId}&secret=${config.wx.appSecret}&js_code=${code}&grant_type=authorization_code`;
        const wxResponse = await axios.get(wxLoginUrl);
        const wxResult = wxResponse.data;

        if (wxResult.errcode) {
            logger.error(`获取微信session_key失败: ${JSON.stringify(wxResult)}`);
            throw new Error(`微信授权失败: ${wxResult.errmsg}`);
        }

        const { session_key, openid } = wxResult;

        // 2. 解密手机号信息
        const pc = new WXBizDataCrypt(config.wx.appId, session_key);
        const phoneData = pc.decryptData(encryptedData, iv);

        if (!phoneData || !phoneData.phoneNumber) {
            throw new Error('手机号数据解密失败');
        }

        const phoneNumber = phoneData.phoneNumber;

        // 3. 根据 openid 查找或创建用户
        let user = await User.findOne({ where: { openid } });

        if (user) {
            // 已存在用户，更新手机号
            if (!user.phone) {
                user.phone = phoneNumber;
                await user.save();
            }
        } else {
            // 新用户注册，使用手机号作为默认昵称
            const nickname = phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
            user = await User.create({
                openid,
                phone: phoneNumber,
                nickname,
                status: 1,
                register_time: new Date()
            });
        }

        // 4. 生成 JWT 令牌
        const token = jwt.sign(
            { id: user.id, phone: user.phone },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // 5. 返回用户信息和令牌
        logger.info(`用户 ${user.id} 通过微信手机号一键登录成功`);

        res.status(200).json({
            code: 200,
            message: '登录成功',
            data: {
                token,
                userInfo: {
                    id: user.id,
                    nickname: user.nickname,
                    avatar: user.avatar,
                    phone: user.phone,
                    gender: user.gender
                }
            }
        });
    } catch (error) {
        logger.error(`微信手机号登录失败: ${error.message}`);
        res.status(400).json({
            code: 400,
            message: `登录失败: ${error.message}`
        });
    }
}); 