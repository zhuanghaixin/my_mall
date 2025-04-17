/**
 * JWT工具函数
 * 用于生成和验证JSON Web Token
 */
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('./errorTypes');
const logger = require('./logger');

/**
 * 生成JWT令牌
 * 
 * @param {Object} payload - 要包含在令牌中的数据
 * @param {string} secret - 用于签名的密钥，默认使用环境变量
 * @param {string|number} expiresIn - 令牌过期时间
 * @returns {string} 生成的JWT令牌
 */
const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = process.env.JWT_EXPIRES_IN) => {
    try {
        return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
        logger.error('JWT令牌生成失败:', error);
        throw new Error('令牌生成失败');
    }
};

/**
 * 验证JWT令牌
 * 
 * @param {string} token - 要验证的JWT令牌
 * @param {string} secret - 用于签名的密钥，默认使用环境变量
 * @returns {Object} 解码后的令牌负载
 * @throws {UnauthorizedError} 令牌无效或已过期时抛出错误
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        logger.debug('JWT令牌验证失败:', { error: error.message });
        if (error.name === 'TokenExpiredError') {
            throw new UnauthorizedError('令牌已过期，请重新登录');
        }
        throw new UnauthorizedError('无效的令牌，请重新登录');
    }
};

module.exports = {
    generateToken,
    verifyToken
};
