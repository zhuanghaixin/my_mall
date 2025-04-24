/**
 * 身份验证中间件
 * 用于验证用户身份和权限
 */
const { verifyToken } = require('../utils/jwtToken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * 验证用户是否已登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
exports.protect = (req, res, next) => {
    try {
        // 获取请求头中的授权信息
        const authHeader = req.headers.authorization;
        let token;

        // 检查Authorization头部是否存在并正确格式化
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]; // 提取令牌部分
        }

        // 如果没有令牌，返回未授权错误
        if (!token) {
            return next(new UnauthorizedError('您未登录，请登录后访问'));
        }

        // 验证令牌并解码
        const decoded = verifyToken(token);
        console.log('解码后的用户信息:', decoded);
        // 将解码后的用户信息存储在请求对象中，供后续路由使用
        req.user = decoded;

        next();
    } catch (error) {
        next(error); // 传递错误到全局错误处理器
    }
};

/**
 * 限制访问特定角色
 * @param  {...string} roles - 允许访问的角色列表
 * @returns {Function} Express中间件函数
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // 必须在protect中间件之后使用，确保req.user存在
        if (!req.user) {
            return next(new UnauthorizedError('请先登录'));
        }

        // 检查用户角色是否在允许的角色列表中
        if (!roles.includes(req.user.role)) {
            logger.warn(`用户 ${req.user.username} 尝试访问无权限的资源`);
            return next(new ForbiddenError('您没有权限执行此操作'));
        }

        next();
    };
}; 