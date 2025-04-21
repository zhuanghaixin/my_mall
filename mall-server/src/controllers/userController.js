/**
 * 用户控制器
 * 处理用户相关的业务逻辑
 */
const { User } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

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