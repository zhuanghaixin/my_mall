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
 * 管理员登录
 * @route POST /api/admin/login
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
 * 获取当前登录的管理员信息
 * @route GET /api/admin/profile
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