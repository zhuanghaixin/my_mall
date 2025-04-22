/**
 * 用户身份验证中间件
 * 用于小程序用户JWT认证
 */
const { verifyToken } = require('../utils/jwtToken');
const { UnauthorizedError } = require('../utils/errorTypes');
const logger = require('../utils/logger');

/**
 * 验证用户是否已登录
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const auth = (req, res, next) => {
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
            logger.warn('用户访问受保护接口未提供令牌');
            return next(new UnauthorizedError('请先登录'));
        }

        // 验证令牌并解码
        const decoded = verifyToken(token);

        // 将解码后的用户信息存储在请求对象中，供后续路由使用
        req.user = decoded;

        logger.info(`用户 ${req.user.id} 访问受保护接口`);
        next();
    } catch (error) {
        logger.error(`认证失败: ${error.message}`);
        next(new UnauthorizedError('认证失败，请重新登录'));
    }
};

module.exports = auth; 