/**
 * 应用错误类
 * 用于创建可操作的预期错误，统一错误格式
 */
class AppError extends Error {
    /**
     * 创建一个应用错误实例
     * @param {string} message - 错误消息
     * @param {number} statusCode - HTTP状态码
     * @param {boolean} isOperational - 是否为可操作性错误（预期内的错误）
     * @param {string} errorCode - 用于前端处理的错误代码
     */
    constructor(message, statusCode, isOperational = true, errorCode = '') {
        // 调用父类构造函数
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;
        this.errorCode = errorCode;

        // 捕获错误堆栈以便更好地调试
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError; 