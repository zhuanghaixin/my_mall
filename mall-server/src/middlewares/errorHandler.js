/**
 * 全局错误处理中间件
 * 统一捕获和格式化API错误响应
 */
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

// 处理开发环境下的错误详情
const sendErrorDev = (err, res) => {
    logger.error('错误详情:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode
    });

    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
        errorCode: err.errorCode || ''
    });
};

// 处理生产环境下的错误详情（隐藏敏感信息）
const sendErrorProd = (err, res) => {
    // 可操作性错误，安全地发送给客户端
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            errorCode: err.errorCode || ''
        });
    }

    // 编程或未知错误，不泄露错误详情
    logger.error('非操作性错误:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode || 500
    });

    return res.status(500).json({
        status: 'error',
        message: '服务器内部错误，请稍后再试'
    });
};

// MongoDB错误处理
const handleCastErrorDB = (err) => {
    const message = `无效的${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// 处理重复字段错误
const handleDuplicateFieldsDB = (err) => {
    const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
    const message = `重复的字段值: ${value}，请使用其他值`;
    return new AppError(message, 400);
};

// 处理验证错误
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `无效的输入数据: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// JWT错误处理
const handleJWTError = () => new AppError('无效的令牌，请重新登录', 401);
const handleJWTExpiredError = () => new AppError('令牌已过期，请重新登录', 401);

// Sequelize错误处理
const handleSequelizeValidationError = (err) => {
    const errors = err.errors.map(e => e.message);
    const message = `数据验证失败: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
    // 替换可选链语法，兼容旧版Node.js
    const field = (err.errors && err.errors.length > 0 && err.errors[0].path) || '某字段';
    const message = `${field}已存在，请使用其他值`;
    return new AppError(message, 400);
};

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // 根据环境处理错误
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // 根据错误类型处理特定错误
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        // Sequelize错误处理
        if (err.name === 'SequelizeValidationError') error = handleSequelizeValidationError(err);
        if (err.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(err);

        sendErrorProd(error, res);
    }
};

module.exports = { errorHandler }; 