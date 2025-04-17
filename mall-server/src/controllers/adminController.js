/**
 * 管理员控制器
 * 处理管理员相关的业务逻辑
 */
const { Admin } = require('../models');
const { generateToken } = require('../utils/jwtToken');
const catchAsync = require('../utils/catchAsync');
const { ValidationError, UnauthorizedError, NotFoundError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: 管理员ID
 *         username:
 *           type: string
 *           description: 用户名
 *         realName:
 *           type: string
 *           description: 真实姓名
 *         email:
 *           type: string
 *           description: 电子邮箱
 *         phone:
 *           type: string
 *           description: 手机号码
 *         avatar:
 *           type: string
 *           description: 头像URL
 *         role:
 *           type: string
 *           description: 角色
 *           enum: [admin, editor, viewer]
 *         status:
 *           type: string
 *           description: 状态
 *           enum: [active, inactive, locked]
 *         lastLoginTime:
 *           type: string
 *           format: date-time
 *           description: 最后登录时间
 *         lastLoginIp:
 *           type: string
 *           description: 最后登录IP
 *       example:
 *         id: 1
 *         username: admin
 *         realName: 系统管理员
 *         email: admin@example.com
 *         phone: '13800138000'
 *         avatar: 'https://example.com/avatar.jpg'
 *         role: admin
 *         status: active
 *         lastLoginTime: '2023-01-01T08:00:00.000Z'
 *         lastLoginIp: '127.0.0.1'
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: 管理员用户名
 *         password:
 *           type: string
 *           description: 管理员密码
 *       example:
 *         username: admin
 *         password: admin123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: 登录成功
 *         data:
 *           type: object
 *           properties:
 *             admin:
 *               $ref: '#/components/schemas/Admin'
 *             token:
 *               type: string
 *               description: JWT令牌
 *
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: fail
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 管理员登录
 *     tags: [管理员]
 *     description: 使用用户名和密码进行管理员登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 未授权（用户名或密码错误）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
        throw new ValidationError('请提供用户名和密码');
    }

    // 查找管理员
    const admin = await Admin.findOne({ where: { username } });

    // 如果管理员不存在或密码不匹配
    if (!admin || !(await admin.comparePassword(password))) {
        throw new UnauthorizedError('用户名或密码错误');
    }

    // 如果账号被锁定
    if (admin.status === 'locked') {
        throw new UnauthorizedError('账号已被锁定，请联系超级管理员');
    }

    // 如果账号不活跃
    if (admin.status === 'inactive') {
        throw new UnauthorizedError('账号未激活，请联系超级管理员');
    }

    // 更新最后登录信息
    admin.lastLoginIp = req.ip;
    admin.lastLoginTime = new Date();
    await admin.save();

    // 生成JWT令牌
    const token = generateToken({
        id: admin.id,
        username: admin.username,
        role: admin.role
    });

    logger.info(`管理员 ${username} 登录成功`);

    // 返回登录成功的信息和令牌
    res.status(200).json({
        status: 'success',
        message: '登录成功',
        data: {
            admin: {
                id: admin.id,
                username: admin.username,
                realName: admin.realName,
                email: admin.email,
                phone: admin.phone,
                avatar: admin.avatar,
                role: admin.role,
                status: admin.status,
                lastLoginTime: admin.lastLoginTime
            },
            token
        }
    });
});

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: 获取管理员个人资料
 *     tags: [管理员]
 *     description: 获取当前已登录管理员的资料信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取管理员信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     admin:
 *                       $ref: '#/components/schemas/Admin'
 *       401:
 *         description: 未授权（无效令牌）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 管理员不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
exports.getProfile = catchAsync(async (req, res, next) => {
    const admin = await Admin.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
    });

    if (!admin) {
        throw new NotFoundError('管理员不存在');
    }

    res.status(200).json({
        status: 'success',
        data: {
            admin
        }
    });
});

/**
 * 创建初始管理员账号（仅供系统初始化使用）
 */
exports.createInitialAdmin = async () => {
    try {
        const count = await Admin.count();

        // 只有在没有管理员账号时才创建初始账号
        if (count === 0) {
            await Admin.create({
                username: 'admin',
                password: 'admin123',
                realName: '系统管理员',
                role: 'admin',
                status: 'active'
            });
            logger.info('已创建初始管理员账号');
        }
    } catch (error) {
        logger.error('创建初始管理员账号失败:', error);
    }
}; 